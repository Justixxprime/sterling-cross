/**
 * Sterling & Cross — Legal Plan Application backend + admin dashboard API
 * -------------------------------------------------------------------------
 * This is the whole backend. It runs on Google's own servers, inside
 * your own Google account, for free. Nobody but you can delete it,
 * there's no third-party dashboard that can vanish overnight.
 *
 * What it does on every submission:
 *   1. Saves any uploaded files to a Google Drive folder
 *   2. Adds one row to a Google Sheet (the system of record) with every
 *      field, plus a link to each uploaded file
 *   3. Emails you a clean summary so you know the moment someone applies
 *
 * It also serves as the data API for admin-dashboard.html, the actual
 * stats/table/PDF-export dashboard, gated by a password that's
 * generated automatically the first time this runs (see getMyPassword
 * below), not hardcoded in this file.
 *
 * Setup instructions are in How-To-Set-Up-Google-Backend.md, this file
 * only needs the 3 values right below edited before it'll work.
 */

// ====================== EDIT THESE 3 LINES ======================
const NOTIFICATION_EMAIL = 'antonicharleswojcik@gmail.com'; // where new-application emails go
const DRIVE_FOLDER_NAME = 'Legal Plan Applications — Uploaded Documents';
const SHEET_TAB_NAME = 'Applications';
// ==================================================================
//
// Your dashboard password is NOT set here anymore, on first run it's
// generated for you automatically and stored securely in this Google
// project's own settings (not in this file, so it never ends up
// visible in your code). Run the ONE-TIME function `getMyPassword`
// (pick it from the function dropdown above, then click Run) to see
// it. You can change it any time, either from that same dropdown
// (`setMyPassword`) or right from the dashboard's Settings panel once
// you're signed in.

function getAdminSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('ADMIN_SECRET');
  if (!secret) {
    // first run ever, generate a real random password automatically so
    // nobody accidentally ships this with a guessable placeholder still
    // sitting in plain text
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('ADMIN_SECRET', secret);
  }
  return secret;
}

/**
 * Run this once by hand (function dropdown above → getMyPassword → Run)
 * any time you need to see your current dashboard password, it prints
 * to the execution log (View → Executions, or the log panel that opens
 * automatically after running it from the editor).
 */
function getMyPassword() {
  console.log('Your current dashboard password is: ' + getAdminSecret_());
}

/**
 * Run this once by hand to set your OWN password instead of the
 * random generated one, edit the value on the right of the equals
 * sign below, run it, then that's your new password going forward
 * (this only takes effect after you actually run this function, editing
 * the line alone does nothing).
 */
function setMyPassword() {
  const myNewPassword = 'CHANGE-THIS-AND-RUN-ME';
  PropertiesService.getScriptProperties().setProperty('ADMIN_SECRET', myNewPassword);
  console.log('Password updated. Your new dashboard password is: ' + myNewPassword);
}

// The order columns appear in the dashboard sheet. Anything submitted
// that isn't listed here still gets its own column automatically, added
// to the end, this list just controls the order for the fields we know
// about ahead of time.
const COLUMN_ORDER = [
  'Timestamp',
  'selectedPlan', 'billingCycle',
  'fullName', 'dateOfBirth', 'email', 'phone', 'city',
  'matterType', 'matterDetails', 'urgency', 'opposingParty',
  'contactMethod', 'bestTime', 'preferredLanguage', 'priorAttorney',
  'document1', 'document2', 'document3',
  'rentalAddress', 'monthlyRent', 'moveInDate', 'lengthOfOccupancy',
  'secureToday', 'leaseTakeover', 'securityDeposit', 'monthsUpfront',
  'otherApplicant18', 'pets', 'otherOccupants', 'occupations',
  'employerName', 'employerEin', 'timeAtAddress', 'currentRent',
  'landlordFirstName', 'landlordLastName', 'landlordPhone', 'cleaningHabits',
  'reasonForMoving', 'backgroundNote', 'trustNote', 'noticesReceived',
  'ref1FirstName', 'ref1LastName', 'ref1Phone', 'ref1Relationship',
  'ref2FirstName', 'ref2LastName', 'ref2Phone', 'ref2Relationship',
  'promoCode', 'additionalComments', 'signature',
];

function doPost(e) {
  try {
    // The application form sends its submission as ONE JSON string in
    // the raw POST body (Content-Type: text/plain), not as
    // multipart/form-data fields. This is deliberate: Apps Script's
    // e.parameter parsing for multipart/form-data is unreliable once a
    // field's value reaches the tens/hundreds of KB, exactly the size
    // of a base64-encoded photo or PDF, so uploaded documents (and
    // sometimes the whole submission) were being silently dropped
    // before ever reaching this script. Reading the whole request body
    // as one JSON string via e.postData.contents has no such per-field
    // size limit, this is the actual fix for that.
    //
    // The admin dashboard's small action requests (status changes,
    // password changes, deletions) still arrive the old way, as
    // regular multipart/form-data fields in e.parameter, since those
    // values are tiny and that path already works fine, so both are
    // supported here.
    let params;
    if (e.postData && e.postData.type === 'text/plain' && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // not JSON after all (or malformed), fall back to whatever
        // Apps Script parsed as ordinary form fields
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }

    // the dashboard also uses doPost (not doGet) to update a Status
    // cell, since that's a write action, route it separately here,
    // gated by the same secret the dashboard itself is gated by
    if (params.action === 'updateStatus') {
      return handleStatusUpdate_(e);
    }
    if (params.action === 'changePassword') {
      return handleChangePassword_(e);
    }
    if (params.action === 'deleteApplication') {
      return handleDeleteApplication_(e);
    }

    const folder = getOrCreateFolder_();
    const sheet = getOrCreateSheet_();

    const textFields = {};
    const fileLinks = {};

    // params now holds every submitted field, all of it plain strings,
    // files included, the frontend sends each uploaded file as 3 plain
    // text fields (name__base64, name__name, name__type) instead of a
    // real file object, this sidesteps Apps Script's inconsistent
    // handling of actual file blobs inside multipart bodies entirely,
    // by the time this code runs, everything is just text either way.
    // helpful when debugging: shows exactly what came through, check
    // View → Executions in the Apps Script editor and open a recent
    // run if you ever need to see this
    for (const key in params) {
      console.log(`${key}: ${typeof params[key]}`);
    }

    const fileFieldNames = new Set();
    for (const key in params) {
      if (key.endsWith('__base64')) fileFieldNames.add(key.slice(0, -'__base64'.length));
    }

    for (const key in params) {
      if (key.endsWith('__base64') || key.endsWith('__name') || key.endsWith('__type')) continue;
      textFields[key] = params[key];
    }

    fileFieldNames.forEach(fieldName => {
      const base64 = params[`${fieldName}__base64`];
      const filename = params[`${fieldName}__name`] || fieldName;
      const mimeType = params[`${fieldName}__type`] || 'application/octet-stream';
      if (!base64) return;
      const bytes = Utilities.base64Decode(base64);
      const blob = Utilities.newBlob(bytes, mimeType, filename);
      const file = folder.createFile(blob);
      file.setName(`${new Date().toISOString().slice(0, 10)} — ${textFields.fullName || 'applicant'} — ${filename}`);
      // files are private by default, viewable only by the exact
      // Google account that owns them, that means YOU can see them
      // fine while signed into that account, but the dashboard's
      // in-page preview needs this explicit share to actually
      // display anything rather than an access-denied page, this
      // does not make the file publicly searchable or listed
      // anywhere, only reachable by someone who already has the
      // exact link (which only the Sheet and dashboard contain)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileLinks[fieldName] = file.getUrl();
    });

    appendRow_(sheet, textFields, fileLinks);
    sendNotificationEmail_(textFields, fileLinks);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log it so it shows up in Apps Script's own Executions log, and
    // still respond with something so the site doesn't hang.
    console.error(err);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * The dashboard's data feed. Returns every application row as JSON,
 * gated by your dashboard password, if the secret doesn't match, this deliberately
 * returns the exact same generic error a network failure would, rather
 * than confirming "wrong password" vs "no such thing here", so a
 * stranger poking at the URL can't tell the difference.
 */
function doGet(e) {
  const secret = e.parameter && e.parameter.secret;
  if (!secret || secret !== getAdminSecret_()) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const sheet = getOrCreateSheet_();
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const headers = values[0];
    const rows = values.slice(1).map((row, i) => {
      const obj = { _row: i + 2 }; // actual sheet row number, needed for status updates
      headers.forEach((h, idx) => { obj[h] = row[idx]; });
      return obj;
    });
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleStatusUpdate_(e) {
  const secret = e.parameter.secret;
  if (!secret || secret !== getAdminSecret_()) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const rowNum = parseInt(e.parameter.row, 10);
  const newStatus = e.parameter.status;
  const validStatuses = ['New', 'Contacted', 'Enrolled', 'Declined'];
  if (!rowNum || !validStatuses.includes(newStatus)) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Bad request' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const sheet = getOrCreateSheet_();
  sheet.getRange(rowNum, 1).setValue(newStatus); // Status is always column A
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Lets the dashboard's own Settings panel change the password, without
 * needing to open the Apps Script editor at all. Requires the CURRENT
 * correct password to set a new one, exactly like changing a password
 * anywhere else, someone who doesn't already have access can't lock
 * you out or take it over just by finding this endpoint.
 */
function handleChangePassword_(e) {
  const currentSecret = e.parameter.secret;
  if (!currentSecret || currentSecret !== getAdminSecret_()) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const newPassword = (e.parameter.newPassword || '').trim();
  if (newPassword.length < 8) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Password must be at least 8 characters.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  PropertiesService.getScriptProperties().setProperty('ADMIN_SECRET', newPassword);
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Deletes an application entirely, the Sheet row and any uploaded
 * documents that went with it. This can't be undone, the dashboard
 * asks the person to confirm before ever sending this request.
 */
function handleDeleteApplication_(e) {
  const secret = e.parameter.secret;
  if (!secret || secret !== getAdminSecret_()) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const rowNum = parseInt(e.parameter.row, 10);
  if (!rowNum || rowNum < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Bad request' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const sheet = getOrCreateSheet_();
  if (rowNum > sheet.getLastRow()) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'That row no longer exists.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // trash any uploaded files that belonged to this application before
  // the row (and its file links) disappear for good
  const rowValues = sheet.getRange(rowNum, 1, 1, sheet.getLastColumn()).getValues()[0];
  rowValues.forEach(cell => {
    const id = driveIdFromUrl_(cell);
    if (id) {
      try { DriveApp.getFileById(id).setTrashed(true); } catch (err) { /* file already gone, ignore */ }
    }
  });

  sheet.deleteRow(rowNum);
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function driveIdFromUrl_(value) {
  const match = String(value || '').match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// ---------- helpers ----------

function getOrCreateFolder_() {
  const existing = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function getOrCreateSheet_() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    // running for the first time with no bound spreadsheet, this only
    // matters if you set this script up as a standalone project rather
    // than from within a spreadsheet, see the setup guide
    throw new Error('This script needs to be bound to a Google Sheet. Open the sheet, then Extensions → Apps Script.');
  }
  let sheet = ss.getSheetByName(SHEET_TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB_NAME);
    sheet.appendRow(['Status', ...COLUMN_ORDER]);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:Z1').setFontWeight('bold');
    // a Status column dropdown turns the sheet into a lightweight CRM,
    // update it by hand as applications move through your pipeline
    const statusRange = sheet.getRange('A2:A1000');
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['New', 'Contacted', 'Enrolled', 'Declined'], true)
      .setAllowInvalid(true)
      .build();
    statusRange.setDataValidation(rule);
  }
  return sheet;
}

function appendRow_(sheet, textFields, fileLinks) {
  // pick up the sheet's actual current header row, in case someone
  // added a column by hand later, instead of assuming COLUMN_ORDER is
  // still exactly right
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const knownHeaders = new Set(headerRow);

  // any field that showed up in this submission but isn't a column yet
  // (a new question added to the form later, for example) gets its own
  // new column automatically instead of silently getting dropped
  const allFieldNames = new Set([...Object.keys(textFields), ...Object.keys(fileLinks)]);
  allFieldNames.forEach(name => {
    if (!knownHeaders.has(name)) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(name);
      headerRow.push(name);
      knownHeaders.add(name);
    }
  });

  const row = headerRow.map(header => {
    if (header === 'Status') return 'New';
    if (header === 'Timestamp') return new Date();
    if (fileLinks[header]) return fileLinks[header];
    if (textFields[header] !== undefined) return textFields[header];
    return '';
  });

  sheet.appendRow(row);
}

function sendNotificationEmail_(textFields, fileLinks) {
  const name = textFields.fullName || 'Someone';
  const plan = textFields.selectedPlan || 'a plan';
  const subject = `New Legal Plan application — ${name}`;

  let body = `${name} just submitted a Legal Plan application for ${plan}.\n\n`;
  body += '— — —\n\n';
  for (const key in textFields) {
    if (!textFields[key]) continue;
    body += `${key}: ${textFields[key]}\n`;
  }
  if (Object.keys(fileLinks).length) {
    body += '\nUploaded documents:\n';
    for (const key in fileLinks) {
      body += `${key}: ${fileLinks[key]}\n`;
    }
  }
  body += '\n— — —\nFull record, including the Status column to track follow-up, is in the Applications sheet.';

  MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
}

/**
 * Run this once by hand from the Apps Script editor (select it from the
 * function dropdown, click Run) to confirm the email and sheet setup
 * work before wiring up the real site, it fakes a submission exactly
 * the way the real form now sends one: a single JSON string in
 * e.postData.contents, with Content-Type text/plain, not
 * multipart/form-data fields. If this succeeds but real submissions
 * from the live site still don't show up, the problem is the URL
 * pasted into data-endpoint-url in consultation.html, not this script.
 */
function testSubmission() {
  const fakePayload = {
    selectedPlan: 'Individual Plus Plan, $89/mo',
    billingCycle: 'Monthly',
    fullName: 'Test Applicant',
    email: 'test@example.com',
    phone: '+13125550142',
    matterType: 'Family Law',
    matterDetails: 'This is a test submission from testSubmission().',
    // a tiny 1x1 pixel PNG, base64-encoded, to confirm file handling
    // works end to end without needing a real document on hand
    document1__base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    document1__name: 'test-image.png',
    document1__type: 'image/png',
  };
  const fakeEvent = {
    parameter: {},
    postData: {
      type: 'text/plain',
      contents: JSON.stringify(fakePayload),
    },
  };
  const result = doPost(fakeEvent);
  console.log(result.getContent());
  console.log('Now check: the Applications sheet for a new row, the Drive folder "' + DRIVE_FOLDER_NAME + '" for test-image.png, and your inbox for the notification email.');
}

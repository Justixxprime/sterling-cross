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
 * stats/table/PDF-export dashboard, gated by the ADMIN_SECRET below.
 *
 * Setup instructions are in How-To-Set-Up-Google-Backend.md, this file
 * only needs the 4 values right below edited before it'll work.
 */

// ====================== EDIT THESE 4 LINES ======================
const NOTIFICATION_EMAIL = 'you@sterlingcross.law'; // where new-application emails go
const DRIVE_FOLDER_NAME = 'Legal Plan Applications — Uploaded Documents';
const SHEET_TAB_NAME = 'Applications';
// A long random password that protects the admin dashboard, only
// people who know this can view applicant data. Make this long and
// random, e.g. mash the keyboard for 30+ characters, this is the only
// thing standing between the public internet and your applicants'
// personal information, don't leave it as the placeholder below.
const ADMIN_SECRET = 'CHANGE-THIS-TO-A-LONG-RANDOM-PASSWORD';
// ==================================================================

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
    // the dashboard also uses doPost (not doGet) to update a Status
    // cell, since that's a write action, route it separately here,
    // gated by the same secret the dashboard itself is gated by
    if (e.parameter && e.parameter.action === 'updateStatus') {
      return handleStatusUpdate_(e);
    }

    const folder = getOrCreateFolder_();
    const sheet = getOrCreateSheet_();

    const textFields = {};
    const fileLinks = {};

    // e.parameter holds every submitted field. For a normal text/select/
    // radio field the value is a plain string. For a <input type="file">
    // field, Apps Script hands us an actual Blob instead, that's how we
    // tell the two apart below, no separate "files" object to dig through.
    const params = e.parameter || {};
    for (const key in params) {
      const value = params[key];
      if (value && typeof value.getName === 'function' && typeof value.getBytes === 'function') {
        // it's an uploaded file, only save it if something was actually chosen
        if (value.getBytes().length > 0) {
          const file = folder.createFile(value);
          file.setName(`${new Date().toISOString().slice(0, 10)} — ${textFields.fullName || 'applicant'} — ${value.getName()}`);
          fileLinks[key] = file.getUrl();
        }
      } else {
        textFields[key] = value;
      }
    }

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
 * gated by ADMIN_SECRET, if the secret doesn't match, this deliberately
 * returns the exact same generic error a network failure would, rather
 * than confirming "wrong password" vs "no such thing here", so a
 * stranger poking at the URL can't tell the difference.
 */
function doGet(e) {
  const secret = e.parameter && e.parameter.secret;
  if (!secret || secret !== ADMIN_SECRET) {
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
  if (!secret || secret !== ADMIN_SECRET) {
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
 * the way the real form would send one.
 */
function testSubmission() {
  const fakeEvent = {
    parameter: {
      selectedPlan: 'Individual Plus Plan, $89/mo',
      billingCycle: 'Monthly',
      fullName: 'Test Applicant',
      email: 'test@example.com',
      phone: '+13125550142',
      matterType: 'Family Law',
      matterDetails: 'This is a test submission from testSubmission().',
    }
  };
  const result = doPost(fakeEvent);
  console.log(result.getContent());
}

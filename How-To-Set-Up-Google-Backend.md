# How to Set Up the Google Backend — Ultra Baby Steps

This replaces Basin, then Forminit, both third-party services, both of
which caused real problems (Basin's messages never showed up, Forminit's
form got deleted outright). This new setup lives entirely inside **your
own Google account**. Nobody else can delete it, there's no free-tier
quota to run into, and instead of a separate dashboard website to check,
submissions land directly in a Google Sheet you already know how to use,
plus an email the moment each one comes in.

**Total setup time: about 15 minutes, no coding.** You're pasting one
file of code into Google's own editor, not writing anything yourself.

---

## What you're building

- A **Google Sheet** that's the actual dashboard, one row per
  application, with a Status column (New / Contacted / Enrolled /
  Declined) you update by hand as you work through them
- A **Google Drive folder** that uploaded documents get saved into
  automatically, with a link to each file right in the matching sheet row
- An **email** sent to you the instant someone submits

All three happen from one small script, running for free on Google's
servers.

---

## STEP 1: Create the dashboard spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a
   **Blank spreadsheet**.
2. Name it something like `Legal Plan Applications` (click the "Untitled
   spreadsheet" text at the top left to rename it).
3. Leave it empty otherwise, the script builds its own tab and headers
   automatically the first time it runs.

## STEP 2: Attach the script to that spreadsheet

1. In that same spreadsheet, click **Extensions → Apps Script** in the
   menu bar. This opens a new tab with a code editor, already connected
   to your sheet.
2. You'll see a file called `Code.gs` with some placeholder text in it,
   select all of it (Ctrl+A or Cmd+A) and delete it.
3. Open the `backend/Code.gs` file from this project, copy its entire
   contents, and paste it into that empty editor.
4. At the very top of the script, under `EDIT THESE 3 LINES`, change:
   - `NOTIFICATION_EMAIL` to the real inbox you want new-application
     emails sent to
   - `DRIVE_FOLDER_NAME` if you'd like a different folder name than the
     default (optional, the default is fine)
   - `SHEET_TAB_NAME` if you'd like a different tab name than
     `Applications` (optional, the default is fine)
5. Click the **save icon** (or Ctrl+S / Cmd+S). Give the project a name
   when it asks, like `Legal Plan Backend`.

## STEP 3: Test it before going live

1. In the toolbar at the top of the Apps Script editor, find the
   function dropdown (it probably says `doPost`), change it to
   **`testSubmission`**.
2. Click **Run**.
3. The first time, Google will ask you to authorize the script, since
   it needs permission to read/write your Sheet, save files to your
   Drive, and send email **on your behalf, from your own account**.
   Click through: "Review permissions" → pick your Google account → you'll
   see a screen saying "Google hasn't verified this app", click
   **Advanced** → **Go to Legal Plan Backend (unsafe)**. This warning is
   normal and expected for any script you write yourself, it's not a
   sign anything is wrong, Google shows it for any script that hasn't
   been through their public-app review process, which only matters for
   apps published to strangers, not a private script running in your own
   account for your own firm.
4. Once it runs, check three things:
   - Your spreadsheet now has an `Applications` tab with a test row in it
   - You received a test email
   - A `Legal Plan Applications — Uploaded Documents` folder now exists
     in your Google Drive (this particular test doesn't upload a file,
     so the folder will be empty, that's expected)

If all three happened, the backend itself is working, the only thing
left is connecting the real website to it.

## STEP 4: Deploy it as a live web address

1. Still in the Apps Script editor, click the blue **Deploy** button,
   top right → **New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Fill in:
   - Description: anything, like `v1`
   - Execute as: **Me** (your account)
   - Who has access: **Anyone**

   That last setting looks alarming but is correct and safe: it means
   anyone can *send* the form a submission (which is the whole point,
   your site visitors aren't logged into Google), not that anyone can
   *read* your sheet or Drive folder, those stay private to you
   regardless of this setting.
4. Click **Deploy**.
5. It'll show you a **Web app URL**, looks like
   `https://script.google.com/macros/s/AKfycb.../exec`. **Copy that
   entire URL.**

## STEP 5: Paste the URL into the site

1. Open `consultation.html` in a plain text editor.
2. Search (Ctrl+F) for:

   ```
   YOUR_GOOGLE_SCRIPT_URL
   ```

3. You'll find it in the application form's opening tag:

   ```html
   <form data-endpoint-url="YOUR_GOOGLE_SCRIPT_URL" enctype="multipart/form-data" id="applicationForm" method="POST">
   ```

4. Replace `YOUR_GOOGLE_SCRIPT_URL` with the real URL you copied in Step
   4. Don't touch anything else on that line.

## STEP 6: Test the real form, end to end

1. Save and open `consultation.html` in your browser.
2. Fill out the whole application with fake test info (write "TEST" in
   the name field), upload a small file on the legal-needs step to
   confirm that path works too.
3. Submit it.
4. Check your Sheet, your email, and your Drive folder, the same three
   things as Step 3, this time with the real form and a real uploaded
   file.

If the row, email, and file all show up, you're done, the form is live.

---

## STEP 7: Set up the admin dashboard

The dashboard (`admin-dashboard.html`) is a separate page that reads
from the same Sheet you just set up, with stats, a searchable table,
per-application detail views, file previews, and a "Download as PDF"
button, all gated behind a password so applicant data isn't public.

The dashboard already has your Web app URL from Step 4 built in, so
signing in only ever asks for a password, nothing else to paste in
each time.

1. In the Apps Script editor, use the function dropdown at the top
   (it probably says `doPost`) and switch it to **`getMyPassword`**,
   then click **Run**.
2. The first time you do this, it generates a real random password
   automatically, there's nothing to type or invent. Approve the
   permissions prompt if it asks (same one-time "unverified app"
   screen from Step 3, same reason, this is your own private script).
3. Open **View → Logs** (or the log panel that pops up automatically),
   you'll see a line like `Your current dashboard password is:
   a1b2c3d4-....` Copy that whole string.
4. Open `admin-dashboard.html` in your browser and paste that password
   into the sign-in screen. That's the only field there is.

Prefer to pick your own password instead of the random one? Switch the
function dropdown to **`setMyPassword`** instead, edit the
`myNewPassword` line inside that function in the code first, then Run
it, that becomes your password from then on.

Once you're signed in, your browser remembers the password, so you
won't need to re-enter it every visit, just bookmark
`https://yourdomain.com/admin-dashboard.html` directly (it's not linked
anywhere in the site's navigation on purpose, since it's an internal
tool, not something visitors should stumble into).

### Changing your password later

No need to go back into the Apps Script editor for this, click
**Settings** in the dashboard's own top bar, enter your current
password plus a new one (8+ characters), and save, it takes effect
immediately, including on any other device you're signed in on (they'll
just need the new password next time they open it).

### What you can do from the dashboard

- **Stats at a glance**: total applications, new this week, how many are
  still awaiting follow-up, and your conversion rate
- **Applications over time, by plan, by matter type, by pipeline
  status**, all computed live from whatever's in the Sheet
- **Search and filter** the table by name, email, phone, status, or plan
- **Click any row** to open the full application, every field they
  submitted, organized into sections
- **Change status** right from that detail view (New → Contacted →
  Enrolled → Declined), it saves back to the Sheet immediately
- **View or download uploaded documents** directly from Drive
- **Download as PDF**: opens your browser's print dialog formatted as a
  clean document, choose "Save as PDF" as the destination instead of a
  physical printer

### A real limitation worth knowing about

Because the dashboard and your Apps Script backend live on two different
web addresses, the browser treats this as a cross-origin request. Simple
GET requests like this one are allowed to go through and be read by the
page (this is standard, well-established behavior for Apps Script Web
Apps, used by many people this same way), but it's worth actually testing
Step 7 for real rather than assuming, if the dashboard shows a spinner
that never resolves or an immediate sign-in error even with the right
password, that cross-origin behavior is the first thing to check, and
letting me know exactly what you see will help track it down.


---

## Using the dashboard day to day

Every new application lands as a new row with **Status: New**. Click
that cell and you'll see a dropdown (New / Contacted / Enrolled /
Declined), update it as you work through applications, this is now your
whole pipeline view, sort or filter by any column, star or color-code
rows, whatever you'd normally do in a spreadsheet.

## If a new question gets added to the form later

You don't have to touch the script. Any field submitted that isn't
already a column gets added as a brand new column automatically the
first time it shows up. The only reason to open `Code.gs` again is to
change where notification emails go, or to reorder the `COLUMN_ORDER`
list near the top so new fields land in a tidier spot instead of at the
far right.

## If something's not working

Two most common causes:

1. **Step 5 wasn't saved correctly** — reopen `consultation.html` and
   search for `YOUR_GOOGLE_SCRIPT_URL` again, if it still finds a match,
   the swap didn't take.
2. **"Who has access" wasn't set to Anyone** in Step 4 — this is the
   single most common mistake, a script left on a more restricted
   setting will silently reject submissions from your site visitors,
   since they aren't logged into your Google account. Go back to Deploy
   → Manage deployments → edit (pencil icon) → double check that
   setting.

### If uploaded documents aren't showing up, or won't open

Every uploaded file is set to "Anyone with the link can view" the
moment it's saved, specifically so the dashboard's file previews and
download links work without you needing to be signed into a particular
Google account, this isn't a public listing, someone would still need
the exact link, which only exists in your Sheet and dashboard, but it
does mean the file isn't locked to just your account either.

If a document still doesn't appear after that:
1. Check the Sheet itself first, is there a link in that application's
   `document1`/`document2`/`document3` column at all? If the column is
   empty, the file never made it to Drive in the first place, if there's
   a link there, the file exists, and the issue is more likely the
   dashboard's preview specifically, not the upload.
2. Check the Apps Script **Executions** log (left sidebar in the Apps
   Script editor) for the submission in question, click into it, `Code.gs`
   logs the name and type of every field it receives, including files,
   which tells you definitively whether a file arrived at all.
3. If the link exists but the dashboard's inline preview shows a blank
   box, click **"View / Download"** to open it directly in Drive
   instead, that always works even in the rare case the embedded
   in-page preview doesn't for a particular file type.

One real limitation worth knowing: because Google Apps Script doesn't
send back the usual browser permission headers (called CORS), the site
can't actually read *back* whether your script says the submission
succeeded, it can only tell whether the request left the browser
successfully at all. In practice this is extremely reliable, if the
Wi-Fi/network connection is fine, the submission goes through, but it
does mean a mistake inside the script itself (a typo after you edit it,
for instance) could fail silently from the visitor's point of view, they'd
still see the success screen. If you ever edit `Code.gs`, re-run
`testSubmission` afterward (Step 3) before trusting it again.

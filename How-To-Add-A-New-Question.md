# How to Add a New Question (and See It on the Dashboard) — Ultra Baby Steps

Good news: adding a new question touches at most 3 files, none of it is
real programming, it's copy-pasting a block that already exists and
changing a few words. No step here requires touching `Code.gs`'s actual
logic, only the small lists near the top of it.

**The 3 files, and why each one matters:**

| File | What it's for | Do you need to touch it? |
|---|---|---|
| `consultation.html` | The actual question the applicant sees and fills in | **Always** |
| `admin-dashboard.html` | Makes the answer show up nicely in the dashboard's detail view | **Always**, if you want it visible there |
| `backend/Code.gs` | Controls what column the answer lands in on the Sheet | **Optional**, only if you care about column order |

Here's the thing worth understanding up front: the backend already
**auto-detects brand new fields** and adds them as a new column on the
Sheet automatically, the first time someone submits one. So if you skip
`Code.gs` entirely, nothing breaks, the data still gets saved, it just
lands in a column at the far right instead of somewhere tidier. The one
file that's NOT automatic is the dashboard's detail view, if you skip
that step, the answer will exist in the Sheet and in the raw data, but
won't appear when you click into an application on the dashboard, it'll
just be silently skipped over. That's the step people are most likely to
forget, so it gets its own clearly marked section below.

---

## STEP 1: Decide the question type and give it a name

Pick a short, unique, no-spaces, no-punctuation name for your question,
written in "camelCase" (first word lowercase, each word after that
capitalized), matching how every other field on this form is named.
Examples already in use: `fullName`, `matterType`, `preferredLanguage`.

For a new one, something like **"How did you hear about us?"** would
become: `referralSource`.

This name is what shows up as the column header in your Sheet and as the
`key` the dashboard looks for, so pick it once and don't rename it later
without updating all 3 files to match.

Decide the question type too, this determines which HTML block you copy
in Step 2:
- **Short answer** (a name, a number, a short phrase) → text input
- **Pick one from a list** → dropdown select
- **Pick one, but you want the options visible without opening anything**
  → radio buttons
- **Yes/No, or "check if true"** → radio buttons (Yes/No) or a single
  checkbox
- **A few sentences** → textarea

---

## STEP 2: Add the question to `consultation.html`

Open `consultation.html` in a text editor. Every existing question in the
**Legal Needs** step lives inside `<div id="panel-needs">`, look inside
that section for a natural spot near the most similar existing question,
that's where you'll paste your new one. (Same idea if you're adding to
the Details step, look inside `<div id="panel-details">` instead.)

Copy whichever block below matches the type you picked in Step 1, paste
it into that spot, then change the label text and the `name` value
(twice, if you're doing radio buttons).

**Short answer (text input):**
```html
<div class="mb-6">
<label class="block text-sm font-bold mb-1.5">How did you hear about us</label>
<input class="w-full border border-ink/15 rounded-lg px-4 py-3" name="referralSource" type="text"/>
</div>
```

**Dropdown select:**
```html
<div class="mb-6">
<label class="block text-sm font-bold mb-1.5">How did you hear about us</label>
<select class="w-full border border-ink/15 rounded-lg px-4 py-3" name="referralSource">
<option value="">-- Select one --</option>
<option>Google search</option>
<option>Friend or family referral</option>
<option>Social media</option>
<option>Other</option>
</select>
</div>
```

**Radio buttons:**
```html
<div class="mb-6">
<label class="block text-sm font-bold mb-1.5">How did you hear about us</label>
<div class="flex gap-4 text-sm">
<label class="flex items-center gap-2"><input name="referralSource" type="radio" value="Google search"/> Google search</label>
<label class="flex items-center gap-2"><input name="referralSource" type="radio" value="Referral"/> Referral</label>
<label class="flex items-center gap-2"><input name="referralSource" type="radio" value="Social media"/> Social media</label>
</div>
</div>
```

**A few sentences (textarea):**
```html
<div class="mb-6">
<label class="block text-sm font-bold mb-1.5">Anything else we should know</label>
<textarea class="w-full border border-ink/15 rounded-lg px-4 py-3" name="referralSource" rows="3"></textarea>
</div>
```

A few things that matter:
- Every field type above uses `name="referralSource"`, change that one
  word (in every `<input>`/`<select>`/`<textarea>` in the block, radio
  buttons repeat it 3 times) to your own field name from Step 1.
- Want it mandatory before they can continue? Add `required=""` right
  after the `name="..."` attribute. Leave it off and it's optional,
  which is usually the friendlier default.
- Don't reuse a `name` that's already used elsewhere on the form
  (`fullName`, `email`, `matterType`, etc.), if you're not sure, search
  the file for it first (Ctrl+F).

Save the file. **The question is now live on the site and will save to
your Sheet the moment someone fills it in**, even if you stop here and
skip the remaining steps. Steps 3 and 4 are about making it show up
nicely elsewhere, not about whether it gets captured at all.

---

## STEP 3 (optional): Control where it lands in the Sheet

If you don't touch this, your new answer still gets saved, just as a
new column at the far right of the Sheet the first time it's submitted.
That's completely fine to leave as-is. If you'd rather it land somewhere
tidier, next to related questions:

1. Open `backend/Code.gs` in the Apps Script editor (Extensions → Apps
   Script, from inside your Google Sheet).
2. Find the `COLUMN_ORDER` list near the top, it's just a list of field
   names in the order they appear as columns.
3. Add your new field name into that list, wherever you'd like it to sit.
   For example, to put `referralSource` right after `matterDetails`:

   ```javascript
   'matterType', 'matterDetails', 'referralSource', 'urgency', 'opposingParty',
   ```

4. Save, then **Deploy → Manage deployments → edit (pencil) → New
   version → Deploy**, same as any time you change this file, editing
   alone doesn't publish the change.

This only affects new rows going forward, it won't reorder columns for
applications that already came in.

---

## STEP 4: Make it show up on the dashboard (the step people forget)

Open `admin-dashboard.html` in a text editor and search (Ctrl+F) for:

```
FIELD_GROUPS
```

You'll see something like this, a list of sections, each with a list of
`[fieldName, "Label shown on screen"]` pairs:

```javascript
const FIELD_GROUPS = [
  { title: 'Plan', fields: [['selectedPlan','Plan selected'],['billingCycle','Billing cycle']] },
  { title: 'Applicant', fields: [['fullName','Full name'], ... ] },
  { title: 'Legal Needs', fields: [['matterType','Matter type'],['matterDetails','Details'], ... ] },
  ...
];
```

Find the section your new question belongs under (probably `Legal
Needs`, for the example used throughout this guide), and add your field
to that section's `fields` list:

```javascript
{ title: 'Legal Needs', fields: [['matterType','Matter type'],['matterDetails','Details'],['referralSource','How they heard about us'], ... ] },
```

The first value in each pair (`'referralSource'`) has to match the exact
`name` you used in Step 2, letter for letter. The second value
(`'How they heard about us'`) is just the friendly label shown on
screen, and can be worded however you like, it doesn't need to match the
question text exactly.

Save the file. That's it, no redeploying needed for this one, since
`admin-dashboard.html` is a plain page on your site, not something
running on Google's servers.

### Want a whole new section instead of adding to an existing one?

Add a new entry to the `FIELD_GROUPS` list itself, following the same
shape:

```javascript
{ title: 'Marketing', fields: [['referralSource','How they heard about us']] },
```

Sections appear on the dashboard in the same order they're listed here,
top to bottom.

### If your new question is a file upload

File uploads need one more small step. Search
`admin-dashboard.html` for:

```
const FILE_FIELDS = ['document1', 'document2', 'document3'];
```

Add your new field's name to that list too, this is what tells the
dashboard "this one's a file, show a View/Download link" instead of
trying to print it as plain text. Everything else about it (adding the
`<input type="file">` to `consultation.html`) works the same as the
existing 3 document upload slots, copy one of those and rename it.

---

## STEP 5: Test it before trusting it

1. Open `consultation.html`, fill out a full test application (write
   "TEST" in the name field), making sure to answer your new question.
2. Submit it.
3. Check your Sheet, a new column should exist with your answer in it
   (or your answer should be in the column you specified, if you did
   Step 3).
4. Open `admin-dashboard.html`, click into that test application, your
   new question should appear with its friendly label, under whichever
   section you put it in.

If the Sheet has it but the dashboard doesn't show it, that almost
always means Step 4 got skipped, or the field name doesn't match
exactly between `consultation.html` and `FIELD_GROUPS` (a common typo:
matching case matters, `referralsource` and `referralSource` are treated
as two different fields entirely).

---

## Full worked example, start to finish

Adding "How did you hear about us?" as a dropdown, placed right after
the matter details question, filed under the existing Legal Needs
section:

**In `consultation.html`**, inside `<div id="panel-needs">`, right after
the `matterDetails` textarea's closing `</div>`:
```html
<div class="mb-6">
<label class="block text-sm font-bold mb-1.5">How did you hear about us</label>
<select class="w-full border border-ink/15 rounded-lg px-4 py-3" name="referralSource">
<option value="">-- Select one --</option>
<option>Google search</option>
<option>Friend or family referral</option>
<option>Social media</option>
<option>Other</option>
</select>
</div>
```

**In `backend/Code.gs`** (optional), in `COLUMN_ORDER`:
```javascript
'matterType', 'matterDetails', 'referralSource', 'urgency',
```
Then redeploy (Deploy → Manage deployments → New version).

**In `admin-dashboard.html`**, in `FIELD_GROUPS`:
```javascript
{ title: 'Legal Needs', fields: [['matterType','Matter type'],['matterDetails','Details'],['referralSource','How they heard about us'],['urgency','Urgency'], ... ] },
```

Submit a test application, check the Sheet and the dashboard, done.

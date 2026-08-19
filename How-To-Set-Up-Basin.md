# How to Set Up Basin for the Consultation Form — Ultra Baby Steps

Good news first: **this whole thing is about 10 minutes, no coding required, and you never have to touch any file besides the one line this guide points you to.**

## Why this form needs a different setup than the rest of the site

Every other form on the site (the contact form, the newsletter signup) already works out of the box on Web3Forms, with a real key already filled in. The consultation form is the one exception, because it has 3 photo/document upload fields, and Web3Forms' free plan doesn't support file uploads at all, that's a paid-only feature on their pricing page. So that one form specifically was pointed at **Basin** (usebasin.com) instead, whose free plan genuinely includes file uploads: 50 submissions a month and 100MB of uploads, confirmed directly against Basin's own pricing table, no credit card required to sign up.

Right now the form is wired up correctly on the code side, but it's still pointing at a placeholder address. It won't send anywhere until you swap that one line for your real one, which is everything this guide walks you through.

---

## STEP 1: Create a free Basin account

1. Go to [usebasin.com](https://usebasin.com).
2. Click the sign-up button (no credit card asked for on the free plan).
3. Verify your email if it asks you to.

## STEP 2: Create your form

1. Once you're logged in, look for a button like **"New Form"** or **"Create Form"**.
2. Give it a name, something like `Sterling & Cross Consultation Intake` — this name is just for your own dashboard, it never shows to site visitors.
3. Basin will generate a unique web address for this form, something that looks like:

   ```
   https://usebasin.com/f/a1b2c3d4e5f6
   ```

   That string of letters and numbers after `/f/` is unique to your account, nobody else has the same one. **Copy this whole address**, you'll need it in Step 3.

## STEP 3: Paste your real address into the site

1. Open `consultation.html` in a plain text editor (or VS Code, same as the article guide recommends).
2. Search (Ctrl+F) for:

   ```
   YOUR_BASIN_FORM_ID
   ```

3. You'll find it inside a line near the top of the file that looks like:

   ```html
   <form action="https://usebasin.com/f/YOUR_BASIN_FORM_ID" enctype="multipart/form-data" id="applicationForm" method="POST">
   ```

4. Replace `YOUR_BASIN_FORM_ID` with just the code part you copied in Step 2 (everything after the last `/`). Don't touch anything else on that line, not the quotes, not `enctype`, not `method`, just that one placeholder word.

**Baby step tip:** if your real address was `https://usebasin.com/f/a1b2c3d4e5f6`, the line should end up reading `action="https://usebasin.com/f/a1b2c3d4e5f6"` — the `https://usebasin.com/f/` part was already there and correct, you're only swapping the last piece.

## STEP 4: Test it for real

1. Save the file and open `consultation.html` in your browser.
2. Fill out the intake questionnaire with fake test information (write "TEST" in the name field so you know to ignore it later).
3. On the documents step, upload any small photo from your computer to one of the 3 upload slots, just to confirm the whole path works end to end.
4. Click through to the final step and submit.
5. Go back to your Basin dashboard in another browser tab, you should see your test submission appear there within a few seconds, including the file you uploaded.

If you see it, you're done, the form is live.

If you get an error message on the site instead of a success screen, double check Step 3, the most common mistake is leaving a stray space or missing the `f/` in the address.

## STEP 5: Where your real submissions go

By default, Basin's free plan shows submissions in your dashboard and can email you a notification for each one, look for a **Notifications** or **Email Alerts** setting inside your form's settings in the Basin dashboard to turn that on and point it at whichever inbox your team actually checks.

---

## What happens if you outgrow the free plan

Basin's free tier is 50 submissions a month. For a law firm's consultation intake form, that's generally plenty to start, most firms aren't getting more than a couple of qualified consultation requests a day. If you do outgrow it, Basin's paid tiers start around $12.50/month and raise both the submission cap and the file storage window. You'd upgrade from directly inside your Basin dashboard, no code changes needed on the site side at all, since the form's address stays exactly the same either way.

## If something's not working

The two most common causes, in order:
1. **Step 3 wasn't saved correctly** — reopen `consultation.html` and search for `YOUR_BASIN_FORM_ID` again, if it still finds a match, the swap didn't take.
2. **The uploaded file was too large** — the site itself will show a "Too Large" message on any single file over 10MB before it even tries to submit, that's a safety check built into the page, separate from Basin's own 100MB total limit.

If neither of those is it, tell me exactly what you see on screen when you try to submit, and I'll help track it down from there.

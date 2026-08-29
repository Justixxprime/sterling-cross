# How to Set Up Forminit for the Consultation Form — Ultra Baby Steps

Good news first: **this whole thing is about 10 minutes, no coding required, and you never have to touch any file besides the one line this guide points you to.**

## Why this form needs a different setup than the rest of the site

Every other form on the site (the contact form, the newsletter signup) already works out of the box on Web3Forms, with a real key already filled in. The consultation form is the one exception, because it has 3 document upload fields, and Web3Forms' free plan doesn't support file uploads at all, that's a paid-only feature on their pricing page. So that one form specifically is wired up to **Forminit** (forminit.com) instead, whose free plan genuinely includes stored file uploads: 100 submissions a month and 100MB of file storage, no credit card required to sign up.

**If you were using Basin before:** this form used to point at Basin (usebasin.com). It's been switched to Forminit because Forminit's free plan holds roughly double the monthly submissions Basin's did, isn't capped to a single form, and comes with an actual inbox-style dashboard, so a submission that "went through" is something you can always go back and open and see, not just something you have to trust an email notification about.

Right now the form is wired up correctly on the code side, but it's still pointing at a placeholder ID. It won't send anywhere until you swap that one value for your real one, which is everything this guide walks you through.

---

## STEP 1: Create a free Forminit account

1. Go to [forminit.com](https://forminit.com).
2. Click **Get started for free** (no credit card asked for on the free plan).
3. Verify your email if it asks you to.

## STEP 2: Create your form

1. Once you're logged in, look for a button like **"New Form"** or **"Create Form"**.
2. Give it a name, something like `Sterling & Cross Legal Plan Application` — this name is just for your own dashboard, it never shows to site visitors.
3. Go to that form's **Settings**, and set the authentication mode to **Public**. This is required, since the form lives directly on the website with no server in between, there's no safe place to hide a private key. Public mode is exactly what this kind of form is meant for.
4. Forminit will show you a **Form ID**, a short string of letters and numbers. **Copy it**, you'll need it in Step 3.

## STEP 3: Paste your real Form ID into the site

1. Open `consultation.html` in a plain text editor (or VS Code, same as the article guide recommends).
2. Search (Ctrl+F) for:

   ```
   YOUR_FORMINIT_FORM_ID
   ```

3. You'll find it inside a line near the top of the application form that looks like:

   ```html
   <form data-forminit-form-id="YOUR_FORMINIT_FORM_ID" enctype="multipart/form-data" id="applicationForm" method="POST">
   ```

4. Replace `YOUR_FORMINIT_FORM_ID` with just the Form ID you copied in Step 2. Don't touch anything else on that line, not the quotes, not `enctype`, not `method`, just that one placeholder value.

**Baby step tip:** if your real Form ID was `a1b2c3d4e5f6`, the line should end up reading `data-forminit-form-id="a1b2c3d4e5f6"`.

## STEP 4: Test it for real

1. Save the file and open `consultation.html` in your browser.
2. Fill out the intake questionnaire with fake test information (write "TEST" in the name field so you know to ignore it later).
3. On the legal needs step, upload any small photo from your computer to one of the 3 upload slots, just to confirm the whole path works end to end.
4. Click through to the final step and submit.
5. Go back to your Forminit dashboard in another browser tab, you should see your test submission appear there within a few seconds, including the file you uploaded, with a link to download it.

If you see it, you're done, the form is live.

If you get an error message on the site instead of a success screen, double check Step 3, the most common mistake is leaving a stray space, or copying the wrong ID from a different form if you've created more than one.

## STEP 5: Where your real submissions go

Forminit shows every submission in an inbox-style dashboard, you can star ones that need follow-up, mark status (open, in-progress, done), and add internal notes. To also get an email the moment someone applies, go to your form's **Settings → Email Notifications** and point it at whichever inbox your team actually checks.

---

## What happens if you outgrow the free plan

Forminit's free tier is 100 submissions a month. For a law firm's legal plan intake form, that's generally plenty to start, most firms aren't getting more than a few qualified applications a day. If you do outgrow it, Forminit's paid tier starts at $19/month and raises both the submission cap and the file storage window. You'd upgrade from directly inside your Forminit dashboard, no code changes needed on the site side at all, since the form's ID stays exactly the same either way.

## If something's not working

The two most common causes, in order:
1. **Step 3 wasn't saved correctly** — reopen `consultation.html` and search for `YOUR_FORMINIT_FORM_ID` again, if it still finds a match, the swap didn't take.
2. **The uploaded file was too large** — the site itself will show a "Too Large" message on any single file over 10MB before it even tries to submit, that's a safety check built into the page, separate from Forminit's own 25MB-per-submission cap.

If neither of those is it, check that your form is set to **Public** authentication mode (Step 2.3) — that's the single most common setup mistake, since a form left on protected mode will reject submissions from the browser. If it's still not working after that, tell me exactly what you see on screen when you try to submit, and I'll help track it down from there.

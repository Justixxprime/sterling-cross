# Why the Consultation Form's Photo Uploads Needed a Different Setup

Quick background, not a step-by-step (see `How-To-Set-Up-Basin.md` for the
actual setup steps).

The consultation intake form (`consultation.html`) has 3 photo/document
upload fields, styled as click-to-upload cards with a Pending/Uploaded
status pill.

Every other form on the site (the newsletter signup, the general contact
form) runs on **Web3Forms**, and that's fine for those, since neither one
accepts files. The intake form is the one exception: **Web3Forms does not
support file uploads on its free plan at all**, uploads are a paid-only
feature on their own pricing page. If the intake form had stayed on
Web3Forms, any photo someone uploaded would have been silently dropped,
even though the form itself would have looked like it "succeeded."

So the intake form specifically was switched to **Basin** (usebasin.com)
instead, whose free plan genuinely includes file uploads (confirmed
directly on Basin's own pricing table: 50 submissions/month, 100MB of
uploads, no credit card required to sign up).

## What this means for you right now

The form is wired up correctly on the code side, but `consultation.html`
is still pointing at a placeholder Basin address
(`https://usebasin.com/f/YOUR_BASIN_FORM_ID`). **It will not submit
successfully until that's replaced with a real one.**

For the actual walkthrough, sign-up steps, and testing checklist, see
**`How-To-Set-Up-Basin.md`** in this same folder, it's written in the same
plain-English, no-coding-required format as the article-writing guide.

## If you'd rather not switch backends

If you want to keep everything on Web3Forms instead, and are willing to pay
for their Pro plan (currently ~$12/mo) specifically to unlock uploads, you
can revert the intake form's `action` back to
`https://api.web3forms.com/submit` and re-add the `access_key` hidden
input the same way the other forms on the site use it. Just know the free
plan will keep silently dropping any uploaded files even though the form
still shows a success message, that's the exact problem switching to Basin
was meant to fix.

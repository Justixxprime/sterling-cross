# How to Add a New Article Yourself — Ultra Baby Steps

Good news first: **everything except one step is just text editing.** You don't need to know how to code. The one exception (generating the matching PDF) I'll explain honestly at the end, including your two real options for it.

Open your files in a plain text editor, or better, a free one called VS Code (it color-codes everything, making it much easier to follow along).

---

## STEP 1: Make a copy of an existing article to start from

Never build a new page from a blank file — copy the closest existing one and edit it. This guarantees you don't accidentally lose the sidebar, the footer, or any of the working buttons.

1. Find any of the 17 existing article files in your folder — they all start with `blog-`, for example `blog-family-law.html`.
2. Copy that file (Ctrl+C, Ctrl+V, or right-click → Duplicate).
3. Rename the copy to describe your new article, all lowercase, words separated by hyphens, ending in `.html`. Example: if your new article is about data breach notification law, name the file `blog-data-breach-notification.html`.

That's your working file for the rest of these steps.

## STEP 2: Understand the one rule that makes this easy

Just like last time: **everything between a `<tag>` and its matching `</tag>` is what shows up on the page.** You're going to search for specific old text inside tags and retype it as your new text. You are never deleting a tag itself, only the words sitting inside it.

## STEP 3: Update the invisible "page info" at the very top

Open your new file. Near the very top (inside the `<head>` section), find and update each of these — search (Ctrl+F) for the old text, exactly as shown, and retype it as your new version:

1. **`<title>...</title>`** — this is what shows in the browser tab. Change it to your new article's title, formatted like: `Your Article Title, Sterling and Cross`
2. **The description meta tag** — search for `name="description"`, find the sentence inside the quotes right after `content="`, and replace it with one honest sentence describing your article.
3. **The canonical link** — search for `rel="canonical"`. It'll show something like `href="https://www.sterlingcross.law/blog-family-law.html"` — change just the filename part to match your new file's name.
4. **The `og:url` line** — same filename swap, appears a few lines below the canonical link.
5. **The `og:title` and `twitter:title` lines** — same title swap as step 1.
6. **The `og:description` and `twitter:description` lines** — same sentence swap as step 2.

**Baby step tip:** all six of these are just find-and-replace. Don't worry about understanding what `og:` or `twitter:` mean — they control how the page looks when shared on social media and don't affect the page itself at all.

## STEP 4: Update what people actually see — the headline area

Still searching and replacing plain text only:

1. Find the line that looks like `<p class="text-gold ...">Family Law</p>` near the top of the visible article — this is the small gold category label. Change the words to your practice area, e.g. `Data Privacy`.
2. Find the big `<h1 ...>` line — this is your headline. Replace the words inside it with your real title.

## STEP 5: Update the byline row (author, role, and Download/Share buttons)

This part looks more complicated because of the Download PDF and Share buttons, but you're still only changing a few specific words, not the structure.

Find the block that starts with `<div class="article-meta-bar reveal">`. Inside it:

1. Find `<p class="article-meta-name">...</p>` — change the name to your real author's name.
2. Right below it, `<p class="article-meta-role">...</p>` — change the role text (keep the "&middot;" symbol and the reading time after it for now, you'll fix reading time in Step 8).
3. Find the line with `<a class="article-action-btn" ... href="assets/insights/...">` — this is the Download PDF button. Change both spots that mention a `.pdf` filename to match your article, e.g. `sterling-cross-data-breach-notification.pdf`. **Don't worry that this file doesn't exist yet** — we'll create it together at the end, and the button just won't work until then.
4. A few lines down, there are 3 share links (LinkedIn, X, Email) that each contain your page's web address baked into a long, percent-encoded string. Easiest approach: don't hand-edit these — tell me your new file's name and I'll generate the correct three links for you in five seconds. (If you want to try it yourself: each `%3A`, `%2F` etc. is just a colon, slash, or space in disguise — but it's genuinely easier to let me generate this one part.)

## STEP 6: Write your actual article body

Find the big block of `<p>` and `<h2>` tags below the byline — this is the article itself. Delete the placeholder paragraphs and headings, and write your own following this pattern:

```html
<p>Your opening paragraph goes here.</p>
<h2 class="font-display font-extrabold text-2xl text-ink mt-10 mb-4">Your first subheading</h2>
<p>A paragraph under that subheading.</p>
<h2 class="font-display font-extrabold text-2xl text-ink mt-10 mb-4">Your second subheading</h2>
<p>Another paragraph.</p>
<p>Your closing paragraph.</p>
```

**Baby step tip:** just copy one `<h2 ...>` line and one `<p>` line as your template, then paste and retype the words as many times as you need sections. Keep the `class="..."` part exactly as-is every time — only ever change the plain English between the tags.

**Voice tip, since it matters for how this reads:** look at your other articles for the tone — short sentences, direct, no legal jargon, speaks to the reader like a person, not a brochure. Write like you're explaining it to a smart friend who isn't a lawyer.

## STEP 7: Update the author box near the bottom

Find `<div class="mt-14 pt-8 border-t border-ink/10 flex items-center gap-4">` — this is the closing "Written by" card. Update:
1. The `alt="..."` and the name text to your real author.
2. The role text below it.
3. You can leave the little circular photo as-is for now (it's a placeholder) — see your Photography Guide document for what to eventually replace it with.

## STEP 8: Compute your reading time (one honest piece of math)

Real reading time is roughly your total word count divided by 200. So:
1. Select all the text inside your `<p>` and `<h2>` tags (just the words, not the code) and get a rough word count — most text editors show this, or paste into a word processor.
2. Divide by 200, round to the nearest whole number, minimum 1.
3. Go back to Step 5's byline role line and put that number in as `X min read`.

## STEP 9: Update "Related Insights" at the bottom (optional but nice)

Near the bottom, before the footer, there are 2 small cards linking to other articles. You can leave these pointing at 2 existing articles, or swap the `href`, image, category, and title text to point at 2 different existing ones — same find-and-replace approach as everything above.

## STEP 10: Add your new page to the hub pages so people can actually find it

Your new file exists now, but nothing links to it yet — a page with no links pointing to it is invisible to visitors. Two places to add it:

**On `blog.html`:** find the block starting `<div class="grid md:grid-cols-3 gap-6" id="insightsGrid">`. Copy one whole `<a class="tilt-card ...">...</a>` card (from its opening `<a` to its closing `</a>`), paste it as a new entry, and update: the `href`, the `alt` text, the category label, the `<h3>` title, and the description sentence.

**On `publications.html`:** same idea, find `id="pubsGrid"`, copy one `<a class="matter-card ...">...</a>` block, paste it, and update the `href`, the tag/icon, the description, and the read time.

## STEP 11: Test it

Double-click your new `.html` file to open it in your browser directly (no server needed). Check:
- The headline, byline, and body all show your real content
- The "Back to Insights" link at the top works
- The related-article cards at the bottom work
- Click through from `blog.html` and `publications.html` to confirm your new card actually appears and links correctly

---

## The one honest exception: the PDF

Everything above is plain text editing you can absolutely do yourself. The **Download PDF** button, though, points at an actual `.pdf` file that has to be *generated* — it's not something you hand-type like HTML. Behind the scenes, I built it using a Python script that reads the article's text and lays it into your navy/gold template, with your real embedded fonts and logo.

Two honest options, no in-between:
1. **Ask me to generate it.** Send me the new article (or just tell me which file you finished), and I'll run the same script against your new content and hand you back a matching PDF in your exact style. This takes me a minute and is by far the easiest path.
2. **Do it yourself with code.** This requires installing Python, the WeasyPrint library, and running a script — genuinely a developer task, not a text-editing one. I can walk you through it if you specifically want to learn it, but it's a different skill from everything else in this guide, and I don't want to pretend otherwise.

For a single new article every so often, honestly, option 1 is the right call every time.

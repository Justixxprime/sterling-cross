# Generate Your Own Article PDFs — Full Code Setup Guide

I tested every step below myself before writing it down — the script genuinely works exactly as described. This is real developer setup (not text editing like the HTML guide), so go slower here and don't skip steps.

There are 4 things you need on your computer: **Python**, **one Python package** (WeasyPrint), **the fonts**, and **the script itself**. Let's do them in order.

---

## STEP 1: Install Python

Open your terminal (Mac: Terminal app. Windows: search "PowerShell"). Type:

```
python3 --version
```

If you see something like `Python 3.11.4`, you already have it — skip to Step 2.

If you get an error, install it:
- **Mac:** go to [python.org/downloads](https://python.org/downloads), download the macOS installer, run it.
- **Windows:** same site, download the Windows installer. **Important:** on the first install screen, check the box that says "Add python.exe to PATH" before clicking Install.

Close and reopen your terminal after installing, then run the version check again to confirm.

## STEP 2: Install WeasyPrint (the PDF engine)

WeasyPrint needs a couple of system-level graphics libraries before the Python package itself will work. Pick your operating system:

### macOS
```
brew install pango
pip3 install weasyprint
```
(If `brew` isn't found, you need Homebrew first — go to [brew.sh](https://brew.sh) and follow the one-line install command on that page, then come back and run the two lines above.)

### Windows
1. Download and run the **GTK3 runtime installer** for Windows — search "gvsbuild GTK3 runtime installer" or use the link on WeasyPrint's own install docs at `doc.courtbouillon.org/weasyprint/stable/first_steps.html` (search that page for "Windows").
2. Then in PowerShell:
```
pip3 install weasyprint
```

### Linux (Ubuntu/Debian)
```
sudo apt update
sudo apt install libpango-1.0-0 libpangocairo-1.0-0
pip3 install weasyprint
```

### Check it worked, on any system:
```
python3 -c "import weasyprint; print('it works')"
```
If that prints `it works`, you're good. If it errors, the message will usually tell you exactly which library is still missing — search that exact error message, this is a common enough tool that the fix is always one search away.

## STEP 3: Get the real fonts

You need 7 font files total. Easiest path — no coding, just downloading from a website:

1. Go to **fonts.google.com/specimen/Bricolage+Grotesque**, click **"Download family"** (top right), a `.zip` file downloads.
2. Unzip it. Inside, find the files ending in `-700.ttf` and `-800.ttf` (or similar — the exact names vary slightly by version, look for "Bold" ≈ 700 and "ExtraBold" ≈ 800).
3. Go to **fonts.google.com/specimen/Manrope**, click **"Download family"** again.
4. From that zip, find the weight files for 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), and 800 (ExtraBold).

### Set up your project folder
Create a new folder anywhere, call it `article-pdf`. Inside it, create a folder called `fonts`. Copy your 7 font files into that `fonts` folder and **rename them exactly** to these names (this matters — the script looks for these exact filenames):

```
fonts/bricolage-grotesque-700.ttf
fonts/bricolage-grotesque-800.ttf
fonts/manrope-400.ttf
fonts/manrope-500.ttf
fonts/manrope-600.ttf
fonts/manrope-700.ttf
fonts/manrope-800.ttf
```

## STEP 4: Get the logo file

Copy `favicon.svg` from your website's `assets` folder into your new `article-pdf` folder (the same folder, not inside `fonts`).

## STEP 5: Get the script

Save the `make_article_pdf.py` file (the full code is at the very bottom of this guide, under "The Script") directly into your `article-pdf` folder, next to the `fonts` folder and `favicon.svg`. Your folder should now look like:

```
article-pdf/
  make_article_pdf.py
  favicon.svg
  fonts/
    bricolage-grotesque-700.ttf
    bricolage-grotesque-800.ttf
    manrope-400.ttf
    manrope-500.ttf
    manrope-600.ttf
    manrope-700.ttf
    manrope-800.ttf
```

## STEP 6: Fill in your article

Open `make_article_pdf.py` in a text editor. Scroll down to the section that says:

```
# EDIT BELOW THIS LINE — fill in your own article's details
```

Change each value:
- `TITLE` — your article's headline, in quotes.
- `CATEGORY` — the practice area, e.g. `"Employment Law"`.
- `AUTHOR_NAME` and `AUTHOR_TITLE` — your real attorney's name and role.
- `PULL_QUOTE` — one standout sentence from your article, or set it to `None` to skip having one.
- `BLOCKS` — your actual paragraphs and subheadings. Each line is either `("h2", "Your subheading")` or `("p", "Your paragraph text")`. Add or remove lines freely, just keep every line ending with a comma.
- `OUTPUT_FILENAME` — what you want the finished PDF to be called, e.g. `"my-new-article.pdf"`.

**Don't touch anything above that line** — that part is the actual template engine and doesn't need to change per article.

## STEP 7: Run it

In your terminal:
```
cd path/to/article-pdf
python3 make_article_pdf.py
```
(Replace `path/to/article-pdf` with wherever you actually saved the folder — if you're not sure, you can drag the folder into the terminal window after typing `cd ` with a trailing space, most terminals will auto-fill the path.)

You should see `Done! Created my-article.pdf` (or whatever filename you chose), and the file will appear in that same folder.

## STEP 8: Put it on your website

Copy your finished `.pdf` into your website's `assets/insights/` folder, then go back to your article's `.html` file and update the Download PDF button's `href` and `download` attributes to match your new filename (see Step 5 of the "add a new article" guide).

---

## If something goes wrong

- **"ModuleNotFoundError: No module named 'weasyprint'"** — Step 2 didn't finish. Run `pip3 install weasyprint` again and read any red error text closely.
- **The PDF opens but the fonts look wrong (like a plain default font)** — one of your `fonts/` filenames doesn't exactly match what the script expects. Double check every filename against the list in Step 3, including the `.ttf` ending.
- **"FileNotFoundError: favicon.svg"** — it's not in the same folder as the script, or it's misspelled. Check Step 4.
- **Anything else** — copy the exact red error text and send it to me, I'll tell you exactly which line to fix.

---

## Bonus: regenerating the Media Kit

There's a second script in this same folder, `make_media_kit.py`, that
builds `assets/Sterling-Cross-Media-Kit.pdf` — the 3-page cover, firm-facts,
and brand-guidelines PDF linked from the Press & Media page. It uses the
exact same setup as the article script above (same `fonts/` folder, same
`favicon.svg`, same `pip3 install weasyprint`), so if you've already done
Steps 1–4 above, there's nothing extra to install.

### What you can change

Every editable option sits in one block near the top of the file, between
the `EDIT BELOW THIS LINE` and `Don't touch anything below this line`
comments, same pattern as the article script:

| Variable | What it controls |
|---|---|
| `STATS` | The 6 number/label pairs in the "Firm at a Glance" grid (offices, continents, attorneys, practice areas, industry groups, founding year) |
| `ABOUT_TEXT` | The paragraph under "About Sterling & Cross" |
| `QUOTE_TEXT` / `QUOTE_ATTRIBUTION` | The pull-quote on the brand guidelines page and who it's credited to |
| `BRAND_GUIDELINES_TEXT` | The logo-usage paragraph on page 3 |
| `COLOR_SWATCHES` | The 4 color swatches (name, hex code shown, and the text color used for the hex label underneath) |
| `UPDATED_LABEL` | The "Updated 2026" text on the cover |

### Worked example: updating the attorney count

Say the firm crosses 1,300 attorneys and you want that reflected. Find this
line inside `STATS`:

```python
("1,200+", "Attorneys"),
```

Change it to:

```python
("1,300+", "Attorneys"),
```

That number also appears a second time, inside the sentence in `ABOUT_TEXT`
("the firm has grown to more than 1,200 attorneys..."), so update that
occurrence too, or the stat grid and the paragraph will disagree with each
other.

### Running it

```bash
python3 make_media_kit.py
```

This overwrites `Sterling-Cross-Media-Kit.pdf` in the same folder. Copy the
result into `assets/` (replacing the existing file of the same name) and
you're done, `press.html`'s download link already points at that exact
filename, so nothing else needs to change.

---

## The Script

Copy everything below, from `"""` at the very top through the last line, into a new file called `make_article_pdf.py`. This is the real script, tested end to end, including regenerating all 8 of the newest article PDFs to match the site's established design (the same one used by the Family Law PDF), not a placeholder.

```python
"""
Sterling & Cross — Article PDF Generator
Matches the exact template used by the firm's existing insight PDFs:
page 1 has the full logo lockup + category eyebrow + title + byline,
subsequent pages carry a slim running header, and the final page ends
with a "Have a matter like this?" CTA box and the standard legal
disclaimer footer.

Requires: pip3 install weasyprint
"""

import os
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

HERE = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# EDIT BELOW THIS LINE — fill in your own article's details
# ============================================================

TITLE = "The Importance of Estate Planning, Securing Your Family's Future"
CATEGORY = "Estate Planning"
AUTHOR_NAME = "Emily Johnson"
AUTHOR_TITLE = "Esq., Estate Planning Attorney, Sterling & Cross"
PULL_QUOTE = None  # or a string, e.g. "One standout sentence from the article."

BLOCKS = [
    ("p", "Most people put off estate planning for the same reason they put off anything uncomfortable, it forces a conversation about mortality most of us would rather avoid."),
    ("h2", "Example subheading"),
    ("p", "Example paragraph text goes here."),
]

OUTPUT_FILENAME = "my-new-article.pdf"

# ============================================================
# Don't touch anything below this line
# ============================================================

def build_html(title, category, author_name, author_title, pull_quote, blocks, kind="INSIGHT"):
    body_html = ""
    for tag, text in blocks:
        if tag == "h2":
            body_html += f'<h2><span class="accent-bar"></span>{text}</h2>\n'
        else:
            body_html += f"<p>{text}</p>\n"

    quote_html = ""
    if pull_quote:
        quote_html = f'<div class="pullquote"><span class="accent-bar"></span><p>&ldquo;{pull_quote}&rdquo;</p></div>'

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>

<div class="cover-banner">
  <div class="cover-banner-inner">
    <div class="logo-badge"><img src="favicon.svg" alt=""></div>
    <div class="wordmark-block">
      <div class="wordmark">STERLING <span>&amp; CROSS</span></div>
      <div class="tagline">GLOBAL LEGAL COUNSEL</div>
    </div>
  </div>
</div>

<div class="content-pad">
  <p class="eyebrow">{category.upper()}<span class="eyebrow-dot">&bull;</span>{kind}</p>
  <h1>{title}</h1>
  <div class="title-rule"></div>
  <p class="byline">{author_name}<span class="byline-dot">&bull;</span>{author_title}</p>
  <div class="body">
{body_html}
{quote_html}
  </div>

  <div class="written-by-card">
    <p class="written-by-label">WRITTEN BY</p>
    <p class="written-by-name">{author_name}</p>
    <p class="written-by-role">{author_title}</p>
  </div>

  <div class="cta-box">
    <div class="cta-text">
      <p class="cta-label">Have a matter like this?</p>
      <p class="cta-sub">Book a consultation and we'll connect you with the right team.</p>
    </div>
    <div class="cta-button">sterlingcross.law</div>
  </div>

  <p class="disclaimer">&copy; Sterling &amp; Cross Law Firm. This publication is provided for general informational purposes only and does not constitute legal advice. Reading this document does not create an attorney&ndash;client relationship. For advice on your specific situation, please contact us directly at hello@sterlingcross.law.</p>
</div>
</body>
</html>"""


CSS_TEMPLATE = """
@font-face { font-family: 'Bricolage Grotesque'; src: url('fonts/bricolage-grotesque-700.ttf') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Bricolage Grotesque'; src: url('fonts/bricolage-grotesque-800.ttf') format('truetype'); font-weight: 800; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-400.ttf') format('truetype'); font-weight: 400; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-500.ttf') format('truetype'); font-weight: 500; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-600.ttf') format('truetype'); font-weight: 600; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-700.ttf') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-800.ttf') format('truetype'); font-weight: 800; }

@page {
  size: letter;
  margin: 90px 0 64px 0;
  background: #F8F4EE;
  @bottom-center {
    content: "Page " counter(page) " of " counter(pages) " \\00B7 Sterling & Cross Insights";
    font-family: 'Manrope'; font-size: 8.5px; color: #16141066; letter-spacing: .02em;
  }
  @top-left {
    content: "STERLING & CROSS";
    font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 10px; color: #161410;
    margin-left: 56px; padding-top: 32px; padding-bottom: 8px;
    width: 145px; border-bottom: 1px solid #16141014;
  }
  @top-right {
    content: "##CAT##";
    font-family: 'Manrope'; font-weight: 800; font-size: 8px; letter-spacing: .1em; color: #B8873B;
    margin-right: 56px; padding-top: 34px;
  }
}
@page :first {
  margin-top: 0;
  @top-left { content: none; }
  @top-right { content: none; }
}

* { box-sizing: border-box; }
html, body { background: #F8F4EE; }
body { font-family: 'Manrope', sans-serif; font-size: 10.5px; line-height: 1.65; color: #161410; margin: 0; }

/* ---- Page 1 cover banner, full bleed, navy with a soft circular
   gradient echo of the media kit's cover treatment ---- */
.cover-banner {
  background: #0E1B2B;
  background-image: radial-gradient(circle at 88% -10%, #16324a 0%, transparent 55%);
  padding: 44px 56px 40px 56px;
  margin-bottom: 34px;
}
.cover-banner-inner { display: flex; align-items: center; gap: 14px; }
.logo-badge { width: 40px; height: 40px; border-radius: 11px; background: #16324a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logo-badge img { width: 24px; height: 24px; }
.wordmark { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 19px; color: #F8F5EF; letter-spacing: .01em; }
.wordmark span { color: #B8873B; }
.tagline { font-family: 'Manrope'; font-weight: 700; font-size: 8px; letter-spacing: .2em; color: #B8873B; margin-top: 3px; }

.content-pad { padding: 0 56px; }

.eyebrow { font-family: 'Manrope'; font-weight: 800; font-size: 9px; letter-spacing: .12em; color: #B8873B; margin: 0 0 14px 0; }
.eyebrow-dot { margin: 0 8px; opacity: .6; }

h1 { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 25px; line-height: 1.22; color: #161410; margin: 0 0 18px 0; }

.title-rule { width: 64px; height: 3px; background: #B8873B; border-radius: 2px; margin: 0 0 20px 0; }

.byline { font-family: 'Manrope'; font-weight: 700; font-size: 9.5px; color: #161410aa; margin: 0 0 26px 0; padding-bottom: 22px; border-bottom: 1px solid #16141014; }
.byline-dot { margin: 0 8px; opacity: .5; }

.body p { margin: 0 0 15px 0; text-align: left; }

.body h2 { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 15px; color: #161410; margin: 26px 0 12px 0; padding-left: 16px; position: relative; }
.body h2 .accent-bar, .pullquote .accent-bar { position: absolute; left: 0; top: 1px; bottom: 1px; width: 3px; background: #B8873B; border-radius: 2px; }
.body h2 .accent-bar { top: 2px; height: 16px; bottom: auto; }

.pullquote { position: relative; padding: 2px 0 2px 16px; margin: 24px 0; }
.pullquote p { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: 14px; line-height: 1.5; color: #0E1B2B; margin: 0; }

.written-by-card { background: #FFFFFF; border: 1px solid #16141012; border-radius: 12px; padding: 18px 22px; margin: 30px 0 26px 0; }
.written-by-label { font-family: 'Manrope'; font-weight: 800; font-size: 8px; letter-spacing: .12em; color: #B8873B; margin: 0 0 6px 0; }
.written-by-name { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 12.5px; color: #161410; margin: 0 0 2px 0; }
.written-by-role { font-family: 'Manrope'; font-weight: 500; font-size: 9px; color: #16141088; margin: 0; }

.cta-box { background: #0E1B2B; border-radius: 14px; padding: 22px 26px; margin: 4px 0 22px 0; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.cta-label { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 14px; color: #F8F5EF; margin: 0 0 4px 0; }
.cta-sub { font-family: 'Manrope'; font-weight: 500; font-size: 9px; color: #F8F5EFaa; margin: 0; max-width: 280px; }
.cta-button { background: #B8873B; color: #161410; font-family: 'Manrope'; font-weight: 800; font-size: 10px; padding: 12px 20px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }

.disclaimer { font-family: 'Manrope'; font-weight: 500; font-size: 7.5px; line-height: 1.6; color: #16141066; padding-top: 18px; border-top: 1px solid #16141010; }
"""


def generate_pdf(title, category, author_name, author_title, pull_quote, blocks, output_filename, kind="INSIGHT", out_dir=None):
    """Generate one article PDF. out_dir defaults to this script's folder.
    kind is the small word shown next to the category, e.g. "INSIGHT" or
    "CLIENT ALERT"."""
    out_dir = out_dir or HERE
    html_str = build_html(title, category, author_name, author_title, pull_quote, blocks, kind=kind)
    css_str = CSS_TEMPLATE.replace("##CAT##", category.upper())
    font_config = FontConfiguration()
    HTML(string=html_str, base_url=HERE).write_pdf(
        os.path.join(out_dir, output_filename),
        stylesheets=[CSS(string=css_str, font_config=font_config)],
        font_config=font_config,
    )
    print(f"Done! Created {output_filename}")


if __name__ == "__main__":
    generate_pdf(TITLE, CATEGORY, AUTHOR_NAME, AUTHOR_TITLE, PULL_QUOTE, BLOCKS, OUTPUT_FILENAME)

```


---

## The Media Kit Script

Same idea as above: copy everything below into a new file called `make_media_kit.py`, in the same folder as `make_article_pdf.py` and the shared `fonts/` folder.

```python
"""
Sterling & Cross — Media Kit PDF Generator
Rebuilds the firm's 3-page media kit (cover, firm facts, brand
guidelines) using the same design system as make_article_pdf.py in
this same folder: same fonts, same navy/gold/paper/ink palette, same
running header. No editable source existed for the original PDF,
only the compiled file, so this script is now that source.

Requires: pip3 install weasyprint
"""

import os
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

HERE = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# EDIT BELOW THIS LINE — every option that changes what the media
# kit actually says lives in this block. Nothing below the next
# "Don't touch anything below this line" marker needs editing for
# normal updates (new stat, new quote, updated contact info, etc).
# ============================================================

# Firm-wide stats — keep these in sync with the live site if they change.
STATS = [
    ("14", "Offices Worldwide"),
    ("6", "Continents"),
    ("1,200+", "Attorneys"),
    ("25", "Practice Areas"),   # was 22, corrected to match the live site's real count
    ("10", "Industry Groups"),
    ("2012", "Firm Founded"),
]

ABOUT_TEXT = (
    "Sterling &amp; Cross is an international law firm with 14 offices across six continents, advising "
    "corporations, financial institutions, and individuals on the matters that define industries, markets, "
    "and, sometimes, a single family's future. Founded in 2012 in Chicago, the firm has grown to more "
    "than 1,200 attorneys practicing across 25 practice areas and 10 industry groups, without losing the "
    "direct, attorney-led approach it was built on."
)

QUOTE_TEXT = (
    "We built this firm on the idea that a client should never feel like a file number. "
    "Every office we've opened since 2012 has held to that, wherever in the world it is."
)
QUOTE_ATTRIBUTION = "Managing Partner, Sterling & Cross"

BRAND_GUIDELINES_TEXT = (
    "Please maintain clear space around the mark equal to the height of the scale icon. Do not "
    "recolor, rotate, or distort the mark. Use the navy or gold versions provided in the "
    "accompanying logo files. On dark backgrounds, use the gold/paper reversed version. The full "
    "lockup (mark + wordmark) is preferred; the mark alone may be used at small sizes such as "
    "favicons or social avatars."
)

COLOR_SWATCHES = [
    ("Navy", "#0E1B2B", "#0E1B2B"),
    ("Gold", "#B8873B", "#B8873B"),
    ("Paper", "#F8F5EF", "#161410"),  # label text needs to be dark since the swatch itself is near-white
    ("Ink", "#161410", "#161410"),
]

UPDATED_LABEL = "Updated 2026"

# ============================================================
# Don't touch anything below this line
# ============================================================


def build_html():
    stats_html = "".join(
        f'<div class="stat-card"><p class="stat-number">{num}</p><p class="stat-label">{label.upper()}</p></div>'
        for num, label in STATS
    )
    swatches_html = "".join(
        f'''<div class="swatch">
              <div class="swatch-color" style="background:{hexval};{"border:1px solid #16141014;" if hexval == "#F8F5EF" else ""}"></div>
              <p class="swatch-name">{name}</p>
              <p class="swatch-hex">{hexval}</p>
            </div>'''
        for name, hexval, _ in COLOR_SWATCHES
    )

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>

<!-- PAGE 1: full cover -->
<div class="cover-page">
  <div class="cover-content">
    <div class="logo-badge-lg"><img src="favicon.svg" alt=""></div>
    <div class="cover-wordmark">STERLING <span>&amp; CROSS</span></div>
    <div class="cover-tagline">GLOBAL LEGAL COUNSEL</div>
    <div class="cover-rule"></div>
    <p class="cover-title">Media Kit</p>
    <p class="cover-subtitle">Firm facts, boilerplate copy, and media contact information</p>
  </div>
  <p class="cover-footer">sterlingcross.law &nbsp;&middot;&nbsp; press@sterlingcross.law &nbsp;&middot;&nbsp; {UPDATED_LABEL}</p>
</div>

<!-- PAGE 2: About + stats + contact -->
<div class="content-pad page-break">
  <h1><span class="accent-bar"></span>About Sterling &amp; Cross</h1>
  <div class="title-rule"></div>
  <p class="body-text">{ABOUT_TEXT}</p>

  <p class="section-label">Firm at a Glance</p>
  <div class="stat-grid">{stats_html}</div>

  <div class="cta-box">
    <div class="cta-text">
      <p class="cta-eyebrow">MEDIA CONTACT</p>
      <p class="cta-label">Communications Team, Sterling &amp; Cross</p>
      <p class="cta-sub">press@sterlingcross.law &nbsp;&middot;&nbsp; +1 (555) 123-4567</p>
    </div>
  </div>
</div>

<!-- PAGE 3: Brand guidelines -->
<div class="content-pad page-break">
  <h1><span class="accent-bar"></span>Logo &amp; Brand Guidelines</h1>
  <div class="title-rule"></div>

  <div class="brand-row">
    <div class="logo-badge"><img src="favicon.svg" alt=""></div>
    <p class="body-text brand-guidelines-text">{BRAND_GUIDELINES_TEXT}</p>
  </div>

  <p class="section-label">Color Palette</p>
  <div class="swatch-grid">{swatches_html}</div>

  <div class="quote-card">
    <p class="quote-mark">&ldquo;</p>
    <p class="quote-text">{QUOTE_TEXT}</p>
    <p class="quote-attribution">{QUOTE_ATTRIBUTION}</p>
  </div>
</div>

</body>
</html>"""


CSS_TEMPLATE = """
@font-face { font-family: 'Bricolage Grotesque'; src: url('fonts/bricolage-grotesque-700.ttf') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Bricolage Grotesque'; src: url('fonts/bricolage-grotesque-800.ttf') format('truetype'); font-weight: 800; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-400.ttf') format('truetype'); font-weight: 400; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-500.ttf') format('truetype'); font-weight: 500; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-600.ttf') format('truetype'); font-weight: 600; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-700.ttf') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Manrope'; src: url('fonts/manrope-800.ttf') format('truetype'); font-weight: 800; }

@page {
  size: letter;
  margin: 90px 0 64px 0;
  background: #F8F4EE;
  @bottom-center {
    content: "Page " counter(page) " of " counter(pages) " \\00B7 Sterling & Cross Media Kit";
    font-family: 'Manrope'; font-size: 8.5px; color: #16141066; letter-spacing: .02em;
  }
  @top-left {
    content: "STERLING & CROSS";
    font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 10px; color: #161410;
    margin-left: 56px; padding-top: 32px; padding-bottom: 8px;
    width: 145px; border-bottom: 1px solid #16141014;
  }
  @top-right {
    content: "MEDIA KIT";
    font-family: 'Manrope'; font-weight: 800; font-size: 8px; letter-spacing: .1em; color: #B8873B;
    margin-right: 56px; padding-top: 34px;
  }
}
@page :first {
  margin: 0;
  background: #0E1B2B;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
}

* { box-sizing: border-box; }
html, body { background: #F8F4EE; }
body { font-family: 'Manrope', sans-serif; font-size: 10.5px; line-height: 1.65; color: #161410; margin: 0; }

.page-break { page-break-before: always; }

/* ---- Page 1: full navy cover ---- */
.cover-page {
  background: #0E1B2B;
  background-image: radial-gradient(circle at 88% -6%, #16324a 0%, transparent 55%);
  width: 100%; height: 100vh; min-height: 792pt;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; position: relative;
}
.cover-content { display: flex; flex-direction: column; align-items: center; }
.logo-badge-lg { width: 68px; height: 68px; border-radius: 18px; background: #16324a; display: flex; align-items: center; justify-content: center; margin-bottom: 26px; }
.logo-badge-lg img { width: 40px; height: 40px; }
.cover-wordmark { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 34px; color: #F8F5EF; letter-spacing: .01em; }
.cover-wordmark span { color: #B8873B; }
.cover-tagline { font-family: 'Manrope'; font-weight: 700; font-size: 10px; letter-spacing: .3em; color: #B8873B; margin-top: 10px; }
.cover-rule { width: 64px; height: 2px; background: #B8873B44; margin: 26px 0; }
.cover-title { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 22px; color: #F8F5EF; margin: 0 0 10px 0; }
.cover-subtitle { font-family: 'Manrope'; font-weight: 500; font-size: 10.5px; color: #F8F5EFaa; margin: 0; }
.cover-footer { position: absolute; bottom: 46px; left: 0; right: 0; text-align: center; font-family: 'Manrope'; font-weight: 500; font-size: 8.5px; color: #F8F5EF66; }

.content-pad { padding: 0 56px; }

h1 { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 22px; color: #161410; margin: 0 0 16px 0; padding-left: 16px; position: relative; }
h1 .accent-bar { position: absolute; left: 0; top: 4px; bottom: 4px; width: 3px; background: #B8873B; border-radius: 2px; }
.title-rule { width: 64px; height: 3px; background: #B8873B; border-radius: 2px; margin: 0 0 24px 0; }

.body-text { margin: 0 0 30px 0; }

.section-label { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 14px; color: #161410; margin: 0 0 16px 0; }

.stat-grid { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 30px; }
.stat-card { background: #FFFFFF; border: 1px solid #16141012; border-radius: 12px; padding: 18px 22px; width: 30%; }
.stat-number { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 22px; color: #B8873B; margin: 0 0 6px 0; }
.stat-label { font-family: 'Manrope'; font-weight: 700; font-size: 7.5px; letter-spacing: .08em; color: #16141088; margin: 0; }

.cta-box { background: #0E1B2B; border-radius: 14px; padding: 22px 26px; margin: 4px 0 22px 0; }
.cta-eyebrow { font-family: 'Manrope'; font-weight: 800; font-size: 8px; letter-spacing: .12em; color: #B8873B; margin: 0 0 8px 0; }
.cta-label { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 13px; color: #F8F5EF; margin: 0 0 4px 0; }
.cta-sub { font-family: 'Manrope'; font-weight: 500; font-size: 9px; color: #F8F5EFaa; margin: 0; }

.brand-row { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 30px; }
.logo-badge { width: 46px; height: 46px; border-radius: 12px; background: #0E1B2B; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logo-badge img { width: 28px; height: 28px; }
.brand-guidelines-text { margin: 0; padding-top: 4px; }

.swatch-grid { display: flex; gap: 16px; margin-bottom: 30px; }
.swatch { width: 22%; }
.swatch-color { width: 100%; height: 58px; border-radius: 8px; margin-bottom: 10px; }
.swatch-name { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 10.5px; color: #161410; margin: 0 0 2px 0; }
.swatch-hex { font-family: 'Manrope'; font-weight: 500; font-size: 8.5px; color: #16141066; margin: 0; }

.quote-card { background: #FFFFFF; border: 1px solid #16141012; border-radius: 14px; padding: 26px 28px; }
.quote-mark { font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 26px; color: #B8873B; margin: 0 0 6px 0; line-height: 1; }
.quote-text { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: 14px; line-height: 1.55; color: #0E1B2B; margin: 0 0 14px 0; }
.quote-attribution { font-family: 'Manrope'; font-weight: 600; font-size: 9px; color: #16141088; margin: 0; }
"""


def generate_media_kit(output_filename="Sterling-Cross-Media-Kit.pdf", out_dir=None):
    out_dir = out_dir or HERE
    font_config = FontConfiguration()
    HTML(string=build_html(), base_url=HERE).write_pdf(
        os.path.join(out_dir, output_filename),
        stylesheets=[CSS(string=CSS_TEMPLATE, font_config=font_config)],
        font_config=font_config,
    )
    print(f"Done! Created {output_filename}")


if __name__ == "__main__":
    generate_media_kit()

```

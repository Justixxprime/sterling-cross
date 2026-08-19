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

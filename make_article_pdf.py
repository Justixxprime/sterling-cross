"""
Sterling & Cross — Article PDF generator
==========================================
HOW TO USE THIS FILE:
1. Scroll down to the section marked "EDIT BELOW THIS LINE".
2. Fill in your article's title, category, author, and paragraphs.
3. Save the file.
4. Run it: python3 make_article_pdf.py
5. Your PDF appears in the same folder.

You should NOT need to touch anything above the "EDIT BELOW" line.
"""

import base64
from weasyprint import HTML

# ----------------------------------------------------------------
# These two paths must point at real files on YOUR computer.
# See the setup guide for exactly how to get them.
# ----------------------------------------------------------------
FONT_FOLDER = "fonts"          # folder holding the 7 .ttf files for each font family
LOGO_SVG_PATH = "favicon.svg"  # the site's logo file, copied next to this script


def font_face(family_css_name, filename, weight):
    return f"""
@font-face {{
  font-family: '{family_css_name}';
  src: url('{FONT_FOLDER}/{filename}') format('truetype');
  font-weight: {weight};
}}"""


CSS_TEMPLATE = """
@page {{
  size: Letter;
  margin: 78pt 58pt 46pt 58pt;
  @top-left {{ content: element(runningLeft); }}
  @top-right {{ content: element(runningRight); }}
  @bottom-center {{
    content: "Page " counter(page) " of " counter(pages) "   ·   Sterling & Cross Insights";
    font-family: 'Manrope'; font-size: 8pt; font-weight: 600; letter-spacing: 0.3pt; color: #a39c8e;
    padding-top: 10pt; border-top: 0.75pt solid #e7e0d2; width: 100%;
  }}
}}
@page :first {{
  margin-top: 0;
  @top-left {{ content: none; }}
  @top-right {{ content: none; }}
}}
{fonts_css}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Manrope', sans-serif; color: #161410; margin: 0; background: #F8F5EF; font-weight: 400; }}
.running-header-left {{
  position: running(runningLeft); display: flex; align-items: center; gap: 8pt; white-space: nowrap;
  font-family: 'Bricolage'; font-weight: 800; font-size: 9.5pt; color: #0E1B2B;
  padding-bottom: 10pt; border-bottom: 0.75pt solid #e7e0d2;
}}
.running-header-left img {{ width: 14pt; height: 14pt; border-radius: 3.5pt; }}
.running-header-left .rh-gold {{ color: #B8873B; }}
.running-header-right {{
  position: running(runningRight); white-space: nowrap;
  font-family: 'Manrope'; font-weight: 700; font-size: 7.5pt; letter-spacing: 1pt; text-transform: uppercase; color: #B8873B;
  padding-bottom: 10pt; border-bottom: 0.75pt solid #e7e0d2;
}}
.band {{ background-color: #0E1B2B; padding: 40pt 58pt 32pt 58pt; }}
.band-row {{ display: flex; align-items: center; gap: 11pt; }}
.band-row img {{ width: 30pt; height: 30pt; border-radius: 8pt; }}
.wordmark {{ font-family: 'Bricolage'; color: #F8F5EF; font-size: 15pt; font-weight: 800; letter-spacing: 0.3pt; }}
.wordmark b {{ color: #E4B15D; font-weight: 800; }}
.tagline {{ color: #B8873B; font-family: 'Manrope'; font-size: 7.5pt; font-weight: 700; letter-spacing: 2.4pt; text-transform: uppercase; margin-top: 4pt; margin-left: 41pt; }}
.body-wrap {{ padding: 34pt 58pt 10pt 58pt; }}
.eyebrow-row {{ display: flex; align-items: center; gap: 8pt; margin-bottom: 12pt; }}
.eyebrow {{ color: #B8873B; font-family: 'Manrope'; font-size: 8.5pt; font-weight: 700; letter-spacing: 1.6pt; text-transform: uppercase; }}
.eyebrow-dot {{ width: 3pt; height: 3pt; border-radius: 50%; background: #B8873B; }}
h1.title {{ font-family: 'Bricolage'; font-size: 25pt; line-height: 1.2; color: #0E1B2B; font-weight: 800; margin: 0 0 14pt 0; letter-spacing: -0.4pt; }}
.title-rule {{ width: 52pt; height: 3pt; border-radius: 2pt; background: linear-gradient(90deg, #E4B15D, #B8873B); margin-bottom: 20pt; }}
.byline-row {{ display: flex; align-items: center; gap: 9pt; margin-bottom: 4pt; padding-bottom: 18pt; border-bottom: 0.75pt solid rgba(22,20,16,0.1); }}
.byline-name {{ font-family: 'Manrope'; font-size: 9.5pt; font-weight: 800; color: #161410; }}
.byline-sep {{ color: #B8873B; }}
.byline-meta {{ font-family: 'Manrope'; font-size: 9pt; font-weight: 500; color: rgba(22,20,16,0.45); }}
.article-body {{ font-family: 'Manrope'; font-size: 10.8pt; line-height: 1.8; color: rgba(22,20,16,0.82); margin-top: 20pt; }}
.article-body p {{ margin: 0 0 13pt 0; }}
.article-body h2 {{ font-family: 'Bricolage'; font-size: 15pt; color: #0E1B2B; font-weight: 700; margin: 24pt 0 10pt 0; padding-left: 12pt; border-left: 3pt solid #B8873B; line-height: 1.3; }}
.callout {{ background: #ffffff; border: 0.75pt solid rgba(22,20,16,0.08); border-radius: 14pt; padding: 18pt 20pt; margin: 26pt 0 14pt 0; }}
.callout-label {{ color: #B8873B; font-family: 'Manrope'; font-size: 7.5pt; font-weight: 800; letter-spacing: 1.6pt; text-transform: uppercase; margin-bottom: 7pt; }}
.callout-author {{ font-family: 'Bricolage'; font-size: 11pt; font-weight: 800; color: #0E1B2B; }}
.callout-role {{ font-family: 'Manrope'; font-size: 9pt; font-weight: 500; color: rgba(22,20,16,0.5); margin-top: 2pt; }}
.cta-box {{ background-color: #0E1B2B; border-radius: 16pt; padding: 22pt 24pt; margin: 14pt 0 0 0; display: flex; align-items: center; justify-content: space-between; gap: 18pt; }}
.cta-box h3 {{ font-family: 'Bricolage'; color: #F8F5EF; font-size: 13pt; font-weight: 800; margin: 0 0 4pt 0; }}
.cta-box p {{ font-family: 'Manrope'; color: rgba(248,245,239,0.62); font-size: 9pt; font-weight: 500; margin: 0; }}
.cta-pill {{ background: linear-gradient(100deg, #E4B15D, #B8873B); color: #161410; font-family: 'Manrope'; font-size: 9pt; font-weight: 800; padding: 10pt 18pt; border-radius: 999pt; white-space: nowrap; }}
.footer-note {{ margin-top: 24pt; padding-top: 16pt; border-top: 0.75pt solid rgba(22,20,16,0.08); font-family: 'Manrope'; font-size: 7.6pt; font-weight: 500; line-height: 1.6; color: rgba(22,20,16,0.4); }}
"""


def build_pdf(title, category, author_name, author_title, blocks, pull_quote, output_filename):
    fonts_css = "".join([
        font_face("Bricolage", "bricolage-grotesque-700.ttf", 700),
        font_face("Bricolage", "bricolage-grotesque-800.ttf", 800),
        font_face("Manrope", "manrope-400.ttf", 400),
        font_face("Manrope", "manrope-500.ttf", 500),
        font_face("Manrope", "manrope-600.ttf", 600),
        font_face("Manrope", "manrope-700.ttf", 700),
        font_face("Manrope", "manrope-800.ttf", 800),
    ])
    css = CSS_TEMPLATE.format(fonts_css=fonts_css)

    svg_data = open(LOGO_SVG_PATH, "rb").read()
    logo_uri = "data:image/svg+xml;base64," + base64.b64encode(svg_data).decode()

    body_html = []
    quote_done = False
    for i, (tag, text) in enumerate(blocks):
        if tag == "h2":
            body_html.append(f"<h2>{text}</h2>")
        else:
            body_html.append(f"<p>{text}</p>")
        if not quote_done and tag == "p" and i > 1 and pull_quote:
            body_html.append(f'<div class="pull-quote" style="margin:24pt 0; padding:4pt 0 4pt 22pt; border-left:2.5pt solid #E4B15D;">'
                              f'<p style="font-family:\'Bricolage\'; font-size:14pt; font-weight:700; font-style:italic; color:#123A5C; line-height:1.45; margin:0;">'
                              f'&#8220;{pull_quote}&#8221;</p></div>')
            quote_done = True

    doc = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{css}</style></head>
<body>
<div class="running-header-left"><img src="{logo_uri}"><span>STERLING <span class="rh-gold">&amp; CROSS</span></span></div>
<div class="running-header-right">{category}</div>
<div class="band">
  <div class="band-row"><img src="{logo_uri}"><span class="wordmark">STERLING <b>&amp; CROSS</b></span></div>
  <div class="tagline">Global Legal Counsel</div>
</div>
<div class="body-wrap">
  <div class="eyebrow-row"><span class="eyebrow">{category}</span><span class="eyebrow-dot"></span><span class="eyebrow">Insight</span></div>
  <h1 class="title">{title}</h1>
  <div class="title-rule"></div>
  <div class="byline-row">
    <span class="byline-name">{author_name}</span><span class="byline-sep">&middot;</span><span class="byline-meta">{author_title}</span>
  </div>
  <div class="article-body">{''.join(body_html)}</div>
  <div class="callout">
    <div class="callout-label">Written By</div>
    <div class="callout-author">{author_name}</div>
    <div class="callout-role">{author_title}</div>
  </div>
  <div class="cta-box">
    <div><h3>Have a matter like this?</h3><p>Book a consultation and we'll connect you with the right team.</p></div>
    <div class="cta-pill">sterlingcross.law</div>
  </div>
  <div class="footer-note">&copy; Sterling &amp; Cross Law Firm. This publication is provided for general informational purposes only and does not constitute legal advice.</div>
</div>
</body></html>"""

    HTML(string=doc, base_url=".").write_pdf(output_filename)
    print(f"Done! Created {output_filename}")


# ==================================================================
# EDIT BELOW THIS LINE — fill in your own article's details
# ==================================================================

TITLE = "Understanding Corporate Compliance, A Guide for Business Owners"
CATEGORY = "Corporate Law"
AUTHOR_NAME = "Charles Antoni Wojcik"
AUTHOR_TITLE = "Senior Partner, Sterling & Cross"
PULL_QUOTE = "Fixing it later always costs more than preventing it would have."   # or set to None

# Each line below is one paragraph or heading.
# Use "h2" for a subheading, "p" for a normal paragraph.
BLOCKS = [
    ("p", "Most business owners do not think about compliance until something goes wrong."),
    ("h2", "Start with the basics that get skipped"),
    ("p", "Annual filings, updated operating agreements, and proper corporate records sound tedious, but they matter."),
    ("h2", "Contracts are only as good as their weakest clause"),
    ("p", "A contract template pulled from the internet might miss the one case that actually happens."),
]

OUTPUT_FILENAME = "my-article.pdf"

# ==================================================================
# Nothing to edit below this line — this just runs everything above
# ==================================================================
if __name__ == "__main__":
    build_pdf(TITLE, CATEGORY, AUTHOR_NAME, AUTHOR_TITLE, BLOCKS, PULL_QUOTE, OUTPUT_FILENAME)

# Sterling & Cross Law Firm, Portfolio Project (v7)

A 62 page international law firm website built with Tailwind CSS via
CDN, Font Awesome, GSAP, and Globe.gl, no build step required. Every
page is a plain static HTML file, open any of them directly or serve
the folder with any static host.

## Site structure

The site uses a fixed left sidebar (not a top navbar) on desktop,
which collapses into a slide-out drawer on mobile/tablet, plus a
secondary top bar above the page content for search, a Resources
dropdown, Contact, and the primary call-to-action. Every page shares
the exact same sidebar, top bar, and footer markup, kept in sync
across all 62 files by extracting one page's block and propagating
it to the rest, never hand-edited per page.

## Pages (62 total)

    index.html                       Home, cinematic hero, real 3D globe
    about.html                       Firm story, milestones, values
    practice-areas.html              25 practice areas, full detail each
    industries.html                  10 industry groups, full detail each
    attorneys.html                   Attorney directory, flip cards, filterable
    attorney-*.html (16 files)       Individual attorney bios + vCard download
    locations.html                   14 offices, flat dot-matrix world map
    matters.html                     Notable matters, filterable, 2+ per practice area
    testimonials.html                Client testimonials, Google rating stat
    blog.html                        Insights hub, filterable
    blog-*.html (17 files)           Articles, guides, and client alerts
    press.html                       Press & media, downloadable media kit
    publications.html                Client alerts and guides
    events.html                      Firm events
    glossary.html                    Legal glossary, A-Z jump nav
    faq.html                         FAQ accordion, FAQPage schema
    quiz.html                        Practice area finder, branching quiz
    checklist.html                   Interactive consultation checklist, 9 practice tabs
    careers.html                     Careers, culture video
    diversity.html                   DEI page
    sustainability.html              ESG page
    pro-bono.html                    Pro bono page
    alumni.html                      Alumni network
    recognition.html                 Rankings and awards, 11 practice-area filters
    glance.html                      Firm at a glance, stats
    contact.html                     Contact form + methods
    consultation.html                7-step consultation booking flow, photo uploads
    make-payment.html                Existing-client payment request form
    privacy-policy.html              Privacy policy
    terms.html                       Terms of service
    404.html                         Custom 404

## The 25 practice areas

Corporate & M&A, Capital Markets, Private Equity, Antitrust &
Competition, Litigation & Arbitration, Restructuring, Intellectual
Property, Tax, Employment, Real Estate, Family Law, Criminal Defense
& White Collar, Estate Planning, Banking & Finance, Project Finance &
Energy, White Collar Defense, Data Privacy & Cybersecurity,
Environmental & ESG, Insurance & Reinsurance, Immigration & Global
Mobility, Sports & Entertainment, Government Benefits & Disability,
Probate & Estate Administration, Personal Injury, Wrongful Death.

Every one of these has: a full detail section on `practice-areas.html`,
a card in that page's photo grid, at least 2 matters on `matters.html`,
a filter option wherever filters exist (attorneys, checklist, blog,
publications, recognition), and a link in both Resources dropdowns
(sidebar and top bar).

## Real, working features (not decoration)

- **Site search** (`js/main.js`): press the search icon or Cmd/Ctrl+K,
  live-filters a real index of every page
- **Custom select dropdowns** (`js/custom-select.js`): every `<select>`
  on the site is progressively enhanced into a fully-styled listbox,
  since browsers don't allow CSS to style native option lists. The
  real `<select>` stays in the DOM and functional if the script fails
  to load for any reason.
- **Custom date picker**: the consultation form's date-of-birth field
  is a fully custom-built calendar dropdown (month/year jump, Clear,
  Today), since a native `<input type="date">` calendar popup can't
  be restyled with CSS at all, it's rendered by the OS/browser.
- **Real 3D globe** (`js/globe-init.js`, homepage only): built on
  Globe.gl/Three.js, all 14 offices at their real lat/lng, drag to
  rotate, click a pin to jump to that office
- **Flat world map** (`locations.html` only): a self-contained SVG
  dot-matrix map (no external map data dependency), same 14 offices,
  clicking a pin scrolls to and highlights the matching office card
- **Multi-step consultation flow**: 7 real steps with progress
  indicator, real required-field validation (including checkbox and
  radio groups, not just text fields) that blocks advancing to the
  next step until complete, 3 photo/document upload slots, submits
  to Basin (see Basin setup below)
- **Quiz and checklist**: real branching logic and local state, not
  static content
- **vCards**: all 16 attorneys have a real, valid `.vcf` file in
  `/vcards`
- **Structured data**: LegalService schema (homepage), FAQPage schema
  (faq.html), BreadcrumbList schema (every blog post and attorney
  page), Person schema (every attorney page)
- **Page transition curtain**: covers the page on first paint (no
  flash of unstyled content) and on internal link clicks
- **Install/pin icons**: full Android home-screen install support
  (with a properly padded maskable icon, not just a cropped logo),
  iOS home-screen support, Windows taskbar/Start tile pinning via
  `assets/browserconfig.xml`, and a Safari pinned-tab mask icon

## Before this goes live

1. **Photography.** Every image is a `picsum.photos` placeholder.
   See `Sterling-Cross-Elite-Photo-Spec.md` for a full shot list.
2. **Phone numbers.** The main firm number and the Chicago HQ direct
   line are real and used consistently site-wide, including inside
   the JSON-LD schema data. Individual attorney extensions and
   individual office numbers are still placeholders (`555-01xx`),
   swap those in `attorney-*.html` and `locations.html` when real
   ones exist.
3. **Form backends — this is the one with actual moving parts, read
   it before assuming forms work:**
   - **General contact form and the newsletter signup** use
     Web3Forms, and already have a real, working access key baked
     in (`a6303336-d5fe-4e31-a718-09d8943e7b86`). Get your own free
     key at https://web3forms.com and replace it everywhere it
     appears if you want submissions going to a different inbox.
   - **The consultation intake form is different and still needs
     setup.** Web3Forms' free plan does not support file uploads at
     all (confirmed directly against their pricing page, it's a
     Pro-only feature), and the intake form has 3 photo/document
     upload fields. So that one form specifically is wired to
     **Basin** (usebasin.com) instead, whose free plan genuinely
     includes file uploads (confirmed on Basin's own pricing table:
     50 submissions/month, 100MB uploads, no card required). Right
     now `consultation.html`'s form action is still the placeholder
     `https://usebasin.com/f/YOUR_BASIN_FORM_ID` — **it will not
     submit successfully until you swap in a real Basin form ID.**
     Full walkthrough: `How-To-Set-Up-Basin.md`.
4. **Social links.** Every social icon (sidebar, footer) currently
   points to `#`, there are no real social URLs yet. The homepage's
   `sameAs` schema entries are also placeholder URLs for the same
   reason, update those alongside the real social links.
5. **Content.** Attorney names/bios, client testimonials, matter
   descriptions, and press releases are all placeholder content,
   replace with real, verifiable information before this is shown
   to anyone outside a portfolio context. Two attorneys in particular
   (Nia Brooks, Jordan Hale) were added specifically to give the
   newer practice areas (Government Benefits & Disability, Personal
   Injury, Wrongful Death) a named chair, and are entirely invented
   placeholders, not based on real people.
6. **Legal review.** Have a licensed attorney review the Privacy
   Policy, Terms of Service, and any disclaimers before this goes
   live for a real firm.
7. **Payment.** `make-payment.html` and the consultation flow's
   final step both submit a payment *request*, no card data is
   collected or transmitted anywhere. When ready to accept real
   payment, use Stripe Payment Links (a free, hosted checkout page
   Stripe generates for you), never a custom form that collects raw
   card numbers, that is not PCI compliant.

## Deploy

    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <your-repo-url>
    git push -u origin main

Then, for GitHub Pages: Settings, Pages, Deploy from branch, main,
/ (root), Save. Any static host (Netlify, Vercel, Static.app, S3)
works identically since there is no build step.

## Testing without a computer

Because every dependency (Tailwind, GSAP, Globe.gl, fonts, images)
loads from a CDN over HTTPS, the site works fully even opened
locally via `file://` from a phone's Files app, as long as the
device has an internet connection. For a real hosted link without a
computer, static.app accepts a zip upload directly from a phone
browser.

## Other guides in this folder

- `How-To-Add-A-New-Article-Yourself.md` — add a new blog post/guide,
  no coding required
- `How-To-Generate-PDFs-Yourself-With-Code.md` — the one piece of the
  article workflow that genuinely requires running code
- `How-To-Set-Up-Photo-Uploads.md` — background on why the intake
  form's uploads needed a different backend than the rest of the site
- `How-To-Set-Up-Basin.md` — step-by-step Basin account setup, same
  baby-steps format as the article guide
- `Sterling-Cross-Elite-Photo-Spec.md` — full photography/video shot
  list
- `Sterling-Cross-Photography-Video-Guide.md` — plain-English
  companion to the shot spec
- `Sterling-Cross-Questionnaire-and-Media-Guide_1.md` — content
  questionnaire for filling in real firm details
#   s t e r l i n g - c r o s s  
 
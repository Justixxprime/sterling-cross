# Sterling & Cross — Editing the Questionnaire + Every Photo/Video, One by One

---

# PART 1: How to edit the questionnaire — ultra baby steps

The questionnaire lives in one file: **`consultation.html`**. Open it in any plain text editor (Notepad, TextEdit, or better, a free code editor called VS Code — it color-codes everything so it's much easier to read). You do **not** need to know how to code to change words. You only need to be careful when you're changing *structure* (adding/removing whole questions or steps) — I'll mark those parts clearly.

## Step 1: Understand what you're looking at (read this first, it makes everything else easy)

Open `consultation.html`. It looks like a wall of text with lots of `< >` symbols. Don't panic — here's the one idea that unlocks the whole file:

> **Everything between a `<tag>` and its matching `</tag>` is what shows up on the actual website.** The tags themselves are just invisible instructions for how to display it (make this bold, make this a button, make this a text box).

Example. This line:
```html
<h2>Tell us about your matter</h2>
```
Shows up on the website as the words **"Tell us about your matter"** — nothing else. If you want it to say "What happened?" instead, you just change the words *between* the tags:
```html
<h2>What happened?</h2>
```
That's it. That's 90% of all the editing you'll ever need to do. Find the words you want to change, retype them, save the file.

## Step 2: The questionnaire is built from 7 "panels," one shown at a time

The form has 7 steps: **Your details → Your matter → Background → References → Additional info → Review → Payment**. In the file, each step is one big block that starts like this:

```html
<div id="panel-details" class="step-panel active">
  ...all the questions for this step live in here...
</div>
```

Search the file (Ctrl+F or Cmd+F) for `panel-details`, `panel-matter`, `panel-background`, `panel-references`, `panel-additional`, `panel-confirm`, and `panel-payment` — each one is a separate step. JavaScript (a different file, `js/main.js`) shows one panel at a time and hides the rest; you don't need to touch that part at all just to edit words.

## Step 3: How to change a question's wording (safest, most common edit)

Every question has this shape:
```html
<label class="block text-sm font-bold mb-1.5">Full legal name</label>
<input type="text" id="fullName" name="name" required class="..." />
```
The words "Full legal name" are the question the visitor sees. Just retype them:
```html
<label class="block text-sm font-bold mb-1.5">What's your full name?</label>
```
**Leave everything else on that line alone** — `id="fullName"`, `name="name"`, `required`, and the long `class="..."` string are the invisible plumbing that makes the box actually work and makes the answer show up correctly in your email. Only touch the plain English words sitting between `<label>` and `</label>`.

## Step 4: How to change the big heading and intro text above the form

Near the top of the file, search for `Let's get your case started` — that's your page's main headline (an `<h1>`). Right under it is a `<p>` tag with the subtitle. Change the words the same way as Step 3. This is the very first thing anyone sees on this page, so this is a high-value, low-risk edit — go ahead and make it sound like you.

## Step 5: How to add a brand new question inside an existing step

Let's say you want to add a "Preferred contact method" question to Step 1 (Your details). Find a question block that already looks similar (a simple text field), for example:
```html
<div>
  <label class="block text-sm font-bold mb-1.5">Phone number</label>
  <input type="tel" id="phone" name="phone" required class="w-full border border-ink/15 rounded-lg px-4 py-3" />
</div>
```
**Copy this whole block** (from the `<div>` to the matching `</div>`), paste it right after itself, then edit only 3 things in your new copy:
1. The label text → `Preferred contact method`
2. The `id="phone"` → change to something new and unique, e.g. `id="contactPref"`
3. The `name="phone"` → change to something new, e.g. `name="contact_preference"`

**Rule of thumb: every `id` on the page must be different from every other `id`.** Never reuse one. That's the one rule that actually matters here — everything else is just words.

## Step 6: How to add a whole new step (a new "page" of the questionnaire) — the careful one

This is the one part of the questionnaire where you genuinely need to follow the recipe exactly, because 3 different places in the file all need to agree with each other, or the form will break.

**6a. Duplicate an existing step.** Copy an entire panel block, from `<div id="panel-additional" ...>` all the way down to its matching closing `</div>`, paste it right after. In your new copy, change:
- `id="panel-additional"` → `id="panel-mynewstep"` (pick your own short name, no spaces)
- The heading text and all the questions inside, to whatever you actually want to ask

**6b. Add a matching step dot.** Near the top of the form, search for `stepIndicator`. You'll see a row like:
```html
<div id="dot-details" class="step-dot flex-shrink-0">1</div>
<div class="step-line"></div>
<div id="dot-matter" class="step-dot flex-shrink-0">2</div>
```
Add one more dot in the position where your new step belongs, matching the id you chose:
```html
<div id="dot-mynewstep" class="step-dot flex-shrink-0">8</div>
```
(update the numbers after it too, e.g. "Confirm" becomes 9, "Payment" becomes 10 — just relabel them in order)

**6c. Tell the JavaScript your new step exists.** This is the one step people forget, and it's the one that actually makes the new step work. Open `js/main.js`, search for this exact line near the top of the consultation-form section:
```js
const stepNames = ['details', 'matter', 'background', 'references', 'additional', 'confirm', 'payment'];
```
This one line controls the entire order of the whole questionnaire. Add your new step's short name into the list, in the position you want it to appear:
```js
const stepNames = ['details', 'matter', 'background', 'references', 'additional', 'mynewstep', 'confirm', 'payment'];
```
The name you type here (`'mynewstep'`) must exactly match what you used in `id="panel-mynewstep"` and `id="dot-mynewstep"` — same spelling, same lowercase, no spaces. That's the whole trick: three places, one matching name.

## Step 7: How to remove a step

Reverse of Step 6: delete the panel block, delete its dot, and delete its name from the `stepNames` list in `main.js`. Do all three, or the step count and the actual panels will disagree and the "Continue" button will behave oddly.

## Step 8: What NOT to touch (design/colors) unless you want to learn CSS too

Every `class="..."` you see (like `class="w-full border border-ink/15 rounded-lg px-4 py-3"`) controls spacing, color, and shape — it's a different system called Tailwind CSS. You genuinely don't need to touch this to change words or add questions. If you want to change the actual visual design (colors, fonts, spacing), that lives partly here and partly in `css/style.css` — that's a bigger topic than words-editing, so tell me what specific look you're going for and I'll make that change precisely, rather than you hand-editing class names and risking something breaking silently.

## Step 9: How to test your edit

1. Save the file.
2. Double-click `consultation.html` on your computer — it opens in your browser exactly as a visitor would see it (no server needed).
3. Click through all 7 steps. Check nothing looks cut off, every button still says the right thing, and (if you added a step) it actually appears between the two steps you meant it to.
4. If anything looks wrong, the single most common cause is a typo in an `id` — go back and check the three places from Step 6c match exactly.

---

# PART 2: Every photo and video on the site, one by one, first page to last

132 unique images total (I removed nothing and combined nothing — every row below is one distinct photo slot, in the exact order it first appears as you'd browse from the homepage onward). 2 of these are video-poster placeholders, marked 🎥.

### Homepage (index.html) — images 1–22
1. **Hero slide 1/4** — attorneys mid-conversation around a conference table, candid angle, soft window light
2. **Hero slide 2/4** — international city skyline at dusk (blue hour), for the "global firm" beat
3. **Hero slide 3/4** — tighter boardroom negotiation shot, 2–3 people, documents and hands visible
4. **Hero slide 4/4** — a second, different city skyline at dusk, for slideshow variety
5. **Small decorative icon-style image** (currently unlabeled/no alt text) — a subtle abstract or textured graphic, not a literal "scales of justice" photo
6. **Tiny 80×80 client avatar**, used in a homepage trust/social-proof spot — a real or stand-in client headshot, small and simple
7. 🎥 **"Firm overview film" video poster** — the best single frame pulled from your ~60–90 second overview film, shown before the visitor presses play
8. **"Attorney portrait"** — a general-purpose attorney photo used decoratively on the homepage (can reuse one of your real attorney headshots once you have them)
9. **"Office interior"** — a general office/reception shot, same one used decoratively elsewhere is fine
10. **Senior partner portrait**, tall crop (700×900) — your most senior/founding partner, formal but warm portrait
11. **Corporate law** practice thumbnail — skyscraper facades or a trading-floor-adjacent shot
12. **Litigation & arbitration** thumbnail — courthouse architecture or an empty courtroom bench
13. **Private equity** thumbnail — handshake-free "closing a deal" energy, documents/signing
14. **Restructuring** thumbnail — similarly financial/corporate, slightly more tense or dramatic lighting
15. **Financial services** industry thumbnail — a bank interior, trading floor, or fintech office
16. **Technology** industry thumbnail — a clean, modern tech office or a macro shot of hardware/circuitry
17. **Energy & infrastructure** industry thumbnail — solar/wind infrastructure or an industrial site
18. **Healthcare** industry thumbnail — a hospital corridor or lab, kept dignified/not clinical-cold
19. **"Cross-border merger" case study thumbnail** — two skylines or a signing-table moment
20. **"Restructuring" case study thumbnail** — a serious, quieter corporate photo
21. **"Litigation" case study thumbnail** — courthouse steps or hallway
22. **"Capital markets / IPO" case study thumbnail** — a trading floor or stock-ticker-adjacent shot

### About (about.html) — images 23–28
23. **Page hero banner** — your flagship office's exterior or lobby, this is the page's "who we are" opening shot
24. **Firm office photo** — a second interior shot, different room than #23 (e.g. a conference room)
25. **Attorney headshot** (labeled "Charles Antoni Wojcik" placeholder) — real headshot #1, studio-consistent
26. **Attorney headshot** ("Jane Smith" placeholder) — real headshot #2, same studio setup as #25
27. **Attorney headshot** ("Michael Brown" placeholder) — real headshot #3
28. **Attorney headshot** ("Emily Johnson" placeholder) — real headshot #4

### Practice Areas (practice-areas.html) — images 29–48
29. **Page hero banner** — abstract architectural shot (glass, steel, dramatic angle), not people
30. **Small decorative image** (no alt text) — subtle background texture, not a literal photo subject
31. **Corporate & M&A** — skyscraper/trading-floor energy
32. **Capital Markets** — stock exchange or trading floor
33. **Antitrust & Competition** — courthouse or regulatory-building architecture
34. **Intellectual Property** — a lab, a patent document macro shot, or a tech workspace
35. **Tax** — clean, precise office/documents imagery, calm not chaotic
36. **Employment** — a genuine, warm workplace moment (this practice is about people, let it feel human)
37. **Real Estate** — a skyline or a striking piece of architecture/property
38. **Family Law** — warm, human, home-adjacent (hands, a kitchen table) — the one area to go soft, not corporate
39. **Criminal Defense & White Collar** — courthouse hallway, single figure, dramatic side light
40. **Estate Planning** — same warm/human direction as Family Law, generations-themed if possible
41. **Banking & Finance** — bank interior or financial district architecture
42. **Project Finance & Energy** — energy infrastructure (solar, wind, or a plant)
43. **White Collar Defense** — same visual family as #39, courthouse/legal-drama-adjacent
44. **Data Privacy & Cybersecurity** — server room or macro circuit-board shot
45. **Environmental & ESG** — nature/infrastructure balance shot (a wind farm, green building)
46. **Insurance & Reinsurance** — clean corporate office imagery
47. **Immigration & Global Mobility** — a passport/boarding pass, or an airport, handled respectfully
48. **Sports & Entertainment** — a stadium, stage, or production set exterior

### Industries (industries.html) — images 49–66
49. **Page hero banner** — abstract architectural shot, same direction as the Practice Areas hero
50. **Small decorative image** (no alt text) — subtle background texture
51. **Private Capital** (tall crop) — an investment-office interior or skyline
52. **Real Estate** (tall crop) — striking property/architecture shot
53. **Industrials & Manufacturing** (tall crop) — a factory floor or heavy-industry shot
54. **Media & Telecom** (tall crop) — a broadcast studio or antenna/tower shot
55. **Consumer & Retail** (tall crop) — a retail storefront or e-commerce warehouse
56. **Transportation** (tall crop) — a shipping port, airport, or logistics hub
57. **Financial Services** (wide crop) — second angle/companion shot to #51's sector, bank or trading floor
58. **Technology** (wide crop) — companion shot to the tall tech-sector image
59. **Energy & Infrastructure** (wide crop) — companion shot, infrastructure/industrial
60. **Healthcare & Life Sciences** (wide crop) — hospital or lab, companion angle
61. **Private Capital** (wide crop) — companion shot to #51
62. **Real Estate** (wide crop) — companion shot to #52
63. **Industrials & Manufacturing** (wide crop) — companion shot to #53
64. **Media & Telecom** (wide crop) — companion shot to #54
65. **Consumer & Retail** (wide crop) — companion shot to #55
66. **Transportation** (wide crop) — companion shot to #56

### Attorneys (attorneys.html) — images 67–77
67. **Page hero banner** — candid shot of several attorneys walking through an office hallway, slight motion blur
68. **Attorney headshot** — "David Okafor, Associate" placeholder, studio headshot
69. **Attorney headshot** — "Sarah Nwosu, Associate" placeholder
70. **Attorney headshot** — "Robert Kim, Associate" placeholder
71. **Attorney headshot** — "Grace Adeyemi, Associate" placeholder
72. **Attorney headshot** — "Camila Torres, Partner" placeholder
73. **Attorney headshot** — "Daniel Osei, Partner" placeholder
74. **Attorney headshot** — "Priya Sharma, Partner" placeholder
75. **Attorney headshot** — "Marcus Webb, Partner" placeholder
76. **Attorney headshot** — "Elena Vasquez, Associate" placeholder
77. **Attorney headshot** — "Thomas Reid, Associate" placeholder

*(All 10 of these, plus the 4 on the About page, are the same 14-person set — same studio, same lighting, same backdrop, same crop style, across all 14.)*

### Locations (locations.html) — images 78–92
78. **Page hero banner** — a world map graphic, an airport, or a skyline collage representing "global"
79. **Chicago office** — real interior, or a Chicago skyline if no interior yet (this is your HQ, worth prioritizing)
80. **New York office** — real interior or NYC skyline
81. **Washington DC office** — real interior or DC skyline (Capitol-adjacent architecture)
82. **Los Angeles office** — real interior or LA skyline
83. **London office** — real interior or London skyline
84. **Paris office** — real interior or Paris skyline
85. **Frankfurt office** — real interior or Frankfurt skyline
86. **Dubai office** — real interior or Dubai skyline
87. **Johannesburg office** — real interior or Johannesburg skyline
88. **Singapore office** — real interior or Singapore skyline
89. **Hong Kong office** — real interior or Hong Kong skyline
90. **Tokyo office** — real interior or Tokyo skyline
91. **Sydney office** — real interior or Sydney skyline
92. **São Paulo office** — real interior or São Paulo skyline

### Blog (blog.html) — images 93–100
93. **Page hero banner** — abstract/architectural, editorial-magazine feeling
94. **Featured article image** (large) — "Corporate compliance guide," editorial-style photo matching that topic
95. **Article thumbnail** — same "Corporate compliance guide" article, smaller crop
96. **Article thumbnail** — "Family law proceedings," warm/human direction
97. **Article thumbnail** — "Estate planning importance," warm/human direction
98. **Article thumbnail** — "Cross-border reporting alert," corporate/global direction
99. **Article thumbnail** — "ESG disclosure checklist," nature/infrastructure-balance direction
100. **Article thumbnail** — "Video briefing," a video-call or presentation-style still

### Publications (publications.html) — images 101–102
101. **Page hero banner** — editorial/architectural, matches Blog's hero direction
102. **Featured publication image** — "Cross-border reporting alert" theme, large editorial shot

### Events (events.html) — images 103–104
103. **Page hero banner** — a conference hall, podium, or networking-event wide shot
104. **Featured event image** — "Upcoming panel," a stage/panel-discussion setup

### FAQ (faq.html) — image 105
105. **Page hero banner** — can safely reuse a strong architectural/skyline shot; this page is read for content, not mood

### Glossary (glossary.html) — image 106
106. **Page hero banner** — same direction as FAQ, calm architectural/skyline shot

### Press & Media (press.html) — image 107
107. **Page hero banner** — a press-conference or media-wall style shot, or reuse a strong skyline

### Careers (careers.html) — images 108–109
108. **Page hero banner** — genuine culture photo: people at a whiteboard or in a casual team moment — the least corporate, most human hero on the site
109. 🎥 **"Life at the firm" video poster** — best frame from your ~60–90 second culture/careers video, more documentary/handheld in feel than the firm overview film

### Diversity, Equity & Inclusion (diversity.html) — images 110–112
110. **Page hero banner** — genuine, warm culture photo, same human direction as Careers
111. **"Team collaboration"** — a real team working moment, candid not posed
112. **"Scholarship program"** — a mentorship or education-adjacent moment (a mentor and mentee, a presentation)

### Pro Bono (pro-bono.html) — images 113–114
113. **Page hero banner** — same warm, human direction as Careers/Diversity
114. **"Pro bono legal aid"** — a real community/volunteer-service moment, respectful and dignified, not staged-looking

### Sustainability (sustainability.html) — image 115
115. **Page hero banner** — nature/infrastructure balance, echoing the ESG practice-area direction

### Alumni Network (alumni.html) — image 116
116. **Page hero banner** — a networking-event or reunion-style wide shot

### Contact (contact.html) — images 117–118
117. **Page hero banner** — reuse a strong skyline or office-exterior shot
118. **"Office location" map image** — this is a map graphic, not a photography subject; a clean branded map or embedded map screenshot works better here than a photo

### Consultation / the questionnaire (consultation.html) — image 119
119. **Page hero banner** — reuse a warm, reassuring shot (a one-on-one conversation, softly lit) since this page is about starting a relationship, not a transaction

### Notable Matters (matters.html) — images 120–121
120. **Page hero banner** — a courthouse, boardroom, or skyline, matching the "big win" energy of this page
121. **Featured matter image** — a strong, single editorial shot representing your best case study

### Recognition (recognition.html) — image 122
122. **Page hero banner** — an awards-ceremony or trophy-adjacent shot, or reuse a dignified office/skyline shot

### Firm at a Glance (glance.html) — image 123
123. **Page hero banner** — a confident, wide establishing shot, reuse a strong skyline

### Testimonials (testimonials.html) — images 124–132
124. **Page hero banner** — a warm, softly-lit handshake or conversation moment (one of the only places this specific cliché is actually appropriate, since the content is literally about client relationships)
125. **Large backdrop image** — "Client meeting at Sterling and Cross," a real or real-feeling consultation moment
126. **Small 80×80 avatar** (unlabeled) — a client photo, same treatment as image #6
127. **Reviewer avatar** — "Emily R.," small real or stand-in client photo
128. **Reviewer avatar** — "Michael T."
129. **Reviewer avatar** — "James L."
130. **Reviewer avatar** — "Patricia N."
131. **Reviewer avatar** — "Daniel K."
132. **Reviewer avatar** — "Grace O."

---

**One reminder from the earlier guide, since it matters most here:** images 25–28 and 68–77 are the same 14 real people. If you only do one category first, make it those 14 — same photographer, same session, same backdrop for all of them. Everything else on this list is secondary to getting your actual team looking consistent and real.

Once you've got any of these ready, send them over (or tell me where they're hosted) and I'll drop them into the exact image slot myself.

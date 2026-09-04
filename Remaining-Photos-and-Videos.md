# What's Still Left, Photos and Videos

Big update from the last round, almost everything came through. This is
what's actually still missing, plus the video question.

## The photo push, what landed

46 photos came through and are already resized, compressed, and placed
across the site: all the industry photos, every corporate and consumer
blog article image, all 9 testimonial avatars plus the named client and
the backdrop, the 3 remaining page heroes, and all 8 one-off spots
(office photo, video poster, featured matter/publication/event, both
diversity photos, second pro bono photo). Charles's headshot is also live
everywhere he appears.

Two files didn't quite make it over, everything else on the last list is
done:

| Article | Suggested filename | Search prompt |
|---|---|---|
| Cross-Border Tax Structuring | `blog-tax-structuring.jpg` | `tax documents calculator finance desk` |
| What Actually Happens During Probate | `probate-process.jpg` | `courthouse steps legal documents folder` |

(Both prompts are repeated from the last search-prompts doc, in case that
one's not handy, landscape orientation, Unsplash.)

## Attorney headshots, still the main thing left

15 attorneys, same as before, this is genuinely the last big category:

| Attorney | File | Search prompt |
|---|---|---|
| Jane Smith, Partner | `attorney-jane-smith.jpg` | `professional businesswoman headshot confident smile office` |
| Michael Brown, Partner | `attorney-michael-brown.jpg` | `senior businessman headshot suit confident office portrait` |
| Emily Johnson, Partner | `attorney-emily-johnson.jpg` | `professional businesswoman headshot suit senior confident` |
| David Okafor, Associate | `attorney-david-okafor.jpg` | `young Black professional businessman headshot suit smiling` |
| Sarah Nwosu, Associate | `attorney-sarah-nwosu.jpg` | `young Black professional businesswoman headshot smiling office` |
| Robert Kim, Associate | `attorney-robert-kim.jpg` | `young Korean American businessman headshot professional suit` |
| Grace Adeyemi, Associate | `attorney-grace-adeyemi.jpg` | `young Nigerian businesswoman headshot professional smiling` |
| Camila Torres, Partner | `attorney-camila-torres.jpg` | `Latina businesswoman headshot professional confident senior` |
| Daniel Osei, Partner | `attorney-daniel-osei.jpg` | `Ghanaian businessman headshot professional confident senior` |
| Priya Sharma, Partner | `attorney-priya-sharma.jpg` | `South Asian Indian businesswoman headshot professional senior` |
| Marcus Webb, Partner | `attorney-marcus-webb.jpg` | `businessman headshot professional confident senior suit` |
| Elena Vasquez, Associate | `attorney-elena-vasquez.jpg` | `young Latina businesswoman headshot professional smiling` |
| Thomas Reid, Associate | `attorney-thomas-reid.jpg` | `young businessman headshot professional smiling office` |
| Jordan Hale, Partner | `attorney-jordan-hale.jpg` | `businessman headshot professional confident senior suit` |
| Nia Brooks, Partner | `attorney-nia-brooks.jpg` | `Black businesswoman headshot professional confident senior` |

Still true from before: no separate search needed for blog byline photos,
each one automatically reuses whichever headshot above matches that
author, once the table above is filled in.

---

## The video question

Checked the whole site carefully: there is exactly **one** spot that
uses video, the "Life at the Firm" culture clip on the Careers page. It's
currently playing a generic stand-in clip (a flower blooming, from a
public example library), with a note already sitting in the code saying
exactly what to do:

> Stand-in reel so the player is fully functional out of the box. Swap
> the `<source src>` for the firm's real culture/careers reel.

I didn't find any video files anywhere in the repo, even though it sounds
like some were sent over, my best guess is they didn't survive the
upload. **GitHub has a hard 100MB limit per file** without special setup
(Git LFS), and video files cross that line easily, if a video was over
that size, GitHub would have silently rejected it rather than erroring
loudly, which would explain why it looks like it "went through" but never
actually landed in the repo.

### What kind of video actually fits this spot

- **Length:** 30 to 90 seconds. It's a modal popup someone clicks into
  from a thumbnail, not a full page takeover, keep it tight.
- **Content:** the surrounding page copy already frames it as
  "Associates and partners on what actually keeps them here", so ideally
  short talking-head clips of people at a firm (real or stock) discussing
  culture, mentorship, or work, not a generic corporate montage.
- **Format:** `.mp4`, H.264 encoded, that's what plays natively
  everywhere without a fallback needed.

### Where to actually get one

Three free options, easiest to hardest:

1. **Use free stock footage as-is** (fastest, works today):
   [Pexels Videos](https://pexels.com/videos) or
   [Coverr.co](https://coverr.co), search `office team meeting candid`
   or `law firm office professionals talking`, both are free for
   commercial use, no attribution required. Won't say "Sterling & Cross"
   specifically, but reads as generic, professional office culture, which
   fits the section fine as a placeholder upgrade.
2. **Host it and just point to the URL** (recommended once a real video
   exists): upload the firm's actual reel to YouTube or Vimeo (both free,
   no file-size headache since it's not living in the git repo at all),
   set it unlisted if it shouldn't show up in public search, and swap the
   `<source src>` for that hosted link instead of a local file, this
   sidesteps the GitHub size limit entirely and is genuinely the better
   long-term setup regardless of file size.
3. **Compress it small enough to actually fit in the repo:** if it needs
   to be a real local file, HandBrake (free, handbrake.fr) can usually
   get a 2-3 minute 1080p clip under 50MB with the "Fast 1080p30" preset
   without a visible quality hit, small enough to push through git
   normally.

Send whichever direction makes sense and I'll wire it in.

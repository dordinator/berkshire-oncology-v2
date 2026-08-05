# Support imagery — credits and rationale

Every image used in the emotional-and-family-support section of `/resources` is
listed here with its licence. Anything added later must be added here at the
same time. This follows the standard set by `public/treatments/CREDITS.md`.

## In use

| File | Section | Source | Licence | Attribution required |
|---|---|---|---|---|
| `hands-table.jpg` | `/resources` — emotional and family support | [Pexels 6975092 — T Leish](https://www.pexels.com/photo/close-up-photo-of-an-elderly-couple-holding-hands-6975092/) | Pexels Licence | No, but photographer credited here as a matter of practice: T Leish, https://www.pexels.com/@leish |

Fetched at 2000px wide via the Pexels CDN's own `?w=2000` resize.
Otherwise unaltered.

## Why these, and what was rejected

The selection rule for this section was **no identifiable faces**. The Pexels
Licence grants use of the photograph; it does not grant model rights, and it
does not permit depicting an identifiable person in a way that implies
something untrue about them. Putting a recognisable face beside "emotional and
family support" on an oncology site invites the reader to conclude that person
has cancer or has been bereaved. Faceless crops, figures at distance and empty
rooms sidestep that entirely.

`hands-table.jpg` is two pairs of genuinely older hands — age spots, prominent
veins, not a hand model — resting clasped on a pine table. It is a domestic
table, not a clinic. The gesture is one person holding another's hand, which is
support rather than treatment.

A second image was fetched and then dropped: Pexels 35228360, low evening sun
through a curtain onto a panelled door (Meltem B.). Warm and peopleless, but
darker than the site's near-white canvas and, being an empty room with a closed
door, it carried a quiet "empty house" reading that the section does not want.
One photograph and the wave motif carry the section instead.

Rejected, and the reasons are worth keeping so nobody re-proposes them:

- **A lone empty park bench in autumn light** (Pexels 595386). Visually the
  warmest option considered. In the UK a wooden bench photographed this way
  reads as a memorial bench, and on a cancer page that reading is close enough
  to the surface that a bereaved reader will make it.
- **An empty armchair with a throw** (Pexels 34992391). Same problem, less
  ambiguous: "the chair they used to sit in".
- **Two silhouettes walking into a sunset** (Pexels 20410814). Reads as end of
  life.
- **An elderly couple holding hands over a table** (Pexels 8790966). Credited
  to "AI25.Studio AI GENERATIVE". Undisclosed AI people on a medical site are
  an authenticity problem.
- **Anything with a surgical mask, cannula, hospital wristband or headscarf.**
  Several results for cancer-adjacent search terms carry these. They stage
  illness for marketing purposes and date the image.

## Before this ships

Run a reverse-image search on `hands-table.jpg`. Free-tier Pexels photographs
are among the most reused images on the internet, and this one may well also
appear on a hospice, funeral director or competitor clinic site. On a page
whose entire product is credibility, that collision matters more than it would
anywhere else.

Commissioned photography would be better than either of these, exactly as
`public/treatments/CREDITS.md` already argues for the treatment pages.

## Provenance gap elsewhere in the repo

`public/treatments/CREDITS.md` and this file are the only credits manifests in
the repo. `public/home`, `public/tariffs`, `public/links` and
`public/consultants` have none. Two of those images also show signs of having
been generated rather than photographed — `home/hero.jpg` has garbled lettering
on a book spine, and `tariffs/hero-plan-a.jpg` has illegible pseudo-text on a
document headed "Your care plan". Both sit on pages where the partnership is
asking to be believed. Worth resolving separately.

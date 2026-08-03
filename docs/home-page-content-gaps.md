# Home page — what the practice still needs to supply

Home and About are one page. The root `/` carries the whole thing and `/about`
301s into it; the children under `/about/*` are untouched and still resolve.

Everything on the page is either drawn from the repo's own content modules or
is a general fact about UK medical regulation that applies to every licensed
consultant in the country.

Nothing practice-specific has been invented. This is the list of what is
therefore *missing*, and what each item would let us write. Each is small — a
sentence or two from the practice in most cases.

---

## 0. The hero photograph — read this first

`public/home/hero.jpg` is **an AI-generated image**, produced with the consent
of the consultant it resembles (Dr Gelareh Eslamian). It is not a photograph of
her, of a real consultation, or of a real Berkshire Oncology consulting room.

Provenance, so it can be reproduced or reversed: the generated original was
1774×887; it was cropped 355px off the left edge to 1419×887 (1.6:1, which
fills a 100svh hero on a desktop with no further cropping), then upscaled to 4K
via Higgsfield's ByteDance upscaler and resized to 3840×2410 for delivery. The
upscale was checked against the original at 1:1 on her face before use — the
likeness is unaltered, which matters for a consented likeness of a real person.
Next.js serves it as a 175 KB WebP.

That is a legitimate choice and it was made deliberately, but it has to stay
documented, because two things follow from it:

- **The image carries no name and no caption.** Its alt text describes a
  consultation generically. Nothing on the page states or implies that it
  depicts a specific person, a specific patient or a specific room. Do not add
  a caption naming her later without revisiting this.
- **It should not be used to imply facilities.** The rooms in the image are not
  the rooms at 13 Bath Road. If the practice ever wants the hero to represent
  its actual environment, it needs a real photograph (see item 7).

Replacing it is a single file swap at that path — nothing in the code changes.

## 0b. Opening hours

The hero's "Call the practice" panel shows the number, the mobile, the email
and the practice manager. It does **not** show opening hours, because they are
not recorded anywhere in the repo, and a published opening time the office does
not keep is worse than none at all.

**Needed:** the hours the practice line is actually answered. The panel has a
place ready for them.

---

## 1. The partnership's own history

**Not stated on the page:** when the partnership was formed, by whom, and why.

The page describes what the partnership *is* and how it works, in the present
tense, because that much is evident from the consultant data. It says nothing
about its founding, because nothing in the repo records it.

**Needed:** the year it was formed, and a sentence on why the founding
consultants set it up. Section 01 would gain a short, genuine origin paragraph —
one of the strongest trust signals available to a partnership, and currently the
biggest single gap.

## 2. Patient feedback

**Not stated on the page:** any testimonial, rating, or satisfaction figure.

Section 08 explains, deliberately, that the practice does not publish
self-selected quotations, and points patients to where independent reviews live
and how to raise a concern. That is an honest position and it can stand
permanently — but only the practice can decide whether it wants to.

**Needed, if the position changes:**
- Which independent review platforms the consultants appear on (Doctify, the
  hospital provider platforms, Google), with links.
- Whether the practice runs its own patient survey, and if so what it measures
  and what the results were.
- Any complaints procedure document that should be linked.

## 3. Referral logistics

**Not stated on the page:** where written referrals should be sent, what should
be in them, or how quickly they are acknowledged.

Section 09 gives the phone number, the practice email and the practice manager,
and says urgent referrals should come by telephone. It states no timescale,
because an unmet published timescale is worse than none.

**Needed:**
- The postal address and/or a dedicated referrals email, if different from the
  general practice email.
- Whether there is a referral proforma.
- A typical acknowledgement time the practice is confident it can meet.
- Whether GPs may contact consultants directly, and how.

## 4. Appraisal and revalidation — the practice-specific half

**Stated on the page (all true of every UK consultant):** annual appraisal
against Good Medical Practice, five-yearly revalidation on the recommendation of
a Responsible Officer, covering NHS and private work alike.

**Needed to go further:** who each consultant's Responsible Officer is, or which
designated body they are connected to. Only worth adding if the practice wants
that level of detail; the general statement is accurate as it stands.

## 5. Which services run at which location

**Not stated on the page:** what actually happens at each of the five sites.

Section 06 lists the hospitals and centres and says the consultant will confirm
where treatment takes place. This mirrors the deliberate decision already
recorded in `src/content/locations.ts`, where `services` is left empty because
sending a patient to the wrong building is a real harm.

**Needed:** for each site — consultations, chemotherapy, radiotherapy, imaging,
follow-up: which apply. This unblocks both this section and the location pages.

## 6. A group photograph

**Not on the page:** there is no group photograph section, because there is no
group photograph. Rather than leave an empty placeholder, the section does not
exist.

**Needed:** one photograph of the partnership together. Landscape, ideally
around 2400px wide. Drop it at `public/home/partnership.jpg` and it can be
placed into section 01.

## 7. Photography of the clinical environments

**Not on the page:** no interior or exterior photography of the consulting rooms
or treatment centres. The page currently carries the consultant portraits and
the existing fine-line architectural drawing of 13 Bath Road.

**Needed, if wanted:** quiet photographs of the consulting rooms, the waiting
area, or the exterior at Bath Road. Architectural and empty rather than
staged-with-patients — consistent with the reference points for this page
(HCA Healthcare UK, Proton International London). No stock photography has been
used anywhere on the page.

## 8. Careers

The IA includes `/about/careers`, which the home page does not currently link
to from its own sections (it remains reachable from the navigation). If the
partnership is actively recruiting, that is worth surfacing.

---

## Two notes on how the page is built

**Every figure is counted, not typed.** Ten consultants, seven clinical
oncologists, three medical, eighteen cancer types, five locations, "since 1999",
"all ten hold GMC registration", "nine of our ten publish declarations of
interest" — all derived from `src/content/consultants.ts`, `specialities.ts` and
`hospitals.ts` at build time. Add an eleventh consultant and the prose updates
itself. Nothing needs hand-editing.

That last figure is worth flagging: **nine** of the ten consultants publish
declarations of interest. Dr Helen O'Donnell's `disclosures` array is empty in
the data. If that is an omission rather than a deliberate blank, filling it in
makes the sentence read "all ten" automatically.

**The visual ambition toggle is temporary.** `/?v=quiet`,
`/?v=integrated`, `/?v=expressive` render three treatments of the same page for
comparison. It is invisible to patients — anyone who does not type the parameter
sees `integrated`. `src/components/sections/about/PartnershipField.tsx` documents
exactly how to delete the two rejected levels and the switch once a choice is
made.

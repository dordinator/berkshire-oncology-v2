# Berkshire Oncology content principles

These instructions apply to all content work in this repository. Treat them as
the default unless the user gives a more specific instruction.

## Purpose

The site should help people understand whether Berkshire Oncology Partnership
can help them, find an appropriate consultant, understand what happens next and
contact the practice. It is a healthcare service, not a conventional marketing
site or a general cancer encyclopedia.

Write for people who may be frightened, tired or taking in a diagnosis. Reduce
the work required to understand and act. Do not use fear, urgency or exaggerated
claims to drive conversion.

## Content hierarchy

Decide content in this order:

1. Verified patient or referrer need.
2. Verified facts about the partnership, consultants, services and locations.
3. Authoritative clinical evidence.
4. Clear page structure and information hierarchy.
5. Berkshire Oncology's voice.
6. SEO refinement and adjacent-site comparison.

Adjacent sites are inspiration, not source material. Use them to study familiar
patterns and tone, not to infer what Berkshire Oncology provides. The agreed
order of reference is HCA UK, Proton International London, Macmillan Cancer
Support and UCLH.

## Voice

- Use calm, direct, human British English.
- Prefer specific facts to adjectives and superlatives.
- Be warm without sentimentality and confident without sounding promotional.
- Write to the reader as `you`; use `we` only when the partnership is genuinely
  the actor.
- Prefer short sentences, active voice and familiar words.
- Introduce one idea at a time. Put the useful answer before background detail.
- Explain unavoidable clinical terms at first use.
- Use `consultant` or `consultant oncologist` when that is what is meant. Do not
  vary terminology merely to avoid repetition.
- Use the word `cancer` plainly where clarity requires it. Do not force it into
  emotional headlines or repeat it for SEO.
- Avoid generic AI-sounding constructions, symmetrical filler, inflated claims,
  excessive em dashes and phrases such as `world-class`, `cutting-edge`,
  `leading`, `seamless journey` or `tailored solutions` unless there is specific
  evidence and a genuine user need.

## YMYL, E-E-A-T and clinical safety

Cancer content is Your Money or Your Life content. Trust is the primary test.

- Never invent, infer or embellish a service, treatment, outcome, qualification,
  hospital relationship, waiting time, price, review or patient experience.
- Distinguish general clinical information from practice-specific claims.
- Support clinical information with current, authoritative sources such as NHS,
  NICE, Cancer Research UK, Macmillan and relevant professional guidance.
- Verify practice claims directly against maintained repository data or approved
  practice information. Another provider's website is not evidence.
- Treat numbers such as consultant counts, location counts and years of service
  as maintenance-sensitive. Prefer data-driven values where possible.
- Avoid guarantees. Qualify variable pathways and outcomes honestly.
- Do not imply that a website can identify the right treatment for someone.
  Treatment information should prepare a person for shared decision-making with
  their consultant and present options neutrally.
- Clinical pages should be capable of showing a named, appropriately qualified
  reviewer, relevant credentials, sources, a last-reviewed date and a next-review
  date. Do not fabricate these fields when they are unavailable.
- Patient quotations, outcomes and testimonials must be real, approved and
  attributable in the manner agreed with the practice. Draft quotations must
  remain clearly marked as unpublished and must never be presented as evidence.
- Make authorship and organisational responsibility clear. Structured data and
  metadata can support trust but cannot replace evidence or clinical review.

## User-centred page design

Start each page or viewport with a clear user task, not an organisational topic.
Useful tasks include:

- finding a consultant for a known cancer type;
- arranging an appointment or second opinion;
- understanding what a treatment is and what it may involve;
- finding where consultation or treatment takes place;
- understanding fees, insurance, referrals and what happens next.

Each substantial page should do the following in an appropriate order:

1. Orientate the reader.
2. Recognise their likely situation without assuming too much.
3. Give the essential answer in plain language.
4. Explain what Berkshire Oncology specifically provides.
5. Substantiate trust with relevant people, places, processes and evidence.
6. Offer one clear, honest next action.

Use progressive disclosure for useful supporting detail, not to hide information
needed to judge the main claim. Do not repeat the same promise in consecutive
viewports; the next section should prove, explain or advance it.

## Typography and content hierarchy

- Use a restrained, consistent type hierarchy: title, subtitle or lede, body
  copy and, where genuinely needed, one smaller supporting style.
- Text performing the same role must use the same size across a viewport and
  across comparable sections. Do not introduce a new size for visual variety.
- Treat a passage as a subtitle or lede only when it briefly frames the section.
  Consecutive explanatory paragraphs are body copy and should share one size,
  even when the first paragraph carries the more important point.
- Reserve the smaller supporting style for labels, captions, metadata and short
  evidence notes. It must not be used to hide information a patient needs.

## Calls to action

- Button labels must describe what happens after the click.
- Use `Book an appointment` only when the contact journey genuinely supports
  booking; otherwise use `Request an appointment` or `Contact the practice`.
- Keep appointment terminology consistent across the page unless different
  actions genuinely occur.
- Do not use pressure language or imply clinical urgency where none has been
  established.

## SEO

- Optimise for the reader's intent first and search language second.
- Use descriptive titles, headings, introductory copy and internal links.
- A brand-led H1 does not need to carry every keyword if the page immediately
  and clearly establishes private oncology, cancer care, service area and next
  step.
- Do not keyword-stuff headings, repeat near-identical phrases, manufacture a
  target word count or create thin pages for query and location variants.
- Every indexable page should add original value, especially verified details
  about consultants, cancer specialisms, treatments, locations and the care
  process.
- Keep metadata, canonical URLs, structured data, navigation and visible copy
  accurate and consistent.

## Accessibility

The site targets WCAG 2.2 Level AA. `/accessibility` currently explains that
assessment is incomplete and does not claim full conformance. Keep the public
statement aligned with actual evidence; an automated pass is not certification.

- Run `npm run a11y` before calling a change done. It sweeps every route at five
  widths, with and without reduced motion, and writes a dated report to
  `docs/a11y/`. It exits non-zero on any violation.
- Automated testing catches roughly a third of it. The rest is keyboard
  traversal, 200% zoom, 400% reflow at 320px and a screen-reader pass. Record
  what was tested, when and by whom in `docs/accessibility-audit-2026-09.md`.
- Every control must show where keyboard focus is. There is no global focus
  ring, so a control that adds none has no indicator at all.
- Automatically moving content lasting more than five seconds needs a way to
  stop it. Auto-updating information has no five-second exception. Honour
  `prefers-reduced-motion`, but do not treat it or temporary hover/focus pausing
  as a replacement for a persistent stop mechanism in the default configuration.
- Never take over keys the browser owns. Arrow, Page and Space scroll the page;
  a component that preventDefaults them removes line-by-line scrolling for
  keyboard users.
- Content must be reachable without the animation that reveals it. A scroll
  position is not an interaction, and a panel that exists only at one scroll
  offset cannot be browsed ahead of.
- Use the native element. A `<button>`, `<a>`, `<details>` or `<label>` carries
  behaviour that a div with a role has to reimplement — and an ARIA role is a
  promise of keyboard behaviour you must then deliver.
- Announce what changes silently. A result count, a swapped panel or a submitted
  form needs a live region that is already in the document before it updates.
- Decorative images take `alt=""`; decorative SVG takes `aria-hidden`. If a
  graphic carries meaning, give it a text equivalent.
- Say when a link opens a new tab, in text a screen reader can reach.
- Existing decisions are recorded in `docs/accessibility-audit-2026-09.md`.
  Read it before reopening one.

## Working method

- Work page by page and viewport by viewport when reviewing or rewriting copy.
- Before editing, identify the job of the section and what the preceding section
  has already said.
- Preserve approved wording unless the user explicitly reopens it.
- For every substantive copy change, be able to state clearly: what it was,
  what it is now and why it changed.
- Flag claims requiring practice or clinical verification instead of silently
  treating them as facts.
- Keep edits scoped to content unless the user requests design or interaction
  changes.
- Build and check the affected pages after implementation. Commit completed,
  approved work in focused commits.

## Current approved homepage hero

Preserve these decisions unless the user changes them:

- Heading: `Exceptional care,` / `personal to you.`
- Supporting copy: `Meet privately with a consultant who specialises in your
  type of cancer, in Reading and at hospitals across Berkshire and Oxford.`
- Primary action: `Book an appointment`.

The emotional headline is a brand promise. The copy and evidence that follow it
must make that promise credible.

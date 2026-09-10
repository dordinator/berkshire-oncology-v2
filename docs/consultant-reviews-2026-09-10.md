# Consultant patient and peer reviews

All consultant profiles now have a Reviews section after Professional work and
before the final contact section. Patient reviews and Peer reviews have separate
views. The desktop review content sits alongside the homepage-sage patient
rating summary and a Call to book button; the layout stacks on smaller screens.
The selector and button use 15px corners and the summary panel uses 20px corners.

Both the overview’s Reviews navigation and its Patient reviews heading link to
the new section. The overview’s small review summary and the bottom summary use
the same consultant-specific data and average calculation. Empty scores and
stars remain decorative and do not announce a rating.

`src/content/consultantReviews.ts` is the maintained source for approved,
verified reviews. It is currently empty. Patient records support the approved
public attribution, review text, date and rating; peer records support the
clinician’s name, role, relationship, approved photo, text and date. A public
verification source can be linked when supplied. Only approved reviews for the
specific consultant belong in this file.

No provider feed is connected, and no third-party reviews, ratings, names or
verification branding have been copied from the visual reference. Both views
currently show clear empty states. Provider integration or approved review data
is needed to populate them. Ratings and counts reflect the published patient
records in the maintained content, not an external provider’s aggregate total.

Validation and its scope are recorded in `accessibility-audit-2026-09.md`.

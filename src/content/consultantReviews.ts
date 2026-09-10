/** Only publish approved, verified reviews belonging to the named consultant.
 * No sample reviews, provider branding or aggregate scores are supplied here. */
type ReviewSource = { name: string; url: string };

type PublishedReview = {
  id: string;
  text: string;
  /** ISO date of the review, not the date it was added to this website. */
  reviewedOn: string;
  source?: ReviewSource;
};

export type PatientReview = PublishedReview & {
  rating: 1 | 2 | 3 | 4 | 5;
  /** Use only the public attribution approved for publication. */
  authorLabel?: string;
};

export type PeerReview = PublishedReview & {
  authorName: string;
  role: string;
  relationship?: string;
  photo?: string;
};

export type ConsultantReviewsContent = {
  patient: PatientReview[];
  peer: PeerReview[];
};

// No verified consultant reviews are currently held in the maintained content.
const reviewsByConsultant: Partial<Record<string, ConsultantReviewsContent>> = {};
const emptyReviews: ConsultantReviewsContent = { patient: [], peer: [] };

export function getConsultantReviews(slug: string): ConsultantReviewsContent {
  return reviewsByConsultant[slug] ?? emptyReviews;
}

export function patientReviewSummary(reviews: PatientReview[]) {
  return {
    count: reviews.length,
    average: reviews.length
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : undefined,
  };
}

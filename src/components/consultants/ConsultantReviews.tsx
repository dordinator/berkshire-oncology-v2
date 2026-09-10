"use client";

import Image from "next/image";
import { useState } from "react";
import { patientReviewSummary, type ConsultantReviewsContent } from "@/content/consultantReviews";
import { site } from "@/content/site";
import Button from "@/components/ui/Button";
import ReviewStars from "./ReviewStars";
import styles from "./ConsultantReviews.module.css";

const reviewTypes = [
  { id: "patient", label: "Patient reviews" },
  { id: "peer", label: "Peer reviews" },
] as const;

function ReviewDate({ date }: { date: string }) {
  return <time dateTime={date}>{new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(date))}</time>;
}

export default function ConsultantReviews({ consultantName, reviews }: {
  consultantName: string;
  reviews: ConsultantReviewsContent;
}) {
  const [selected, setSelected] = useState<"patient" | "peer">("patient");
  const summary = patientReviewSummary(reviews.patient);
  const selectedReviews = reviews[selected];
  const reviewLabel = selected === "patient" ? "patient" : "peer";

  return (
    <section aria-labelledby="consultant-reviews-heading" className={styles.section}>
      <div id="reviews" className="container-wide">
        <h2 id="consultant-reviews-heading" className="sr-only">Patient and peer reviews</h2>
        <div className={styles.layout}>
          <div className={styles.main}>
            <fieldset className={styles.switcher}>
              <legend className="sr-only">Review type</legend>
              {reviewTypes.map(type => <label key={type.id}>
                <input className="sr-only" type="radio" name="consultant-review-type" value={type.id} checked={selected === type.id} onChange={() => setSelected(type.id)} aria-controls={`consultant-${type.id}-reviews`} />
                <span>{type.label}{reviews[type.id].length > 0 && ` (${reviews[type.id].length})`}</span>
              </label>)}
            </fieldset>

            <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">
              {selectedReviews.length > 0
                ? `${selectedReviews.length} published ${reviewLabel} ${selectedReviews.length === 1 ? "review" : "reviews"}`
                : `Awaiting verified ${reviewLabel} reviews`}
            </p>

            {reviewTypes.map(type => (
              <div key={type.id} id={`consultant-${type.id}-reviews`} hidden={selected !== type.id}>
                {reviews[type.id].length === 0 ? (
                  <div className={styles.empty}>
                    <svg className={styles.emptyIcon} aria-hidden="true" viewBox="0 0 48 48" fill="none">
                      <path d="M9 9h30v23H24l-10 7v-7H9V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M17 18h14M17 24h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <h3>{type.id === "patient" ? "Patient feedback" : "Feedback from fellow clinicians"}</h3>
                    <p>No verified {type.id} reviews for {consultantName} have been published here yet.</p>
                  </div>
                ) : (
                  <ul className={styles.reviewList}>
                    {reviews[type.id].map(review => <li key={review.id}>
                      <article>
                        <header className={styles.author}>
                          {"authorName" in review ? <>
                            {review.photo && <Image src={review.photo} alt="" width={64} height={64} className={styles.avatar} />}
                            <div><h3>{review.authorName}</h3><p>{review.role}</p></div>
                          </> : <h3>{review.authorLabel ?? "Verified patient"}</h3>}
                        </header>
                        {"relationship" in review && review.relationship && <p className={styles.relationship}>{review.relationship}</p>}
                        {"rating" in review && <p className={styles.reviewRating}><span className={styles.stars} aria-hidden="true"><ReviewStars rating={review.rating} /></span><span className="sr-only">{review.rating} out of 5</span></p>}
                        <blockquote><p>{review.text}</p></blockquote>
                        <footer className={styles.metadata}>
                          <ReviewDate date={review.reviewedOn} />
                          {review.source && <a href={review.source.url} target="_blank" rel="noopener noreferrer">Verified by {review.source.name}<span className="sr-only"> (opens in a new tab)</span></a>}
                        </footer>
                      </article>
                    </li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <aside className={styles.summary} aria-labelledby="review-summary-heading">
            <h3 id="review-summary-heading">Patient reviews</h3>
            <div className={styles.score} aria-hidden={summary.average === undefined ? true : undefined}>
              <span>{summary.average?.toFixed(2) ?? "—"}</span><span className={styles.outOf}> / 5</span>
            </div>
            <div className={styles.stars} aria-hidden="true"><ReviewStars rating={summary.average} /></div>
            <p className={styles.summaryStatus}>{summary.count > 0
              ? `Based on ${summary.count} published patient ${summary.count === 1 ? "review" : "reviews"}`
              : "Awaiting verified reviews"}</p>
            <Button href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} variant="ghost" arrow={false} className={styles.call}>
              <span className={styles.callContent}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6.5 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-2.5a1 1 0 0 0-.8-1l-3.2-.7a1 1 0 0 0-1 .4l-1.4 1.6a15 15 0 0 1-8.4-8.4L7.8 8a1 1 0 0 0 .4-1l-.7-3.2a1 1 0 0 0-1-.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                <span>Call to book<span className="sr-only"> with {consultantName} on {site.contact.phone}</span></span>
              </span>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}

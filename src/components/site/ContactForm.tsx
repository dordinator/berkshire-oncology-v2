"use client";

import { useState } from "react";
import { IconCheck } from "@/components/ui/Icons";

// The old list ("Admission Query", "Facilities", "Family and Friends Visiting")
// was inpatient-unit language inherited from elsewhere. This is a partnership of
// consultant oncologists — there are no admissions, no wards and no visiting
// hours to ask about. These options match what the site actually offers.
const subjects = [
  "General enquiry",
  "New patient enquiry",
  "I'm already a patient",
  "Tariffs and insurance",
  "Referral from a GP or consultant",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;

    // Honeypot: real users never fill this hidden field.
    if (data.company) {
      setStatus("success");
      form.reset();
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError(
        "Sorry, your message couldn't be sent. Please call 0118 959 8866 or email practicemanager@berkshire-oncology.org.uk directly.",
      );
    }
  }

  if (status === "success") {
    return (
      // Matches the form's h-full so the column doesn't collapse on submit;
      // centred because the thank-you is much shorter than the form it replaces.
      <div className="card-soft flex h-full flex-col items-center justify-center p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <IconCheck className="h-7 w-7" />
        </span>
        <h3 className="mt-6 font-display text-2xl text-ink">Thank you</h3>
        <p className="mt-2 max-w-sm text-ink-muted">
          Your message has been received. A member of the practice team will be in
          touch as soon as possible. For urgent matters, please call{" "}
          <a href="tel:01189598866" className="text-accent hover:underline">
            0118 959 8866
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    // h-full so the card fills its grid column and its bottom edge lines up
    // with the map opposite, whichever of the two columns is taller.
    <form onSubmit={onSubmit} className="card-soft h-full p-6 md:p-8">
      {/* honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="field-label">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="field-label">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            autoComplete="family-name"
            className="field"
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
        />
      </div>

      {/* Optional, but offered: for most enquiries the practice would rather
          ring back than start an email thread. */}
      <div className="mt-5">
        <label htmlFor="phone" className="field-label">
          Telephone{" "}
          <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="field"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="subject" className="field-label">
          Subject
        </label>
        <select id="subject" name="subject" required className="field" defaultValue="">
          <option value="" disabled>
            Please choose…
          </option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="field-label">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} className="field" />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        Please don&apos;t include sensitive clinical details in this form. For urgent
        matters call{" "}
        <a href="tel:01189598866" className="text-accent hover:underline">
          0118 959 8866
        </a>
        . Your data will be processed in accordance with our{" "}
        <a href="/privacy" className="text-accent hover:underline">
          Privacy Notice
        </a>
        .
      </p>

      {status === "error" && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

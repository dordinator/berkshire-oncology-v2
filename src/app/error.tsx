"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[70vh] items-center bg-canvas mesh-bg noise">
      <div className="container-wide text-center">
        <span className="eyebrow justify-center">Something went wrong</span>
        <h1 className="heading-lg mt-5">An unexpected error occurred</h1>
        <p className="body-lg mx-auto mt-6 max-w-xl">
          Please try again. If the problem persists, call the practice on{" "}
          <a href="tel:01189598866" className="text-accent hover:underline">
            0118 959 8866
          </a>
          .
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

export type ConsultantAboutChapter = {
  label: string;
  heading: string;
  paragraphs: string[];
};

export default function ConsultantAboutJourney({ chapters, title }: {
  chapters: ConsultantAboutChapter[];
  title: string;
}) {
  const [summary, ...details] = chapters;
  return <section id="about" data-anchor-align="viewport" className="consultant-about-section consultant-section-rhythm scroll-mt-24 bg-paper-soft text-ink lg:flex lg:items-center">
    <div className="site-gutter grid w-full gap-12 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-[5vw]">
      <div>
        <h2 className="type-feature-title max-w-[10ch] break-words">{title}</h2>
        <div className="type-section-lede mt-8 max-w-[37rem] space-y-5 text-ink-muted">{summary?.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
        <p className="type-supporting mt-6 text-ink-muted">Berkshire profile sources checked 30 August 2026.</p>
      </div>
      <div className="rounded-panel bg-accent-mist px-6 py-3 md:px-9">
        {details.map((chapter, index) => <details key={chapter.label} open={index === 0} className="group border-b border-ink/20 last:border-b-0">
          <summary className="type-card-title flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-6 marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            {chapter.heading}<span aria-hidden="true" className="text-2xl font-normal group-open:rotate-45">+</span>
          </summary>
          <div className="type-body space-y-4 pb-8 text-ink-muted">{chapter.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
        </details>)}
      </div>
    </div>
  </section>;
}

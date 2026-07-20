import PageHeader from "@/components/site/PageHeader";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="Page not found"
        intro="Sorry, we couldn't find the page you were looking for. It may have moved or no longer exists."
      />
      <section className="bg-canvas py-16 md:py-24">
        <div className="container-wide flex flex-wrap gap-4">
          <Button href="/" variant="primary">
            Back to home
          </Button>
          <Button href="/consultants" variant="ghost">
            Our consultants
          </Button>
        </div>
      </section>
    </>
  );
}

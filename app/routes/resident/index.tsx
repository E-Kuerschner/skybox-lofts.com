import type { Route } from "./+types/index";
import { ContentCard } from "~/components/ContentCard";
import { ContactForm } from "~/components/ContactForm";
import { isAuthenticated } from "~/util/authHelpers.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAuthenticated(request, context);

  return {
    contactEmail: context.cloudflare.env.CONTACT_US_EMAIL,
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <ContentCard className="p-0 md:p-8 flex-1">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          News & Announcements
        </h2>
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No announcements at this time.
        </div>
      </ContentCard>
      <ContentCard className="p-0 md:p-8 flex-2">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Contact Us
        </h2>
        <p className="text-muted-foreground mb-6">
          Have a question or concern? Email{" "}
          <span className="text-emerald-600">{loaderData.contactEmail}</span>,
          or submit it using the form below. We will get back to you as soon as
          possible.
        </p>
        <ContactForm />
      </ContentCard>
    </div>
  );
}

import type { Route } from "./+types/ResidentHome";
import { useSearchParams } from "react-router";
import { Mail } from "lucide-react";
import { ContentCard } from "~/components/ContentCard";
import { ContactForm } from "~/components/ContactForm";
import { isAuthenticated } from "~/util/authHelpers.server";
import { StatusBanner } from "~/components/StatusBanner";

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAuthenticated(request, context);

  return {
    contactEmail: context.cloudflare.env.CONTACT_US_EMAIL,
  };
}

export default function ResidentHome({ loaderData }: Route.ComponentProps) {
  const [params] = useSearchParams();

  const verified = params.get("verified");
  return (
    <div className="flex flex-col gap-8">
      {verified === "1" && (
        <StatusBanner
          variant="success"
          message="Thank you! Your email has been verified."
        />
      )}
      {/*<ContentCard*/}
      {/*  className="flex-1"*/}
      {/*  title="News & Messages"*/}
      {/*  iconName="megaphone"*/}
      {/*>*/}
      {/*  {verified === "1" ? (*/}
      {/*    <StatusBanner*/}
      {/*      variant="success"*/}
      {/*      message="Thank you! Your email has been verified."*/}
      {/*    />*/}
      {/*  ) : (*/}
      {/*    <div className="border rounded-lg p-8 text-center text-muted-foreground bg-white">*/}
      {/*      Nothing new right now, check back soon! ☀️*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</ContentCard>*/}
      <ContentCard
        className="flex-2 max-w-xl"
        title="Contact Us"
        icon={Mail}
      >
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

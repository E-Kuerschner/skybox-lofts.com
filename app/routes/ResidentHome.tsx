import type { Route } from "./+types/ResidentHome";
import { Link } from "react-router";
import {
  ChartColumn,
  FileText,
  Mail,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ContentCard } from "~/components/ContentCard";
import { ContactForm } from "~/components/ContactForm";
import { isAuthenticated } from "~/util/authHelpers.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);

  return {
    contactEmail: context.cloudflare.env.CONTACT_US_EMAIL,
    isAdmin: session.user.role === "admin",
  };
}

type NavTileProps = {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

// Large tappable shortcut to a major section of the portal — an extension of the sidebar nav
const NavTile = ({ to, icon: Icon, title, description }: NavTileProps) => {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-1 md:gap-2 rounded-2xl border-2 border-[#2d5016]/10 bg-white p-4 md:p-6 shadow-md transition-all hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-lg active:scale-[0.98]"
    >
      <Icon className="size-6 md:size-8 text-emerald-600 mb-1" />
      <span className="text-base md:text-lg font-semibold text-foreground group-hover:text-emerald-600">
        {title}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground">
        {description}
      </span>
    </Link>
  );
};

export default function ResidentHome({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4 md:w-72 md:shrink-0">
        <NavTile
          to="/resident/documents"
          icon={FileText}
          title="Documents"
          description="Find meeting notes, budgets, and other building paperwork."
        />
        <NavTile
          to="/resident/board"
          icon={Users}
          title="Board Members"
          description="See who is on the HOA board and how to reach them."
        />
        {loaderData.isAdmin && (
          <>
            <NavTile
              to="/resident/management"
              icon={UserCog}
              title="Resident Management"
              description="Add new residents or update who lives in the building."
            />
            <NavTile
              to="/resident/activity"
              icon={ChartColumn}
              title="Activity Log"
              description="Review recent changes made in the resident portal."
            />
          </>
        )}
      </div>
      <ContentCard className="flex-2 max-w-xl" title="Contact Us" icon={Mail}>
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

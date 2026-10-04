import {
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  contactHref,
  opensNewTab,
  type ContactKind,
} from "~/util/contactLinks";
import { cn } from "~/util/ui/utils";

export const contactKinds: Record<
  ContactKind,
  { icon: LucideIcon; verb: string; label: string }
> = {
  phone: { icon: PhoneIcon, verb: "Call", label: "Phone" },
  email: { icon: MailIcon, verb: "Email", label: "Email" },
  website: { icon: GlobeIcon, verb: "Open the website of", label: "Website" },
  address: { icon: MapPinIcon, verb: "Get directions to", label: "Address" },
};

/**
 * A thumb-sized button that calls, emails, opens a website or gets directions
 * straight away. Pass the raw phone number, address or URL; the link is built
 * for you.
 *
 * `circle` sits at the end of a list row; `square` leads a contact cell.
 */
export function ContactButton({
  kind,
  value,
  name,
  shape = "circle",
  className,
}: {
  kind: ContactKind;
  value: string;
  /** Who's being contacted, for the button's spoken label. */
  name: string;
  shape?: "circle" | "square";
  className?: string;
}) {
  const { icon: Icon, verb } = contactKinds[kind];

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn(
        "size-11 md:size-11 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        className,
      )}
    >
      <a
        href={contactHref(kind, value)}
        aria-label={`${verb} ${name}`}
        {...(opensNewTab(kind) && { target: "_blank", rel: "noreferrer" })}
      >
        <Icon />
      </a>
    </Button>
  );
}

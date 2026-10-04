import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { ContactButton, contactKinds } from "~/components/ContactButton";
import { IconButton } from "~/components/IconButton";
import {
  contactHref,
  opensNewTab,
  type ContactKind,
} from "~/util/contactLinks";
import type { ContractorListing } from "./types";

/**
 * Every way to reach a business, one row each. The green tile does the action
 * (call, email, open, directions), as does the value beside it; on wider
 * screens a copy button sits at the end for pasting elsewhere.
 */
export function ContactCells({ contractor }: { contractor: ContractorListing }) {
  const [copied, setCopied] = useState<ContactKind | null>(null);

  const rows = (
    [
      ["phone", contractor.phone],
      ["email", contractor.email],
      ["website", contractor.website],
      ["address", contractor.address],
    ] as const
  ).filter((row): row is readonly [ContactKind, string] => Boolean(row[1]));

  if (rows.length === 0) return null;

  const copy = async (kind: ContactKind, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied((current) => (current === kind ? null : current)), 1500);
  };

  return (
    <ul className="divide-y overflow-hidden rounded-xl border">
      {rows.map(([kind, value]) => (
        <li key={kind} className="flex items-center gap-3 py-2 pr-2 pl-3">
          <ContactButton
            kind={kind}
            value={value}
            name={contractor.businessName}
            shape="square"
          />
          <a
            href={contactHref(kind, value)}
            {...(opensNewTab(kind) && { target: "_blank", rel: "noreferrer" })}
            className="flex min-w-0 grow flex-col"
          >
            <span className="text-xs text-muted-foreground">
              {contactKinds[kind].label}
            </span>
            <span className="truncate font-medium">{value}</span>
          </a>
          <IconButton
            icon={copied === kind ? CheckIcon : CopyIcon}
            label={
              copied === kind
                ? "Copied"
                : `Copy ${contactKinds[kind].label.toLowerCase()}`
            }
            onClick={() => copy(kind, value)}
            className="hidden size-10 md:flex md:size-10"
          />
        </li>
      ))}
    </ul>
  );
}

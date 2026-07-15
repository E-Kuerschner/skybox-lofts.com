import type { Route } from "./+types/index";
import { eq } from "drizzle-orm";
import { data, useFetcher } from "react-router";
import { getAuth } from "~/auth";
import { isAuthenticated } from "~/util/authHelpers.server";
import { getDatabase } from "~/util/database.server";
import * as schema from "../../../database/schema";
import { Switch } from "~/components/ui/switch";

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);
  const db = getDatabase(context);

  // Read the preference straight from the database — the session's cookie
  // cache can lag behind an update made moments ago
  const user = await db
    .select({ receivesGeneralEmails: schema.users.receivesGeneralEmails })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id))
    .get();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { receivesGeneralEmails: user.receivesGeneralEmails };
}

export async function action({ request, context }: Route.ActionArgs) {
  await isAuthenticated(request, context);
  const auth = getAuth(context);

  const formData = await request.formData();
  const receivesGeneralEmails =
    formData.get("receivesGeneralEmails") === "true";

  const { headers } = await auth.api.updateUser({
    headers: request.headers,
    body: { receivesGeneralEmails },
    returnHeaders: true,
  });

  return data({ success: true }, { headers });
}

type PreferenceRowProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const PreferenceRow = ({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: PreferenceRowProps) => {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        aria-label={title}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
};

export default function Preferences({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  // Show the toggle in its new position immediately while the save is in flight
  const receivesGeneralEmails = fetcher.formData
    ? fetcher.formData.get("receivesGeneralEmails") === "true"
    : loaderData.receivesGeneralEmails;

  const handleGeneralEmailsChange = (checked: boolean) => {
    fetcher.submit(
      { receivesGeneralEmails: String(checked) },
      { method: "post" },
    );
  };

  return (
    <div className="bg-white rounded-xl px-4 pt-4 border-1 pb-6 shadow-md">
      <h2 className="text-lg font-semibold">Communications</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Choose which emails you would like to receive from us.
      </p>
      <div className="divide-y">
        <PreferenceRow
          title="Account & sign-in emails"
          description="Important messages about your account, like the links we email you to sign in. These are always on."
          checked
          disabled
        />
        <PreferenceRow
          title="News & announcements"
          description="Community announcements, new website features, and other occasional updates from Skybox Lofts."
          checked={receivesGeneralEmails}
          onCheckedChange={handleGeneralEmailsChange}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Your choices are saved automatically, and you can change them at any
        time.
      </p>
    </div>
  );
}

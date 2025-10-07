import { useMemo } from "react";
import { Link, Outlet, useLocation, useRevalidator } from "react-router";
import { LogOut } from "lucide-react";
import { WrigleyClock } from "~/components/WrigleyClock";
import { ResidentBreadcrumbs } from "~/components/ResidentBreadcrumbs";
import { Button } from "~/components/ui/button";
import { authClient } from "~/util/authClient";
import TextLogo from "../../components/text-logo.svg";

export default function ResidentLayout() {
  const location = useLocation();
  const revalidator = useRevalidator();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const pageTitle = useMemo(() => {
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment === "resident") return "Resident Home";
    if (lastSegment === "documents") return "Resident Documents";
    if (lastSegment === "board") return "Board Members";
    if (lastSegment === "meeting-notes") return "Meeting Notes";
    if (lastSegment === "budget") return "Budget";
    return "Resident Info";
  }, [pathSegments]);

  const handleSignOut = async () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          revalidator.revalidate();
        },
      },
    });
  };

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 border-e border-stone-200 shadow-m">
        <div className="flex flex-col px-8 pt-8">
          <a href="/" aria-label="Go home">
            <img src={TextLogo} alt="Skybox Lofts" className="" />
          </a>
          <WrigleyClock className="h-[100px] w-[100px] self-center my-4" />
          <hr className="border-1 border-stone-500" />
        </div>
        <nav className="flex flex-col">
          <Link
            className="hover:text-emerald-600  py-6 text-center hover:bg-stone-200"
            to="/resident/documents"
          >
            Documents
          </Link>
          <Link
            className="hover:text-emerald-600 py-6 text-center hover:bg-stone-200"
            to="/resident/board"
          >
            Board Members
          </Link>
        </nav>
      </aside>
      <main className="flex-grow">
        <div className="p-6 ps-8 pe-6 flex items-center justify-between border-b border-stone-200">
          <ResidentBreadcrumbs />
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-8">
          <h1 className="mt-4 text-4xl mb-8 text-green-900">{pageTitle}</h1>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

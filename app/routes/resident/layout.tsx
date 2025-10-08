import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useRevalidator } from "react-router";
import { LogOutIcon, Menu, XIcon } from "lucide-react";
import { WrigleyClock } from "~/components/WrigleyClock";
import { ResidentBreadcrumbs } from "~/components/ResidentBreadcrumbs";
import { Button } from "~/components/ui/button";
import { authClient } from "~/util/authClient";
import { cn } from "~/lib/utils";
import TextLogo from "../../components/text-logo.svg";

const SideBarContent = ({ renderLogo = true }: { renderLogo?: boolean }) => {
  return (
    <div>
      <div className="flex flex-col px-8 pt-8">
        {renderLogo && (
          <a href="/" aria-label="Go home">
            <img src={TextLogo} alt="Skybox Lofts" className="" />
          </a>
        )}
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
    </div>
  );
};

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

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenuOpen = () => {
    setIsOpen((open) => !open);
  };

  // close the mobile menu when the location changes
  const [lastLocation, setLastLocation] = useState(location.pathname);
  if (location.pathname !== lastLocation) {
    setIsOpen(false);
    setLastLocation(location.pathname);
  }

  return (
    <div className="relative md:flex h-full">
      <aside className="hidden md:block w-64 shrink-0 border-e border-stone-200 shadow-m">
        <SideBarContent />
      </aside>
      {/* overlay fixed behind the menu */}
      {isOpen && (
        <div
          className="fixed z-10 top-0 left-0 h-dvh w-dvw opacity-15 bg-slate-600"
          onClick={toggleMenuOpen}
        />
      )}
      {/* mobile-only aside that slides in from the left side of the screen */}
      <aside
        className={cn(
          "absolute top-0 z-10 left-0 md:hidden h-full w-64 site-bg -translate-x-full transition-transform duration-500 ease-in-out",
          {
            "-translate-x-0": isOpen,
          },
        )}
      >
        <Button
          onClick={toggleMenuOpen}
          variant="icon"
          aria-label="Close nav menu"
          className="absolute top-4 right-4"
        >
          <XIcon className="size-4" />
        </Button>
        <SideBarContent renderLogo={false} />
      </aside>
      <main
        className={cn(
          "relative z-0 md:flex-grow flex flex-col md:block h-full",
          {
            "overflow-hidden": isOpen,
          },
        )}
      >
        <a href="/" aria-label="Go home" className="md:hidden self-center mt-8">
          <img src={TextLogo} alt="Skybox Lofts" className="" />
        </a>
        <div className="p-6 ps-8 pe-6 flex items-center border-b border-stone-200">
          <Button
            className="md:hidden me-3"
            onClick={toggleMenuOpen}
            variant="icon"
            aria-label="Open nav menu"
          >
            <Menu className="size-4" />
          </Button>
          <ResidentBreadcrumbs className="grow" />
          <Button onClick={handleSignOut} variant="icon" aria-label="Sign out">
            <LogOutIcon className="size-4" />
          </Button>
        </div>
        <div className="relative z-10 p-8">
          <h1 className="text-4xl mb-8 text-green-900">{pageTitle}</h1>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

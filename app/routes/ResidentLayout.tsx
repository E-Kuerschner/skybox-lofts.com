import { useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useRevalidator,
  NavLink,
  type NavLinkProps,
} from "react-router";
import { LogOutIcon, Menu } from "lucide-react";
import { WrigleyClock } from "~/components/WrigleyClock";
import { ResidentBreadcrumbs } from "~/components/ResidentBreadcrumbs";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { authClient } from "~/util/authClient";
import { cn } from "~/util/ui/utils";
import TextLogo from "../components/text-logo.svg";

type LayoutNavLinkProps = Omit<NavLinkProps, "children"> & {
  children: string;
};

const LayoutNavLink = ({ children, ...props }: LayoutNavLinkProps) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn("hover:text-emerald-600 py-6 w-full", {
          "text-emerald-600": isActive,
        })
      }
      {...props}
    >
      {({ isPending }) => (
        <span className="flex items-center gap-3">
          <span>{children}</span>
          {isPending && <LoadingSpinner className="inline size-4" />}
        </span>
      )}
    </NavLink>
  );
};

// shared elements between the mobile, collapsible sidebar the static desktop version
const SideBarContent = ({
  renderLogo = true,
  className,
}: {
  renderLogo?: boolean;
  className?: string;
}) => {
  const session = authClient.useSession();
  const isAdmin = session.data?.user.role === "admin";

  return (
    <div className={cn("px-8 pt-8 flex flex-col", className)}>
      {renderLogo && (
        <a href="/" aria-label="Go home">
          <img src={TextLogo} alt="Skybox Lofts" />
        </a>
      )}
      <WrigleyClock className="h-[100px] w-[100px] self-center my-4" />
      <hr className="border-1 border-slate-200" />
      <nav className="flex flex-col items-start *:hover:translate-x-2 *:transition-transform *:hover:scale-105 *:active:scale-[0.9] *:active:text-emerald-600">
        <LayoutNavLink end to="/resident">
          Resident Home
        </LayoutNavLink>
        <LayoutNavLink to="/resident/documents">Documents</LayoutNavLink>
        <LayoutNavLink to="/resident/board">Board Members</LayoutNavLink>
        {isAdmin && (
          <LayoutNavLink to="/resident/management">
            Resident Management
          </LayoutNavLink>
        )}
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
      {/* overlay fixed behind the collapsible, mobile sidebar */}
      {isOpen && (
        <div
          className="fixed z-10 top-0 left-0 h-dvh w-dvw opacity-15 bg-slate-600"
          onClick={toggleMenuOpen}
        />
      )}
      {/* mobile-only aside that slides in from the left side of the screen */}
      <aside
        className={cn(
          "flex flex-col justify-between absolute top-0 z-10 left-0 md:hidden h-full w-64 site-bg -translate-x-full transition-transform duration-500 ease-in-out",
          {
            "-translate-x-0": isOpen,
          },
        )}
      >
        <SideBarContent className="pt-2" renderLogo={false} />
        <Button
          className="mx-4 mb-4"
          variant="destructive"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
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
        {/* TODO move out of main */}
        <div className="p-6 ps-5 md:ps-8 pe-6 flex items-center border-b border-stone-200">
          <Button
            className="md:hidden me-3"
            onClick={toggleMenuOpen}
            variant="icon"
            aria-label="Open nav menu"
          >
            <Menu className="size-4" />
          </Button>
          <ResidentBreadcrumbs className="grow" />
          <Button
            className="hidden md:block"
            onClick={handleSignOut}
            variant="icon"
            aria-label="Sign out"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </div>
        <div className="relative z-10 p-5 md:p-8">
          <h1 className="text-2xl md:text-4xl mb-8 text-green-900">
            {pageTitle}
          </h1>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

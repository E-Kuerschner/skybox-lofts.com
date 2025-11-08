import { useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useRevalidator,
  NavLink,
  type NavLinkProps,
  createCookie,
} from "react-router";
import type { Route } from "./+types/ResidentLayout";
import { Menu } from "lucide-react";
import { WrigleyClock } from "~/components/WrigleyClock";
import { ResidentBreadcrumbs } from "~/components/ResidentBreadcrumbs";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { authClient } from "~/util/authClient";
import { isAuthenticated } from "~/util/authHelpers.server";
import { cn } from "~/util/ui/utils";
import TextLogo from "../components/text-logo.svg";

// Cookie used in ResidentLogin to track magic link email sent status
const emailTrackerCookie = createCookie("email-tracker", {
  maxAge: 60 * 5, // 5 minutes
});

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
  isAdmin,
  userName,
}: {
  renderLogo?: boolean;
  className?: string;
  isAdmin: boolean;
  userName?: string | null;
}) => {
  return (
    <div className={cn("px-4 md:px-8 flex flex-col", className)}>
      <div className="flex flex-col pt-4 h-auto md:h-[200px]">
        {renderLogo && (
          <a href="/" aria-label="Go home">
            <img src={TextLogo} alt="Skybox Lofts" />
          </a>
        )}
        <WrigleyClock className="h-[100px] w-[100px] self-center my-4" />
        {userName && (
          <p className="md:hidden text-sm text-muted-foreground mb-2">
            Hello, {userName}
          </p>
        )}
      </div>
      <hr className="border-1 border-slate-200" />
      <nav className="flex flex-col items-start *:hover:translate-x-2 *:transition-transform *:hover:scale-105 *:active:scale-[0.9] *:active:text-emerald-600">
        <LayoutNavLink end to="/resident">
          🏠 Resident Home
        </LayoutNavLink>
        <LayoutNavLink to="/resident/documents">📄 Documents</LayoutNavLink>
        <LayoutNavLink to="/resident/board">👥 Board Members</LayoutNavLink>
        {isAdmin && (
          <LayoutNavLink to="/resident/management">
            ⚙️ Resident Management
          </LayoutNavLink>
        )}
      </nav>
    </div>
  );
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await isAuthenticated(request, context);

  // Check if the email tracker cookie exists
  const cookieHeader = request.headers.get("Cookie");
  const emailTrackerExists = await emailTrackerCookie.parse(cookieHeader);

  // If user is authenticated and the cookie exists, clear it
  if (emailTrackerExists) {
    return new Response(
      JSON.stringify({
        userName: session.user.name,
        isAdmin: session.user.role === "admin",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await emailTrackerCookie.serialize("", { maxAge: 0 }),
        },
      },
    );
  }

  return {
    userName: session.user.name,
    isAdmin: session.user.role === "admin",
  };
}

export default function ResidentLayout({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const revalidator = useRevalidator();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const { userName, isAdmin } = loaderData;

  const pageTitle = useMemo(() => {
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment === "resident") return "Resident Home";
    if (lastSegment === "documents") return "Resident Documents";
    if (lastSegment === "board") return "Board Members";
    if (lastSegment === "meeting-notes") return "Meeting Notes";
    if (lastSegment === "management") return "Resident Management";
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

  const handleDesktopSignOut = async () => {
    const confirmSignout = confirm("Would you like to sign out?");
    if (confirmSignout) {
      await handleSignOut();
    }
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
      <aside className="hidden md:block w-64 shrink-0 border-e border-stone-200 bg-white">
        <SideBarContent isAdmin={isAdmin} userName={userName} />
      </aside>
      {/* overlay fixed behind the collapsible, mobile sidebar */}
      {isOpen && (
        <div
          className="fixed z-10 top-0 left-0 h-dvh w-dvw bg-black/15"
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
        <SideBarContent
          renderLogo={false}
          isAdmin={isAdmin}
          userName={userName}
        />
        <Button
          className="mx-4 mb-4"
          variant="secondary"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </aside>
      <div
        className={cn(
          "relative z-0 md:flex-grow flex flex-col h-full site-bg",
          {
            "overflow-hidden": isOpen,
          },
        )}
      >
        <header className="flex flex-col">
          <a
            href="/"
            aria-label="Go home"
            className="md:hidden self-center my-4"
          >
            <img src={TextLogo} alt="Skybox Lofts" className="" />
          </a>
          {/* TODO move out of main */}
          <div className="md:h-[200px] h-auto md:bg-[url(/banner.jpg)] bg-cover bg-center border-b">
            <div className="md:h-[200px] h-auto flex flex-col justify-end pb-4 px-5 md:px-8 frosted-glass">
              <div className="flex gap-1 items-center">
                <Button
                  className="md:hidden"
                  onClick={toggleMenuOpen}
                  variant="ghost"
                  size="icon"
                  aria-label="Open nav menu"
                >
                  <Menu className="size-4" />
                </Button>
                <h1 className="text-2xl md:text-4xl md:mb-4 text-green-900 md:text-white font-semibold md:text-shadow-lg/50">
                  {pageTitle}
                </h1>
              </div>
              <div className="flex items-center justify-between">
                <ResidentBreadcrumbs className="hidden md:flex grow" />
                {userName && (
                  <span className="hidden md:inline text-foreground md:text-white md:text-shadow-lg/50">
                    Hello,{" "}
                    <span
                      className="text-emerald-300 hover:text-emerald-500 hover:underline cursor-pointer"
                      aria-label="Sign out"
                      onClick={handleDesktopSignOut}
                    >
                      {userName}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="relative z-10 p-3 md:p-8 site-bg grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

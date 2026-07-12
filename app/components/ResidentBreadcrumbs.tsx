import { Fragment } from "react";
import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

type Props = {
  className?: string;
};

// Breadcrumbs only render on desktop, on top of the dark banner image, so
// links use the light brand green instead of the default muted foreground.
const bannerLinkClasses =
  "text-base text-primary-light hover:text-primary-light/80 md:text-shadow-lg/50";

export const ResidentBreadcrumbs = ({ className }: Props) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            asChild
            // light brand green + text shadows because the breadcrumbs render on top of the dark banner image
            className={bannerLinkClasses}
          >
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <Fragment key={`crumb-${segment}`}>
              <BreadcrumbSeparator className="md:text-white" />
              <BreadcrumbItem key={segment}>
                {isLast ? (
                  <BreadcrumbPage className="text-base md:text-white md:text-shadow-lg/50">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className={bannerLinkClasses} asChild>
                    <Link to={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

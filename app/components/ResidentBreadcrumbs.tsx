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

export const ResidentBreadcrumbs = ({ className }: Props) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            asChild
            // shadows applied in desktop size due to the unique background that the breadcrumbs are rendered on top of
            className="md:text-shadow-lg/50"
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
                  <BreadcrumbPage className="md:text-white md:text-shadow-lg/50">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="md:text-shadow-lg/50" asChild>
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

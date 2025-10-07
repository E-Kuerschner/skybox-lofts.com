import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export const ResidentBreadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            asChild
            className="text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem key={segment}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                    asChild
                  >
                    <Link to={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

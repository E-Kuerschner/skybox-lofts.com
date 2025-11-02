import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/Home.tsx"),
  route("contact", "routes/contactForm.ts"),
  route("api/auth/*", "routes/auth.ts"),
  route("documentUpload", "routes/documentUpload.ts"),
  route("documentDelete", "routes/documentDelete.ts"),
  ...prefix("resident", [
    route("login", "routes/ResidentLogin.tsx"),
    layout("routes/ResidentLayout.tsx", [
      index("routes/ResidentHome.tsx"),
      route("board", "routes/BoardMembers/index.tsx"),
      ...prefix("documents", [
        index("routes/Documents.tsx"),
        route("download", "routes/documentDownload.ts"),
      ]),
      route("management", "routes/ResidentManagement/index.tsx"),
    ]),
  ]),
] satisfies RouteConfig;

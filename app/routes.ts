import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/auth/*", "routes/auth.ts"),
  ...prefix("resident", [
    route("login", "routes/resident/login.tsx"),
    layout("routes/resident/layout.tsx", [
      index("routes/resident/index.tsx"),
      route("board", "routes/resident/board.tsx"),
      ...prefix("documents", [
        index("routes/resident/documents.tsx"),
        route("download", "routes/resident/docs-download.ts"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;

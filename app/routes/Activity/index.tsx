import type { Route } from "./+types/index";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { desc, eq, and, sql } from "drizzle-orm";
import { getDatabase } from "~/util/database.server";
import { isAdmin } from "~/util/authHelpers.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { NoContent } from "~/components/NoContent";
import { activityLogs, users } from "../../../database/schema";

const ITEMS_PER_PAGE = 50;

export async function loader({ request, context }: Route.LoaderArgs) {
  await isAdmin(request, context);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const entityTypeFilter = url.searchParams.get("entityType") || "all";
  const actionFilter = url.searchParams.get("action") || "all";
  const userFilter = url.searchParams.get("user") || "all";

  const db = getDatabase(context);

  // Build where conditions
  const conditions = [];
  if (entityTypeFilter !== "all") {
    conditions.push(eq(activityLogs.entityType, entityTypeFilter));
  }
  if (actionFilter !== "all") {
    conditions.push(eq(activityLogs.action, actionFilter));
  }
  if (userFilter !== "all") {
    conditions.push(eq(activityLogs.userId, userFilter));
  }

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .get();

  const totalItems = countResult?.count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Fetch activity logs with user information
  const activities = await db
    .select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(activityLogs.createdAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset)
    .all();

  // Fetch unique users who have activity
  const uniqueUsers = await db
    .selectDistinct({
      userId: activityLogs.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(users.name)
    .all();

  return {
    activities,
    currentPage: page,
    totalPages,
    totalItems,
    entityTypeFilter,
    actionFilter,
    userFilter,
    uniqueUsers,
  };
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
}

function formatFullTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString();
}

function formatEntityType(entityType: string): string {
  switch (entityType) {
    case "resident":
      return "Resident";
    case "document":
      return "Document";
    case "board_member":
      return "Board Member";
    default:
      return entityType;
  }
}

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatDetails(
  entityType: string,
  action: string,
  metadata: string | null,
): string {
  if (!metadata) return "-";

  try {
    const data = JSON.parse(metadata);

    switch (entityType) {
      case "resident":
        const residentName = data.residentName || data.residentEmail || "Unknown";
        const unitInfo = data.unitNumber !== undefined ? ` (Unit ${data.unitNumber})` : "";
        return `${residentName}${unitInfo}`;
      case "document":
        return `${data.filename || "Unknown"} (${data.category || "Unknown"})`;
      case "board_member":
        return `${data.memberName || "Unknown"} - ${data.memberRole || "Unknown"}`;
      default:
        return "-";
    }
  } catch {
    return "-";
  }
}

export default function Activity({ loaderData }: Route.ComponentProps) {
  const [entityTypeFilter, setEntityTypeFilter] = useState(
    loaderData.entityTypeFilter,
  );
  const [actionFilter, setActionFilter] = useState(loaderData.actionFilter);
  const [userFilter, setUserFilter] = useState(loaderData.userFilter);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (entityTypeFilter !== "all") {
      params.set("entityType", entityTypeFilter);
    }
    if (actionFilter !== "all") {
      params.set("action", actionFilter);
    }
    if (userFilter !== "all") {
      params.set("user", userFilter);
    }
    params.set("page", "1");
    window.location.href = `/resident/activity?${params.toString()}`;
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (entityTypeFilter !== "all") {
      params.set("entityType", entityTypeFilter);
    }
    if (actionFilter !== "all") {
      params.set("action", actionFilter);
    }
    if (userFilter !== "all") {
      params.set("user", userFilter);
    }
    params.set("page", String(newPage));
    window.location.href = `/resident/activity?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl px-4 pt-4 border-1 pb-8 shadow-md">
        <p className="mb-8 text-muted-foreground">
          View all activity performed by admins on the platform. This includes
          creating, updating, and deleting residents, documents, and board
          members.
        </p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {loaderData.uniqueUsers.map((user) => (
                <SelectItem key={user.userId} value={user.userId}>
                  {user.userName || user.userEmail || "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="resident">Resident</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="board_member">Board Member</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleFilterChange} variant="secondary">
            Apply Filters
          </Button>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="*:font-bold">
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loaderData.activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <NoContent message="No activity found" />
                  </TableCell>
                </TableRow>
              ) : (
                loaderData.activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {activity.userName || "Unknown"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {activity.userEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          activity.action === "deleted"
                            ? "text-destructive"
                            : activity.action === "created"
                              ? "text-emerald-600"
                              : ""
                        }
                      >
                        {formatAction(activity.action)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatEntityType(activity.entityType)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {formatDetails(
                        activity.entityType,
                        activity.action,
                        activity.metadata,
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className="cursor-help"
                        title={formatFullTimestamp(activity.createdAt)}
                      >
                        {formatTimestamp(activity.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {loaderData.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {loaderData.currentPage} of {loaderData.totalPages} (
              {loaderData.totalItems} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loaderData.currentPage === 1}
                onClick={() => handlePageChange(loaderData.currentPage - 1)}
              >
                <ChevronLeftIcon className="size-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loaderData.currentPage === loaderData.totalPages}
                onClick={() => handlePageChange(loaderData.currentPage + 1)}
              >
                Next
                <ChevronRightIcon className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



import { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Power,
  X,
  Filter,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useGetUserListQuery } from "../../services/RTK/adminApi";

const API = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const getUserName = (user) =>
  user?.Name ||
  user?.name ||
  user?.FullName ||
  user?.fullName ||
  "Unknown User";

const getUserEmail = (user) =>
  user?.Email ||
  user?.email ||
  "No email available";

const getUserRole = (user) =>
  user?.Role ||
  user?.role ||
  "user";

const getUserDate = (user) => {
  const date =
    user?.createdAt ||
    user?.CreatedAt ||
    user?.created_at;

  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Status true = Active, false = Inactive
const isActive = (user) => user?.Status === true;

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const formatRole = (role) => {
  const normalizedRole = String(role).toLowerCase();

  if (normalizedRole === "admin") return "Admin";

  if (
    normalizedRole === "supportagent" ||
    normalizedRole === "support_agent"
  ) {
    return "Support Agent";
  }

  return normalizedRole.charAt(0).toUpperCase() +
    normalizedRole.slice(1);
};

export default function ManageUsers() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetUserListQuery();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [requestError, setRequestError] = useState("");

  // Handle different possible API response structures.
  const users = useMemo(() => {
    const candidates = [
      data?.users,
      data?.Users,
      data?.data?.users,
      data?.data?.Users,
      data?.data,
      data?.message?.users,
      data?.message?.Users,
      data?.message,
    ];

    return candidates.find(Array.isArray) || [];
  }, [data]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = getUserEmail(user).toLowerCase();
      const role = String(getUserRole(user)).toLowerCase();
      const active = isActive(user);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query);

      const matchesRole =
        roleFilter === "all" ||
        role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeCount = users.filter(isActive).length;
  const inactiveCount = users.length - activeCount;

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });

    // Clear the notice when another action occurs or the component updates.
    // No timer is needed for the functionality.
  };

  const toggleStatus = async (user) => {
    if (!user?._id || updatingId) return;

    const currentlyActive = isActive(user);
    const action = currentlyActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${getUserName(user)}?`
    );

    if (!confirmed) return;

    setUpdatingId(user._id);
    setRequestError("");
    setNotice(null);

    try {
      const response = await fetch(
        `${API}/users/${user._id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to update user status."
        );
      }

      // Backend should toggle Status using:
      // user.Status = !user.Status;
      // await user.save();

      showNotice(
        `${getUserName(user)} has been ${
          currentlyActive ? "deactivated" : "activated"
        } successfully.`
      );

      // Refresh the latest Status values from MongoDB.
      await refetch();

      // Refresh the selected user's details if its modal is open.
      setSelectedUser((current) =>
        current?._id === user._id
          ? { ...current, Status: !currentlyActive }
          : current
      );
    } catch (err) {
      const message =
        err.message || "Failed to update user status.";

      setRequestError(message);
      showNotice(message, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-9 w-9 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />

          <h2 className="text-lg font-bold text-slate-900">
            Unable to load users
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error?.data?.message ||
              error?.error ||
              "Something went wrong while fetching users."}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Users size={17} />
              User Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Manage Users
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View user accounts and manage their access status.
            </p>
          </div>

          <button
            onClick={() => {
              setNotice(null);
              setRequestError("");
              refetch();
            }}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Notification */}
        {notice && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {notice.type === "error" ? (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium">
              {notice.message}
            </p>

            <button
              onClick={() => setNotice(null)}
              className="rounded-md p-1 transition hover:bg-black/5"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {requestError && (
          <p className="text-sm text-red-600">{requestError}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
            description="All registered accounts"
          />

          <StatCard
            title="Active Users"
            value={activeCount}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
            description="Status is true"
          />

          <StatCard
            title="Inactive Users"
            value={inactiveCount}
            icon={XCircle}
            iconClass="bg-red-50 text-red-600"
            description="Status is false or missing"
          />
        </div>

        {/* Search and filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={17} className="text-emerald-600" />

            <h2 className="font-semibold text-slate-900">
              Search and Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, or role..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="supportagent">Support Agent</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">
                All Users
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>

            {isFetching && (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                <LoaderCircle size={14} className="animate-spin" />
                Updating list...
              </span>
            )}
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users size={25} className="text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-800">
                No users found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const active = isActive(user);
                    const busy = updatingId === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                              {getInitials(getUserName(user)) || (
                                <UserRound size={19} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                                {getUserName(user)}
                              </p>

                              <p className="mt-1 flex max-w-[230px] items-center gap-1.5 truncate text-xs text-slate-500">
                                <Mail size={13} className="shrink-0" />
                                {getUserEmail(user)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            <ShieldCheck size={13} />
                            {formatRole(getUserRole(user))}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {getUserDate(user)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge active={active} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setNotice(null);
                              }}
                              title="View user details"
                              aria-label={`View ${getUserName(user)}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => toggleStatus(user)}
                              disabled={Boolean(updatingId)}
                              title={active ? "Deactivate user" : "Activate user"}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                active
                                  ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {busy ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Power size={14} />
                              )}

                              {busy
                                ? "Updating"
                                : active
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User details modal */}
        {selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-details-title"
              className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2
                    id="user-details-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    User Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Account information and current status
                  </p>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close user details"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={19} />
                </button>
              </div>

              {/* User profile */}
              <div className="px-6 py-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-bold text-emerald-700">
                    {getInitials(getUserName(selectedUser)) || (
                      <UserRound size={30} />
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {getUserName(selectedUser)}
                  </h3>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {getUserEmail(selectedUser)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {formatRole(getUserRole(selectedUser))}
                    </span>

                    <StatusBadge active={isActive(selectedUser)} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <DetailRow
                    label="User ID"
                    value={selectedUser._id || "Not available"}
                  />

                  <DetailRow
                    label="Email"
                    value={getUserEmail(selectedUser)}
                  />

                  <DetailRow
                    label="Role"
                    value={formatRole(getUserRole(selectedUser))}
                  />

                  <DetailRow
                    label="Account Status"
                    value={isActive(selectedUser) ? "Active" : "Inactive"}
                  />

                  <DetailRow
                    label="Joined Date"
                    value={getUserDate(selectedUser)}
                  />
                </div>

                {/* Modal actions */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => toggleStatus(selectedUser)}
                    disabled={Boolean(updatingId)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive(selectedUser)
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {updatingId === selectedUser._id ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Power size={16} />
                    )}

                    {updatingId === selectedUser._id
                      ? "Updating..."
                      : isActive(selectedUser)
                        ? "Deactivate User"
                        : "Activate User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <span className="shrink-0 text-sm text-slate-500">
        {label}
      </span>

      <span className="break-all text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

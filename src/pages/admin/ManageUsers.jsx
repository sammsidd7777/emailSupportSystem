import { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  UserRound,
  MapPin,
  Clock3,
  Hash,
  X,
} from "lucide-react";

import { useGetUserListQuery } from "../../services/RTK/adminApi";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export default function ManageUsers() {
  const {
    data: userData,
    isLoading,
    isFetching,
    isError,
    error: queryError,
    refetch,
  } = useGetUserListQuery();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Extract users from common API response structures.
  const users = useMemo(() => {
    const list = Array.isArray(userData?.users)
      ? userData.users
      : Array.isArray(userData?.data?.users)
        ? userData.data.users
        : Array.isArray(userData?.data)
          ? userData.data
          : Array.isArray(userData)
            ? userData
            : [];

    return list.filter((user) => {
      const role = String(user.role || user.Role || "").toLowerCase();
      return role === "customer" || role === "user";
    });
  }, [userData]);

  const getName = (user) =>
    user.name || user.Name || user.fullName || user.FullName || "Unnamed customer";

  const getEmail = (user) => user.email || user.Email || "";

  const getPhone = (user) =>
    user.phone || user.Phone || user.phoneNumber || user.PhoneNumber || "";

  const getCreatedAt = (user) =>
    user.createdAt || user.CreatedAt || user.created_at;

  /* display-only getters for the details panel (shown only if the API sends them) */
  const getUpdatedAt = (user) =>
    user.updatedAt || user.UpdatedAt || user.updated_at;

  const getLastLogin = (user) =>
    user.lastLogin || user.LastLogin || user.lastLoginAt || user.LastLoginAt;

  const getLocation = (user) => {
    const address = user.address || user.Address;

    const parts = [
      typeof address === "string" ? address : "",
      user.city || user.City,
      user.state || user.State,
      user.country || user.Country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getInitials = (user) => {
    const name = getName(user);

    return name !== "Unnamed customer"
      ? name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      : "";
  };

  const isActive = (user) =>
    user.isActive !== undefined
      ? user.isActive !== false
      : user.IsActive !== false;

  // Search and status filters.
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        getName(user).toLowerCase().includes(query) ||
        getEmail(user).toLowerCase().includes(query) ||
        String(getPhone(user)).toLowerCase().includes(query);

      const active = isActive(user);

      const matchesStatus =
        status === "all" ||
        (status === "active" && active) ||
        (status === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, status]);

  const activeCount = users.filter(isActive).length;
  const inactiveCount = users.length - activeCount;

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    try {
      await refetch().unwrap();
    } catch {
      setError("Unable to refresh customers. Please try again.");
    }
  };

  // Activate or deactivate a customer.
  const toggleStatus = async (user) => {
    const currentlyActive = isActive(user);
    const name = getName(user);

    const confirmed = window.confirm(
      `Are you sure you want to ${
        currentlyActive ? "deactivate" : "activate"
      } ${name}?`
    );

    if (!confirmed) return;

    try {
      setBusyId(user._id);
      setError("");
      setSuccess("");

      const res = await fetch(`${API}/users/${user._id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentlyActive,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        throw new Error(result.message || "Unable to update customer.");
      }

      setSuccess(
        `${name} has been ${
          currentlyActive ? "deactivated" : "activated"
        } successfully.`
      );

      setSelectedUser(null);

      // Refresh the source of truth from the backend.
      await refetch();
    } catch (err) {
      setError(err.message || "Unable to update customer.");
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="min-h-full">
      <div className="space-y-5">

        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0f3d28] sm:text-5xl">
              Manage Customers
            </h1>

            <p className="mt-2 text-sm text-neutral-500 sm:text-base">
              View customer accounts and manage account access.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            featured
            title="Total Customers"
            value={users.length}
            description="Registered customer accounts"
            icon={<Users size={20} />}
          />

          <StatCard
            title="Active Customers"
            value={activeCount}
            description="Accounts currently enabled"
            icon={<UserCheck size={20} />}
            iconClass="bg-[#1f7a4d]/10 text-[#1f7a4d]"
          />

          <StatCard
            title="Inactive Customers"
            value={inactiveCount}
            description="Accounts currently disabled"
            icon={<UserX size={20} />}
            iconClass="bg-rose-50 text-rose-600"
          />
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-3xl border border-[#1f7a4d]/30 bg-[#1f7a4d]/10 p-4 text-sm font-medium text-[#0f3d28]">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-[#1f7a4d]"
            />
            <div className="flex-1">{success}</div>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {(isError || queryError) && !error && (
          <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            {queryError?.data?.message ||
              queryError?.error ||
              "Unable to load customer accounts."}
          </div>
        )}

        {/* Main content */}
        <div className="overflow-hidden rounded-3xl bg-white">

          {/* Search toolbar */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0f3d28]">
                Customer Directory
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Search, review, and update customer accounts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-72">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-full border border-neutral-200 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-full border border-neutral-200 bg-[#f7f7f5] px-5 py-3 text-sm font-medium text-neutral-700 outline-none transition hover:border-[#1f7a4d]/50 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/15"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 text-xs text-neutral-500 sm:px-6">
            <span>
              Showing{" "}
              <strong className="text-[#0f3d28]">
                {filteredUsers.length}
              </strong>{" "}
              of{" "}
              <strong className="text-[#0f3d28]">
                {users.length}
              </strong>{" "}
              customers
            </span>

            {isFetching && (
              <span className="inline-flex items-center gap-2 text-[#1f7a4d]">
                <RefreshCw size={13} className="animate-spin" />
                Updating...
              </span>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-4 p-6 pt-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-2xl bg-neutral-100"
                />
              ))}
            </div>
          ) : isError && users.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <AlertCircle
                size={36}
                className="mx-auto mb-3 text-red-400"
              />
              <h3 className="font-semibold text-neutral-800">
                Couldn't load customers
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-4 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Try again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <Users size={27} />
              </div>
              <h3 className="font-semibold text-neutral-900">
                No customers found
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try changing your search or status filter.
              </p>

              {(search || status !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                  }}
                  className="mt-4 text-sm font-semibold text-[#1f7a4d] hover:text-[#0f3d28]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#f7f7f5] text-xs text-neutral-500">
                  <tr>
                    <th className="rounded-l-2xl px-5 py-3.5 font-medium">
                      Customer
                    </th>
                    <th className="px-5 py-3.5 font-medium">Phone</th>
                    <th className="px-5 py-3.5 font-medium">Joined</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="rounded-r-2xl px-5 py-3.5 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.map((user) => {
                    const active = isActive(user);
                    const name = getName(user);
                    const email = getEmail(user);
                    const phone = getPhone(user);

                    return (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-[#f7f7f5]"
                      >
                        {/* Customer information */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#63c192] to-[#1f7a4d] text-sm font-bold text-white">
                              {getInitials(user) || <UserRound size={20} />}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-[#0f3d28]">
                                {name}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                                <Mail size={13} className="shrink-0" />
                                <span className="max-w-[230px] truncate">
                                  {email || "No email provided"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
                            <Phone size={14} className="text-neutral-400" />
                            {phone || "—"}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
                            <CalendarDays
                              size={14}
                              className="text-neutral-400"
                            />
                            {formatDate(getCreatedAt(user))}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                              active
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-rose-50 text-rose-700 ring-rose-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                active ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="rounded-full border border-[#1f7a4d]/50 px-4 py-2 text-xs font-semibold text-[#0f3d28] transition hover:bg-[#0f3d28] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
                            >
                              Details
                            </button>

                            <button
                              type="button"
                              disabled={busyId === user._id}
                              onClick={() => toggleStatus(user)}
                              className={`min-w-[100px] rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                                active
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {busyId === user._id
                                ? "Updating..."
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

          {/* Footer */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="bg-[#f7f7f5] px-5 py-3 text-xs text-neutral-500 sm:px-6">
              Customer management
              <span className="mx-2 text-neutral-300">•</span>
              {activeCount} active
              <span className="mx-2 text-neutral-300">•</span>
              {inactiveCount} inactive
            </div>
          )}
        </div>
      </div>

      {/* Customer details modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06190f]/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-details-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-[#f7f7f5] shadow-2xl"
          >
            {/* Profile banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] p-6 text-white">
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full border border-white/10" />

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close customer details"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X size={18} />
              </button>

              <p className="text-xs font-medium text-white/60">
                Customer details
              </p>

              <div className="relative mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#63c192] text-xl font-bold text-[#06190f]">
                  {getInitials(selectedUser) || <UserRound size={26} />}
                </div>

                <div className="min-w-0">
                  <h2
                    id="customer-details-title"
                    className="truncate text-xl font-semibold"
                  >
                    {getName(selectedUser)}
                  </h2>
                  <p className="mt-0.5 break-all text-sm text-white/70">
                    {getEmail(selectedUser) || "No email provided"}
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive(selectedUser)
                        ? "bg-[#63c192]/20 text-[#9ee6bd]"
                        : "bg-rose-400/20 text-rose-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive(selectedUser)
                          ? "bg-[#63c192]"
                          : "bg-rose-300"
                      }`}
                    />
                    {isActive(selectedUser)
                      ? "Active account"
                      : "Inactive account"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  icon={<Mail size={17} />}
                  label="Email"
                  value={getEmail(selectedUser) || "Not provided"}
                />

                <DetailRow
                  icon={<Phone size={17} />}
                  label="Phone"
                  value={getPhone(selectedUser) || "Not provided"}
                />

                <DetailRow
                  icon={<CalendarDays size={17} />}
                  label="Joined"
                  value={formatDate(getCreatedAt(selectedUser))}
                />

                <DetailRow
                  icon={<ShieldCheck size={17} />}
                  label="Role"
                  value={
                    selectedUser.role || selectedUser.Role || "Customer"
                  }
                />

                {getUpdatedAt(selectedUser) && (
                  <DetailRow
                    icon={<Clock3 size={17} />}
                    label="Last updated"
                    value={formatDateTime(getUpdatedAt(selectedUser))}
                  />
                )}

                {getLastLogin(selectedUser) && (
                  <DetailRow
                    icon={<Clock3 size={17} />}
                    label="Last login"
                    value={formatDateTime(getLastLogin(selectedUser))}
                  />
                )}

                {getLocation(selectedUser) && (
                  <DetailRow
                    icon={<MapPin size={17} />}
                    label="Location"
                    value={getLocation(selectedUser)}
                    wide
                  />
                )}

                <DetailRow
                  icon={<Hash size={17} />}
                  label="User ID"
                  value={selectedUser._id || "—"}
                  wide
                />
              </div>

              <button
                type="button"
                disabled={busyId === selectedUser._id}
                onClick={() => toggleStatus(selectedUser)}
                className={`mt-2 w-full rounded-full px-4 py-3.5 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 disabled:opacity-50 ${
                  isActive(selectedUser)
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-gradient-to-r from-[#1b7048] to-[#0d3b27] hover:brightness-110"
                }`}
              >
                {busyId === selectedUser._id
                  ? "Updating..."
                  : isActive(selectedUser)
                    ? "Deactivate Customer"
                    : "Activate Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass = "",
  featured = false,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 ${
        featured
          ? "bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] text-white"
          : "bg-white text-[#0f3d28]"
      }`}
    >
      {featured && (
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-white/10" />
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-medium">{title}</p>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            featured ? "bg-white text-[#0f3d28]" : iconClass
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-5xl font-semibold tracking-tight">
        {value}
      </p>
      <p
        className={`mt-3 text-xs ${
          featured ? "text-[#9ee6bd]" : "text-[#1f7a4d]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function DetailRow({ icon, label, value, wide = false }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl bg-white p-4 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f7a4d]/10 text-[#1f7a4d]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[#0f3d28]">
          {value}
        </p>
      </div>
    </div>
  );
}
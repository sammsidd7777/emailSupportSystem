
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <ShieldCheck size={17} />
              <span>Administration</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Manage Customers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View customer accounts and manage account access.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
            title="Total Customers"
            value={users.length}
            description="Registered customer accounts"
            icon={<Users size={22} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Customers"
            value={activeCount}
            description="Accounts currently enabled"
            icon={<UserCheck size={22} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Inactive Customers"
            value={inactiveCount}
            description="Accounts currently disabled"
            icon={<UserX size={22} />}
            iconClass="bg-rose-50 text-rose-600"
          />
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
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
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
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
          <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} />
            {queryError?.data?.message ||
              queryError?.error ||
              "Unable to load customer accounts."}
          </div>
        )}

        {/* Main content */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Search toolbar */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Customer Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, review, and update customer accounts.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:px-5">
            <span>
              Showing{" "}
              <strong className="text-slate-700">
                {filteredUsers.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-700">
                {users.length}
              </strong>{" "}
              customers
            </span>

            {isFetching && (
              <span className="inline-flex items-center gap-2 text-blue-600">
                <RefreshCw size={13} className="animate-spin" />
                Updating...
              </span>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : isError && users.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <AlertCircle
                size={36}
                className="mx-auto mb-3 text-red-400"
              />
              <h3 className="font-semibold text-slate-800">
                Couldn't load customers
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={27} />
              </div>
              <h3 className="font-semibold text-slate-900">
                No customers found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>

              {(search || status !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                  }}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const active = isActive(user);
                    const name = getName(user);
                    const email = getEmail(user);
                    const phone = getPhone(user);

                    return (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        {/* Customer information */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                              {name !== "Unnamed customer"
                                ? name
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join("")
                                    .toUpperCase()
                                : <UserRound size={20} />}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {name}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
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
                          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            {phone || "—"}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />
                            {formatDate(getCreatedAt(user))}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              active
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                                : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
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
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Details
                            </button>

                            <button
                              type="button"
                              disabled={busyId === user._id}
                              onClick={() => toggleStatus(user)}
                              className={`min-w-[100px] rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
              Customer management
              <span className="mx-2 text-slate-300">•</span>
              {activeCount} active
              <span className="mx-2 text-slate-300">•</span>
              {inactiveCount} inactive
            </div>
          )}
        </div>
      </div>

      {/* Customer details modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
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
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2
                  id="customer-details-title"
                  className="font-bold text-slate-900"
                >
                  Customer Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close customer details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700">
                  {getName(selectedUser)
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900">
                    {getName(selectedUser)}
                  </h3>
                  <p className="break-all text-sm text-slate-500">
                    {getEmail(selectedUser) || "No email provided"}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isActive(selectedUser)
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isActive(selectedUser) ? "Active account" : "Inactive account"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
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
                  value={selectedUser.role || selectedUser.Role || "Customer"}
                />

                <DetailRow
                  icon={<UserRound size={17} />}
                  label="User ID"
                  value={selectedUser._id || "—"}
                />
              </div>

              <button
                type="button"
                disabled={busyId === selectedUser._id}
                onClick={() => toggleStatus(selectedUser)}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  isActive(selectedUser)
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
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

function StatCard({ title, value, description, icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

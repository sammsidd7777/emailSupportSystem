
import { useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Headset,
  UserCheck,
  UserX,
  UserPlus,
  ArrowLeftRight,
  X,
  Mail,
  Phone,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  useGetAgentListQuery,
  useGetUserListQuery,
  useMakeAgentMutation,
  useRemoveAgentMutation,
} from "../../services/RTK/adminApi";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

export default function ManageAgents() {
  const {
    data: agentData,
    isLoading: loadingAgents,
    isFetching: fetchingAgents,
    isError: agentsError,
    error: agentQueryError,
    refetch: refetchAgents,
  } = useGetAgentListQuery();

  const {
    data: userData,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useGetUserListQuery();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Extract agents from API response
  const agents = useMemo(() => {
    const list = Array.isArray(agentData?.agents)
      ? agentData.agents
      : Array.isArray(agentData?.data?.agents)
        ? agentData.data.agents
        : Array.isArray(agentData?.data)
          ? agentData.data
          : Array.isArray(agentData)
            ? agentData
            : [];

    return list;
  }, [agentData]);

  // Extract all users and exclude existing agents/admins
  const availableUsers = useMemo(() => {
    const list = Array.isArray(userData?.users)
      ? userData.users
      : Array.isArray(userData?.data?.users)
        ? userData.data.users
        : Array.isArray(userData?.data)
          ? userData.data
          : Array.isArray(userData)
            ? userData
            : [];

    const agentIds = new Set(agents.map((agent) => String(agent._id)));

    return list.filter((user) => {
      const role = String(user.role || user.Role || "").toLowerCase();

      return (
        ["customer", "user"].includes(role) &&
        !agentIds.has(String(user._id))
      );
    });
  }, [userData, agents]);

  const getName = (person) =>
    person.name ||
    person.Name ||
    person.fullName ||
    person.FullName ||
    "Unnamed";

  const getEmail = (person) => person.email || person.Email || "";

  const getPhone = (person) =>
    person.phone ||
    person.Phone ||
    person.phoneNumber ||
    person.PhoneNumber ||
    "—";

  const getDate = (person) =>
    person.createdAt || person.CreatedAt || null;

  const isActive = (person) =>
    person.isActive !== undefined
      ? person.isActive !== false
      : person.IsActive !== false;

  const activeCount = agents.filter(isActive).length;
  const inactiveCount = agents.length - activeCount;

  const filteredAgents = agents.filter((agent) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      getName(agent).toLowerCase().includes(query) ||
      getEmail(agent).toLowerCase().includes(query) ||
      String(getPhone(agent)).toLowerCase().includes(query);

    const active = isActive(agent);

    const matchesStatus =
      status === "all" ||
      (status === "active" && active) ||
      (status === "inactive" && !active);

    return matchesSearch && matchesStatus;
  });

  const filteredAvailableUsers = availableUsers.filter((user) => {
    const query = userSearch.trim().toLowerCase();

    return (
      getName(user).toLowerCase().includes(query) ||
      getEmail(user).toLowerCase().includes(query)
    );
  });

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

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        refetchAgents(),
        refetchUsers(),
      ]);
    } catch {
      setError("Unable to refresh the lists.");
    }
  };

  // Change the role of an existing account.
  // Expected backend endpoint: PATCH /users/:id/role

  const [makeAgent] = useMakeAgentMutation();

  const changeRole = async (person, newRole) => {
    const name = getName(person);

    const action =
      newRole === "supportAgent"
        ? "make a support agent"
        : "return to a customer account";

    if (
      !window.confirm(
        `Are you sure you want to ${action}: ${name}?`
      )
    ) {
      return false;
    }

    try {
      setBusyId(person._id);
      setError("");
      setSuccess("");

     const res = await makeAgent(person._id).unwrap();

      const result = await res.json();

      if (!res.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to change account role."
        );
      }

      await Promise.all([
        refetchAgents(),
        refetchUsers(),
      ]);

      setSuccess(
        newRole === "supportAgent"
          ? `${name} is now a support agent.`
          : `${name} has been moved back to customers.`
      );

      return true;
    } catch (err) {
      setError(err.message || "Unable to change account role.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      setError("Please select a customer first.");
      return;
    }

    const selectedUser = availableUsers.find(
      (user) => String(user._id) === String(selectedUserId)
    );

    if (!selectedUser) {
      setError("Selected customer was not found. Refresh the list.");
      return;
    }

    const changed = await changeRole(selectedUser, "supportAgent");

    if (changed) {
      setModalOpen(false);
      setSelectedUserId("");
      setUserSearch("");
    }
  };

  const [removeAgent] = useRemoveAgentMutation();

  const handleRemoveAgent = async (agent) => {
   
    try{
      const res = await removeAgent(agent._id).unwrap();

      if(!res){
        throw new Error("Unable to remove agent role.");
      }
      alert(`${getName(agent)} has been removed from support agents.`);
    } catch (err) {
      setError(err.message || "Unable to remove agent role.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Headset size={17} />
              Administration
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Manage Agents
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your support team and account roles.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={fetchingAgents}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={fetchingAgents ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <UserPlus size={17} />
              Add Agent
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
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
            <span className="flex-1">{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {agentsError && !error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {agentQueryError?.data?.message ||
              agentQueryError?.error ||
              "Failed to load agents."}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Agents"
            value={agents.length}
            description="Registered support agents"
            icon={<Headset size={22} />}
            color="blue"
          />

          <StatCard
            title="Active Agents"
            value={activeCount}
            description="Accounts currently enabled"
            icon={<UserCheck size={22} />}
            color="green"
          />

          <StatCard
            title="Inactive Agents"
            value={inactiveCount}
            description="Accounts currently disabled"
            icon={<UserX size={22} />}
            color="red"
          />
        </div>

        {/* Agent directory */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Support Team
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Activate, deactivate, or change an agent's role.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search agent name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
            <span>
              Showing{" "}
              <strong className="text-slate-700">
                {filteredAgents.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-700">
                {agents.length}
              </strong>{" "}
              agents
            </span>

            {fetchingAgents && (
              <span className="text-blue-600">Updating list...</span>
            )}
          </div>

          {loadingAgents ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : agentsError && agents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Unable to load agents.
              <button
                type="button"
                onClick={handleRefresh}
                className="ml-2 font-semibold text-blue-600"
              >
                Try again
              </button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="p-12 text-center">
              <Headset
                size={36}
                className="mx-auto mb-3 text-slate-300"
              />
              <h3 className="font-semibold text-slate-800">
                No agents found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Change your filters or add a customer as an agent.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Agent</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map((agent) => {
                    const active = isActive(agent);
                    const name = getName(agent);
                    const busy = busyId === agent._id;

                    return (
                      <tr
                        key={agent._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                              {name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {name}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                <Mail size={13} />
                                {getEmail(agent) || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            {getPhone(agent)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />
                            {formatDate(getDate(agent))}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
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
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                toggleAgentStatus(agent, {
                                  API,
                                  setBusyId,
                                  setError,
                                  setSuccess,
                                  refetchAgents,
                                  refetchUsers,
                                })
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                                active
                                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {busy
                                ? "Updating..."
                                : active
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleRemoveAgent(agent)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                            >
                              <ArrowLeftRight size={14} />
                              Make Customer
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
      </div>

      {/* Add agent modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && busyId === null) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-agent-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2
                  id="add-agent-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Add Support Agent
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Promote an existing customer account.
                </p>
              </div>

              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="user-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Find a customer
                </label>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="user-search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {loadingUsers ? (
                  <p className="p-4 text-center text-sm text-slate-500">
                    Loading customers...
                  </p>
                ) : filteredAvailableUsers.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                    No eligible customers found.
                  </div>
                ) : (
                  filteredAvailableUsers.map((user) => {
                    const selected =
                      String(selectedUserId) === String(user._id);

                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => setSelectedUserId(user._id)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-700">
                          {getName(user)
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {getName(user)}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {getEmail(user) || "No email"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            selected
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {selected ? "Selected" : "Customer"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedUserId || busyId !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  {busyId ? "Updating..." : "Make Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

async function toggleAgentStatus(
  agent,
  { API, setBusyId, setError, setSuccess, refetchAgents, refetchUsers }
) {
  const active =
    agent.isActive !== undefined
      ? agent.isActive !== false
      : agent.IsActive !== false;

  const name =
    agent.name || agent.Name || agent.fullName || "this agent";

  if (
    !window.confirm(
      `${active ? "Deactivate" : "Activate"} ${name}?`
    )
  ) {
    return;
  }

  try {
    setBusyId(agent._id);
    setError("");
    setSuccess("");

    const res = await fetch(`${API}/users/${agent._id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });

    const result = await res.json();

    if (!res.ok || result.success === false) {
      throw new Error(result.message || "Unable to update agent.");
    }

    setSuccess(
      `${name} has been ${active ? "deactivated" : "activated"}.`
    );

    await Promise.all([refetchAgents(), refetchUsers()]);
  } catch (err) {
    setError(err.message || "Unable to update agent.");
  } finally {
    setBusyId(null);
  }
}

function StatCard({ title, value, description, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

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

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

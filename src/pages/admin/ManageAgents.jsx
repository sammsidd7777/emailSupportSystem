
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

  const [makeAgent, { isLoading: makingAgent }] =
    useMakeAgentMutation();

  const [removeAgent] = useRemoveAgentMutation();

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

  // Extract all users from API response
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

    const agentIds = new Set(
      agents.map((agent) => String(agent._id))
    );

    return list.filter((user) => {
      const role = String(
        user.role || user.Role || ""
      ).toLowerCase();

      return (
        ["customer", "user"].includes(role) &&
        !agentIds.has(String(user._id))
      );
    });
  }, [userData, agents]);

  const getName = (person) =>
    person?.name ||
    person?.Name ||
    person?.fullName ||
    person?.FullName ||
    "Unnamed";

  const getEmail = (person) =>
    person?.email || person?.Email || "";

  const getPhone = (person) =>
    person?.phone ||
    person?.Phone ||
    person?.phoneNumber ||
    person?.PhoneNumber ||
    "—";

  const getDate = (person) =>
    person?.createdAt || person?.CreatedAt || null;

  const getInitials = (person) =>
    getName(person)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const isActive = (person) =>
    person?.isActive !== undefined
      ? person.isActive !== false
      : person?.IsActive !== false;

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

  // Promote a customer to a support agent.
  const changeRole = async (person) => {
    const name = getName(person);

    if (
      !window.confirm(
        `Are you sure you want to make ${name} a support agent?`
      )
    ) {
      return false;
    }

    try {
      setBusyId(person._id);
      setError("");
      setSuccess("");

      const result = await makeAgent(person._id).unwrap();

      if (result?.success === false) {
        throw new Error(
          result.message || "Unable to change account role."
        );
      }

      await Promise.all([
        refetchAgents(),
        refetchUsers(),
      ]);

      setSuccess(`${name} is now a support agent.`);
      return true;
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.message ||
          "Unable to change account role."
      );
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
      setError(
        "Selected customer was not found. Refresh the list."
      );
      return;
    }

    const changed = await changeRole(selectedUser);

    if (changed) {
      setModalOpen(false);
      setSelectedUserId("");
      setUserSearch("");
    }
  };

  // Return an agent to the customer role.
  const handleRemoveAgent = async (agent) => {
    const name = getName(agent);

    if (
      !window.confirm(
        `Are you sure you want to make ${name} a customer?`
      )
    ) {
      return;
    }

    try {
      setBusyId(agent._id);
      setError("");
      setSuccess("");

      const result = await removeAgent(agent._id).unwrap();

      if (result?.success === false) {
        throw new Error(
          result.message || "Unable to remove agent role."
        );
      }

      await Promise.all([
        refetchAgents(),
        refetchUsers(),
      ]);

      setSuccess(`${name} has been moved back to customers.`);
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.message ||
          "Unable to remove agent role."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1f7a4d]">
            <Headset size={17} />
            Administration
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#0f3d28] sm:text-4xl">
            Manage Agents
          </h1>

          <p className="mt-2 text-sm text-neutral-500 sm:text-base">
            Manage your support team and account roles.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={fetchingAgents}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f3d28] transition hover:border-[#1f7a4d]/40 hover:bg-[#f7f7f5] disabled:opacity-50"
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110"
          >
            <UserPlus size={17} />
            Add Agent
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />
          <span className="flex-1">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success"
            className="rounded-lg p-1 transition hover:bg-emerald-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {agentsError && !error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {agentQueryError?.data?.message ||
            agentQueryError?.error ||
            "Failed to load agents."}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Agents"
          value={agents.length}
          description="Registered support agents"
          icon={<Headset size={22} />}
          color="featured"
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
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0f3d28]">
              Support Team
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              View agents and manage their account roles.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-full border border-neutral-200 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/10"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-full border border-neutral-200 bg-[#f7f7f5] px-5 py-3 text-sm text-neutral-700 outline-none transition focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/10"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        {/* Directory summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#fafaf8] px-5 py-3 text-xs text-neutral-500">
          <span>
            Showing{" "}
            <strong className="text-[#0f3d28]">
              {filteredAgents.length}
            </strong>{" "}
            of{" "}
            <strong className="text-[#0f3d28]">
              {agents.length}
            </strong>{" "}
            agents
          </span>

          {fetchingAgents && (
            <span className="inline-flex items-center gap-2 font-medium text-[#1f7a4d]">
              <RefreshCw size={13} className="animate-spin" />
              Updating list...
            </span>
          )}
        </div>

        {loadingAgents ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        ) : agentsError && agents.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <AlertCircle
              size={34}
              className="mx-auto mb-3 text-red-400"
            />
            <p>Unable to load agents.</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 font-semibold text-[#1f7a4d] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f7a4d]/10 text-[#1f7a4d]">
              <Headset size={30} />
            </div>
            <h3 className="font-semibold text-[#0f3d28]">
              No agents found
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Change your filters or add a customer as an agent.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-[#f7f7f5] text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Agent
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Phone
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Joined
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredAgents.map((agent) => {
                  const active = isActive(agent);
                  const busy = busyId === agent._id;

                  return (
                    <tr
                      key={agent._id}
                      className="transition-colors hover:bg-[#fafaf8]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1b7048] to-[#0d3b27] text-sm font-bold text-white">
                            {getInitials(agent) || "A"}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-[#0f3d28]">
                              {getName(agent)}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                              <Mail
                                size={13}
                                className="shrink-0"
                              />
                              <span className="truncate">
                                {getEmail(agent) || "No email"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-2">
                          <Phone
                            size={14}
                            className="text-neutral-400"
                          />
                          {getPhone(agent)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays
                            size={14}
                            className="text-neutral-400"
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
                              active
                                ? "bg-emerald-500"
                                : "bg-red-500"
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
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
                            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-[#0f3d28] transition hover:border-[#1f7a4d]/40 hover:bg-[#1f7a4d]/5 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Add agent modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b12]/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              busyId === null &&
              !makingAgent
            ) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-agent-title"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 p-5 sm:p-6">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#1f7a4d]">
                  Team Management
                </p>
                <h2
                  id="add-agent-title"
                  className="text-xl font-semibold text-[#0f3d28]"
                >
                  Add Support Agent
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Promote an existing customer account.
                </p>
              </div>

              <button
                type="button"
                disabled={busyId !== null || makingAgent}
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2.5 text-neutral-500 transition hover:bg-[#f7f7f5] hover:text-[#0f3d28] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="user-search"
                  className="mb-2 block text-sm font-semibold text-[#0f3d28]"
                >
                  Find a customer
                </label>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="user-search"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-full border border-neutral-200 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#1f7a4d] focus:ring-4 focus:ring-[#1f7a4d]/10"
                  />
                </div>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {loadingUsers ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-16 animate-pulse rounded-2xl bg-neutral-100"
                      />
                    ))}
                  </div>
                ) : filteredAvailableUsers.length === 0 ? (
                  <div className="rounded-2xl bg-[#f7f7f5] p-6 text-center">
                    <UserX
                      size={28}
                      className="mx-auto mb-2 text-neutral-400"
                    />
                    <p className="text-sm font-medium text-[#0f3d28]">
                      No eligible customers found
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Try another search or refresh the list.
                    </p>
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
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          selected
                            ? "border-[#1f7a4d] bg-[#1f7a4d]/5 ring-2 ring-[#1f7a4d]/10"
                            : "border-neutral-200 hover:border-[#1f7a4d]/30 hover:bg-[#fafaf8]"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            selected
                              ? "bg-gradient-to-br from-[#1b7048] to-[#0d3b27] text-white"
                              : "bg-[#1f7a4d]/10 text-[#0f3d28]"
                          }`}
                        >
                          {getInitials(user) || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#0f3d28]">
                            {getName(user)}
                          </p>
                          <p className="truncate text-xs text-neutral-500">
                            {getEmail(user) || "No email"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            selected
                              ? "bg-[#1f7a4d] text-white"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {selected ? "Selected" : "Customer"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={busyId !== null || makingAgent}
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-[#f7f7f5] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !selectedUserId ||
                    busyId !== null ||
                    makingAgent
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {makingAgent ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {makingAgent || busyId
                    ? "Updating..."
                    : "Make Agent"}
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
  {
    API,
    setBusyId,
    setError,
    setSuccess,
    refetchAgents,
    refetchUsers,
  }
) {
  const active =
    agent.isActive !== undefined
      ? agent.isActive !== false
      : agent.IsActive !== false;

  const name =
    agent.name ||
    agent.Name ||
    agent.fullName ||
    "this agent";

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

    const res = await fetch(
      `${API}/users/${agent._id}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !active,
        }),
      }
    );

    const result = await res.json();

    if (!res.ok || result.success === false) {
      throw new Error(
        result.message || "Unable to update agent."
      );
    }

    setSuccess(
      `${name} has been ${active ? "deactivated" : "activated"}.`
    );

    await Promise.all([
      refetchAgents(),
      refetchUsers(),
    ]);
  } catch (err) {
    setError(
      err.message || "Unable to update agent."
    );
  } finally {
    setBusyId(null);
  }
}

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}) {
  const featured = color === "featured";

  const iconStyles = {
    green: "bg-[#1f7a4d]/10 text-[#1f7a4d]",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 transition duration-200 hover:-translate-y-0.5 sm:p-6 ${
        featured
          ? "bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] text-white"
          : "bg-white text-[#0f3d28]"
      }`}
    >
      {featured && (
        <>
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-32 w-32 rounded-full border border-white/10" />
        </>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-sm font-medium ${
              featured ? "text-white/80" : "text-neutral-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight">
            {value}
          </p>

          <p
            className={`mt-2 text-xs ${
              featured ? "text-emerald-100/80" : "text-neutral-500"
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            featured
              ? "bg-white text-[#0f3d28]"
              : iconStyles[color] || iconStyles.green
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

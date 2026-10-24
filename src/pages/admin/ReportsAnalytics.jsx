
import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Ticket,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Users,
  RefreshCw,
  Download,
  CalendarDays,
  Activity,
  Headset,
} from "lucide-react";

const weeklyData = [
  { day: "Mon", created: 28, resolved: 20 },
  { day: "Tue", created: 35, resolved: 26 },
  { day: "Wed", created: 24, resolved: 21 },
  { day: "Thu", created: 42, resolved: 31 },
  { day: "Fri", created: 38, resolved: 34 },
  { day: "Sat", created: 19, resolved: 16 },
  { day: "Sun", created: 25, resolved: 22 },
];

const initialAgents = [
  { name: "Rahul Sharma", assigned: 42, resolved: 36 },
  { name: "Priya Singh", assigned: 38, resolved: 32 },
  { name: "Aman Kumar", assigned: 31, resolved: 25 },
  { name: "Neha Verma", assigned: 27, resolved: 24 },
];

const statusData = [
  { label: "Open", value: 28, color: "bg-amber-400" },
  { label: "In Progress", value: 35, color: "bg-blue-500" },
  { label: "Resolved", value: 82, color: "bg-emerald-500" },
  { label: "Closed", value: 45, color: "bg-slate-400" },
];

const priorityData = [
  { label: "Critical", value: 12, color: "bg-red-500" },
  { label: "High", value: 28, color: "bg-orange-500" },
  { label: "Medium", value: 64, color: "bg-amber-400" },
  { label: "Low", value: 86, color: "bg-emerald-500" },
];

export default function ReportsAnalytics() {
  const [period, setPeriod] = useState("7days");
  const [refreshing, setRefreshing] = useState(false);

  // Demo figures: replace with API response when connected.
  const report = useMemo(() => {
    if (period === "today") {
      return {
        created: 18,
        resolved: 14,
        pending: 22,
        resolution: 77.8,
        avgResolution: "2.4 hrs",
        agents: 8,
      };
    }

    if (period === "30days") {
      return {
        created: 684,
        resolved: 562,
        pending: 122,
        resolution: 82.2,
        avgResolution: "3.1 hrs",
        agents: 12,
      };
    }

    return {
      created: 211,
      resolved: 170,
      pending: 41,
      resolution: 80.6,
      avgResolution: "2.8 hrs",
      agents: 10,
    };
  }, [period]);

  const maxWeekly = Math.max(
    ...weeklyData.map((item) =>
      Math.max(item.created, item.resolved)
    )
  );

  const totalPriority = priorityData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // Replace with your RTK Query refetch calls.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const exportCSV = () => {
    const rows = [
      ["Report", "Value"],
      ["Period", period],
      ["Tickets Created", report.created],
      ["Tickets Resolved", report.resolved],
      ["Pending Tickets", report.pending],
      ["Resolution Rate", `${report.resolution}%`],
      ["Average Resolution Time", report.avgResolution],
      ["Active Agents", report.agents],
      [],
      ["Agent", "Assigned", "Resolved"],
      ...initialAgents.map((agent) => [
        agent.name,
        agent.assigned,
        agent.resolved,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `support-report-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1f7a4d]">
            <BarChart3 size={17} />
            Business Intelligence
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#0f3d28] sm:text-4xl">
            Reports & Analytics
          </h1>

          <p className="mt-2 text-sm text-neutral-500 sm:text-base">
            Monitor ticket trends, support performance and team productivity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f3d28] transition hover:bg-[#f7f7f5] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#0d3b27]/20 transition hover:brightness-110"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-neutral-200/80 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f7a4d]/10 text-[#1f7a4d]">
            <CalendarDays size={21} />
          </div>
          <div>
            <p className="font-semibold text-[#0f3d28]">
              Reporting Period
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Select a period to view the summary
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Today", value: "today" },
            { label: "Last 7 Days", value: "7days" },
            { label: "Last 30 Days", value: "30days" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                period === option.value
                  ? "bg-[#0f3d28] text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-[#f7f7f5]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Tickets Created"
          value={report.created}
          subtitle="Tickets received in this period"
          icon={<Ticket size={22} />}
          featured
          trend="+12.5%"
          positive
        />

        <MetricCard
          title="Tickets Resolved"
          value={report.resolved}
          subtitle="Successfully resolved tickets"
          icon={<CheckCircle2 size={22} />}
          color="green"
          trend="+8.2%"
          positive
        />

        <MetricCard
          title="Pending Tickets"
          value={report.pending}
          subtitle="Tickets requiring attention"
          icon={<Clock3 size={22} />}
          color="amber"
          trend="-4.3%"
          positive
        />

        <MetricCard
          title="Resolution Rate"
          value={`${report.resolution}%`}
          subtitle="Resolved tickets in this period"
          icon={<TrendingUp size={22} />}
          color="green"
          trend="+5.4%"
          positive
        />

        <MetricCard
          title="Avg. Resolution Time"
          value={report.avgResolution}
          subtitle="Average time to resolve a ticket"
          icon={<Activity size={22} />}
          color="blue"
          trend="-10.2%"
          positive
        />

        <MetricCard
          title="Support Agents"
          value={report.agents}
          subtitle="Agents included in this demo report"
          icon={<Users size={22} />}
          color="green"
        />
      </div>

      {/* Weekly chart and ticket status */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0f3d28]">
                Ticket Activity
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Tickets created versus resolved
              </p>
            </div>

            <div className="flex gap-4 text-xs font-medium text-neutral-600">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1f7a4d]" />
                Created
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b8d8c4]" />
                Resolved
              </span>
            </div>
          </div>

          <div className="mt-8 flex h-64 items-end justify-between gap-2 border-b border-neutral-100 pb-2 sm:gap-4">
            {weeklyData.map((item) => (
              <div
                key={item.day}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              >
                <div className="mb-3 flex h-full w-full items-end justify-center gap-1.5 sm:gap-2">
                  <div
                    title={`Created: ${item.created}`}
                    className="w-[42%] max-w-8 rounded-t-lg bg-[#1f7a4d] transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${(item.created / maxWeekly) * 88}%`,
                    }}
                  />

                  <div
                    title={`Resolved: ${item.resolved}`}
                    className="w-[42%] max-w-8 rounded-t-lg bg-[#b8d8c4] transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${(item.resolved / maxWeekly) * 88}%`,
                    }}
                  />
                </div>

                <span className="mt-2 text-xs text-neutral-500">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f7f7f5] p-4">
              <p className="text-xs text-neutral-500">
                Total Created
              </p>
              <p className="mt-1 text-xl font-semibold text-[#0f3d28]">
                {weeklyData.reduce((sum, item) => sum + item.created, 0)}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f7f7f5] p-4">
              <p className="text-xs text-neutral-500">
                Total Resolved
              </p>
              <p className="mt-1 text-xl font-semibold text-[#0f3d28]">
                {weeklyData.reduce((sum, item) => sum + item.resolved, 0)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0f3d28]">
              Ticket Status
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Breakdown by current status
            </p>
          </div>

          <div className="my-7 flex justify-center">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #fbbf24 0% 14.7%,
                  #3b82f6 14.7% 33.1%,
                  #10b981 33.1% 76.1%,
                  #94a3b8 76.1% 100%
                )`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <p className="text-3xl font-semibold text-[#0f3d28]">
                  {statusData.reduce((sum, item) => sum + item.value, 0)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Total tickets
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {statusData.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                  />
                  <span className="text-sm text-neutral-600">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#0f3d28]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Priority and agent performance */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle size={21} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0f3d28]">
                Priority Analysis
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Tickets grouped by priority
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {priorityData.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-[#0f3d28]">
                    {item.value}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{
                      width: `${(item.value / totalPriority) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Priority review
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              Review critical and high-priority tickets regularly to help
              prevent overdue responses.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f7a4d]/10 text-[#1f7a4d]">
                <Headset size={21} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0f3d28]">
                  Agent Performance
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Assigned versus resolved tickets
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {initialAgents.map((agent, index) => {
              const percentage = Math.round(
                (agent.resolved / agent.assigned) * 100
              );

              return (
                <div key={agent.name}>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1b7048] to-[#0d3b27] text-xs font-bold text-white">
                      {agent.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0f3d28]">
                        {agent.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {agent.resolved} of {agent.assigned} resolved
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-[#1f7a4d]">
                      {percentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1f7a4d] to-[#8dc8a5] transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 rounded-2xl bg-[#f7f7f5] p-4 text-xs leading-5 text-neutral-500">
            Performance percentages are calculated from the demo values
            shown above.
          </p>
        </section>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#1f7a4d]/15 bg-[#1f7a4d]/5 p-4">
        <Activity
          size={19}
          className="mt-0.5 shrink-0 text-[#1f7a4d]"
        />
        <div>
          <p className="text-sm font-semibold text-[#0f3d28]">
            Analytics overview
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-600">
            This page currently uses sample figures for the UI. Connect your
            ticket and agent APIs to display actual counts, response times,
            ticket status distribution and agent performance.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = "green",
  featured = false,
  trend,
  positive,
}) {
  const iconStyles = {
    green: "bg-[#1f7a4d]/10 text-[#1f7a4d]",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 transition duration-200 hover:-translate-y-0.5 sm:p-6 ${
        featured
          ? "bg-gradient-to-br from-[#1b7048] via-[#115236] to-[#0a2e1e] text-white"
          : "border border-neutral-200/80 bg-white text-[#0f3d28] shadow-sm"
      }`}
    >
      {featured && (
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border border-white/10" />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-sm font-medium ${
              featured ? "text-white/80" : "text-neutral-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-3 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
            {value}
          </p>

          <p
            className={`mt-2 text-xs leading-5 ${
              featured ? "text-emerald-100/80" : "text-neutral-500"
            }`}
          >
            {subtitle}
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

      {trend && (
        <div
          className={`relative mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            featured
              ? "bg-white/10 text-white"
              : positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {positive ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          {trend}
          <span className="font-normal opacity-80">
            vs previous period
          </span>
        </div>
      )}
    </div>
  );
}

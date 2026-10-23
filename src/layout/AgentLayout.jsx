
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Inbox,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  Headset,
  ChevronRight,
  ShieldCheck,
  CircleHelp,
  Sparkles,
} from "lucide-react";

const AgentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/agent/dashboard",
      icon: LayoutDashboard,
      section: "Overview",
    },
    {
      name: "Assigned Tickets",
      path: "/agent/my-tickets",
      icon: Ticket,
      section: "Tickets",
    },
    {
      name: "Unassigned Tickets",
      path: "/agent/unassigned",
      icon: Inbox,
      section: "Tickets",
      soon: true,
    },
    {
      name: "My Profile",
      path: "/agent/profile",
      icon: UserRound,
      section: "Account",
      soon: true,
    },
    {
      name: "Settings",
      path: "/agent/settings",
      icon: Settings,
      section: "Account",
      soon: true,
    },
  ];

  const activePage =
    navItems.find((item) => item.path === location.pathname)?.name ||
    (location.pathname.startsWith("/agent/tickets/")
      ? "Ticket Details"
      : "Agent Workspace");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const sections = ["Overview", "Tickets", "Account"];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          bg-[#111827] text-white shadow-2xl shadow-slate-950/10
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[82px] items-center justify-between border-b border-white/[0.08] px-6">
          <button
            type="button"
            onClick={() => navigate("/agent/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/25">
              <Headset size={23} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-[17px] font-extrabold tracking-tight">
                BitMax<span className="text-blue-400">.</span>
              </h1>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
                SUPPORT WORKSPACE
              </p>
            </div>
          </button>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Agent profile card */}
        <div className="px-4 py-5">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg">
                  A
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#172033] bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  Support Agent
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Customer Support
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-3">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span className="text-[11px] font-medium text-slate-300">
                Agent account
              </span>
              <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {sections.map((section) => {
            const items = navItems.filter(
              (item) => item.section === section
            );

            return (
              <div key={section} className="mb-6">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {section}
                </p>

                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                              : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-cyan-300" />
                            )}

                            <Icon
                              size={18}
                              strokeWidth={isActive ? 2.3 : 1.8}
                              className={
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 transition group-hover:text-blue-300"
                              }
                            />

                            <span className="flex-1">{item.name}</span>

                            {item.soon && (
                              <span className="rounded-md border border-amber-300/10 bg-amber-300/10 px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                                Soon
                              </span>
                            )}

                            {isActive && (
                              <ChevronRight
                                size={15}
                                className="text-blue-100"
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Help card */}
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/15 to-indigo-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-300" />
              <span className="text-xs font-bold text-white">
                Need assistance?
              </span>
            </div>

            <p className="text-[11px] leading-5 text-slate-400">
              Keep your workspace organized and respond to customer tickets.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-white/[0.08] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-red-400/10 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Sign out
          </button>

          <p className="mt-3 text-center text-[10px] text-slate-600">
            BitMax Support Portal · v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen md:ml-[270px]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Workspace</span>
                <ChevronRight size={13} />
                <span className="truncate font-medium text-slate-600">
                  {activePage}
                </span>
              </div>

            
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-700">
                Workspace active
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/agent/profile")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-extrabold text-blue-700">
                A
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold text-slate-800">
                  My Account
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Support Agent
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-slate-200/80 bg-white/70 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} BitMax Support Portal</p>

          <div className="flex items-center gap-2">
            <CircleHelp size={14} />
            <span>Agent Workspace</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AgentLayout;

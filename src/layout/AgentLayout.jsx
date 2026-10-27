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
      // path: "/agent/profile",
      icon: UserRound,
      section: "Account",
      soon: true,
    },
    {
      name: "Settings",
      // path: "/agent/settings",
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
    <div className="min-h-screen bg-[#050505] text-neutral-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-[#d4af37]/20 bg-black text-white
          shadow-2xl shadow-black
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[82px] items-center justify-between border-b border-[#d4af37]/20 px-6">
          <button
            type="button"
            onClick={() => navigate("/agent/dashboard")}
            className="flex items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d77a] via-[#d4af37] to-[#9a7420] text-black shadow-lg shadow-[#d4af37]/25">
              <Headset size={23} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-[17px] font-extrabold tracking-tight text-white">
                BitMax<span className="text-[#d4af37]">.</span>
              </h1>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide text-neutral-500">
                Support workspace
              </p>
            </div>
          </button>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-neutral-400 transition hover:bg-[#d4af37]/10 hover:text-[#f5d77a] md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Agent profile card */}
        <div className="px-4 py-5">
          <div className="rounded-2xl border border-[#d4af37]/25 bg-gradient-to-br from-[#d4af37]/10 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d77a] via-[#d4af37] to-[#9a7420] text-lg font-bold text-black shadow-lg shadow-[#d4af37]/20">
                  A
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-black bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  Support Agent
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Customer Support
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-[#d4af37]/15 pt-3">
              <ShieldCheck size={15} className="text-[#d4af37]" />
              <span className="text-[11px] font-medium text-neutral-300">
                Agent account
              </span>
              <span className="ml-auto rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2 py-1 text-[10px] font-semibold text-[#f5d77a]">
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
                <p className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-[#d4af37]/70">
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
                          `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60 ${
                            isActive
                              ? "bg-gradient-to-r from-[#d4af37] to-[#b8892b] font-semibold text-black shadow-lg shadow-[#d4af37]/20"
                              : "text-neutral-400 hover:bg-[#d4af37]/10 hover:text-[#f5d77a]"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-black/70" />
                            )}

                            <Icon
                              size={18}
                              strokeWidth={isActive ? 2.3 : 1.8}
                              className={
                                isActive
                                  ? "text-black"
                                  : "text-neutral-500 transition group-hover:text-[#d4af37]"
                              }
                            />

                            <span className="flex-1">{item.name}</span>

                            {item.soon && (
                              <span
                                className={`rounded-md border px-1.5 py-1 text-[9px] font-bold tracking-wide ${
                                  isActive
                                    ? "border-black/20 bg-black/10 text-black"
                                    : "border-[#d4af37]/25 bg-[#d4af37]/10 text-[#d4af37]"
                                }`}
                              >
                                Soon
                              </span>
                            )}

                            {isActive && (
                              <ChevronRight
                                size={15}
                                className="text-black/70"
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
          <div className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/10 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#d4af37]" />
              <span className="text-xs font-bold text-white">
                Need assistance?
              </span>
            </div>

            <p className="text-[11px] leading-5 text-neutral-500">
              Keep your workspace organized and respond to customer tickets.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-[#d4af37]/20 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-neutral-400 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60"
          >
            <LogOut size={18} />
            Sign out
          </button>

          <p className="mt-3 text-center text-[10px] text-neutral-600">
            BitMax Support Portal · v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen md:ml-[270px]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#d4af37]/20 bg-black/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[#d4af37]/30 bg-black p-2.5 text-[#d4af37] transition hover:bg-[#d4af37]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60 md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Workspace</span>
                <ChevronRight size={13} className="text-[#d4af37]/60" />
                <span className="truncate text-sm font-semibold text-[#f5d77a]">
                  {activePage}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
              <span className="text-[11px] font-semibold text-[#f5d77a]">
                Workspace active
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/agent/profile")}
              className="flex items-center gap-2 rounded-xl border border-[#d4af37]/25 bg-black p-1.5 pr-3 transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#f5d77a] via-[#d4af37] to-[#9a7420] text-sm font-extrabold text-black">
                A
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold text-white">My Account</p>
                <p className="mt-0.5 text-[10px] text-neutral-500">
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
        <footer className="flex flex-col gap-2 border-t border-[#d4af37]/20 bg-black/70 px-6 py-4 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} BitMax Support Portal</p>

          <div className="flex items-center gap-2">
            <CircleHelp size={14} className="text-[#d4af37]/70" />
            <span>Agent Workspace</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AgentLayout;

import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Ticket,
  Inbox,
  Users,
  Headset,
  FolderKanban,
  ChartNoAxesCombined,
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  LifeBuoy,
  PanelLeftClose,
} from "lucide-react";

const navGroups = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Support Operations",
    items: [
      {
        name: "All Tickets",
        path: "/admin/tickets",
        icon: Ticket,
      },
      {
        name: "Unassigned Tickets",
        path: "/admin/unassigned",
        icon: Inbox,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        name: "User Management",
        path: "/admin/users",
        icon: Users,
      },
      {
        name: "Agent Management",
        path: "/admin/agents",
        icon: Headset,
      },
      {
        name: "Categories",
        path: "/admin/categories",
        icon: FolderKanban,
      },
      {
        name: "Reports & Analytics",
        path: "/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const allItems = navGroups.flatMap((group) => group.items);

  const activeItem = allItems.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
  );

  const pageTitle = location.pathname === "/admin/profile"
    ? "My Profile"
    : activeItem?.name || "Admin Panel";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-white/10 bg-[#111827] text-slate-300
          transition-transform duration-300 ease-in-out
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.08] px-6">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <LifeBuoy size={23} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-white">
                BitMax<span className="text-blue-400">.</span>
              </h1>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
                SUPPORT CENTER
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Admin card */}
        <div className="px-4 py-5">
          <div className="rounded-2xl border border-white/[0.09] bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-950/30">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Administrator
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  System Management
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[11px] font-medium text-emerald-400">
                Administrator Access
              </span>

              <ShieldCheck
                size={14}
                className="ml-auto text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
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
                            <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-blue-300" />
                          )}

                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.3 : 1.8}
                            className={
                              isActive
                                ? "text-white"
                                : "text-slate-400 transition-colors group-hover:text-blue-300"
                            }
                          />

                          <span className="flex-1">{item.name}</span>

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
          ))}
        </nav>

        

        {/* Logout */}
        <div className="border-t border-white/[0.08] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>

          <p className="mt-3 text-center text-[10px] text-slate-600">
            BitMax Support Portal · Admin
          </p>
        </div>
      </aside>

      {/* Main section */}
      <div className="min-h-screen md:ml-[270px]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 md:flex">
                <PanelLeftClose size={18} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Admin</span>
                  <ChevronRight size={13} />
                  <span className="truncate font-medium text-slate-600">
                    {pageTitle}
                  </span>
                </div>

                <h2 className="mt-1 truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  {pageTitle}
                </h2>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-700">
                  Admin Panel
                </span>
              </div>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <button
                type="button"
                onClick={() => navigate("/admin/profile")}
                className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100 sm:pr-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-indigo-700 ring-1 ring-indigo-200/70">
                  A
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-slate-800">
                    Admin Account
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Manage profile
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

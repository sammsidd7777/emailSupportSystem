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
import AdminPushListener from "../pages/admin/AdminPushListener";
import EnablePushNotifications from "../components/EnablePushNotifications";
import Toast from "../components/common/Toast";

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
    <>
    <div className="min-h-screen bg-[#e9ecea] text-neutral-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-[#06190f]/50 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-3 left-3 top-3 z-50 flex w-[264px] flex-col
          rounded-[28px] bg-[#f7f7f5] text-neutral-500 shadow-xl shadow-black/5
          transition-transform duration-300 ease-in-out
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-[120%]"
          }
          md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[84px] items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#1f7a4d] text-[#1f7a4d]">
              <LifeBuoy size={20} strokeWidth={2.4} />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#0f3d28]">
                BitMax
              </h1>
              <p className="-mt-0.5 text-[11px] font-medium text-neutral-400">
                Support center
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-neutral-400 hover:bg-black/5 hover:text-neutral-700 md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto pb-4 pt-3">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-6 text-xs font-medium text-neutral-400">
                {group.title}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3.5 px-6 py-3 text-[14px] transition-colors duration-200 focus:outline-none focus-visible:bg-[#1f7a4d]/10 ${
                          isActive
                            ? "font-semibold text-[#0f3d28]"
                            : "font-medium text-neutral-500 hover:text-[#0f3d28]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-r-full bg-[#1f7a4d]" />
                          )}

                          <Icon
                            size={20}
                            strokeWidth={isActive ? 2.2 : 1.7}
                            className={
                              isActive
                                ? "text-[#1f7a4d]"
                                : "text-neutral-400 transition-colors group-hover:text-[#1f7a4d]"
                            }
                          />

                          <span className="flex-1">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
                       <button
  type="button"
  onClick={() => Toast.success("Toast is working!")}
  className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
>
  Test Toasts
</button>
              </div>
            </div>
          ))}
        </nav>

        {/* Admin card */}
        <div className="px-3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#15663f] via-[#0d3b27] to-[#06190f] p-4 text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full border border-white/10" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#63c192] text-lg font-bold text-[#06190f]">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Administrator
                </p>
                <p className="mt-0.5 text-xs text-white/60">
                  System Management
                </p>
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#63c192] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#63c192]" />
              </span>

              <span className="text-[11px] font-medium text-white/90">
                Administrator Access
              </span>

              <ShieldCheck
                size={14}
                className="ml-auto text-[#63c192]"
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <LogOut size={19} />
            <span>Sign out</span>
          </button>

          <p className="mt-2 text-center text-[10px] text-neutral-400">
            BitMax Support Portal · Admin
          </p>
        </div>
      </aside>

      {/* Main section */}
      <div className="min-h-screen p-3 md:ml-[288px] md:pl-1">
        {/* Top navbar */}
        <header className="sticky top-3 z-30 rounded-[28px] bg-[#f7f7f5]/95 backdrop-blur-xl">
          <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0f3d28] shadow-sm transition hover:bg-[#1f7a4d]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-white text-[#1f7a4d] shadow-sm md:flex">
                <PanelLeftClose size={18} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Admin</span>
                  <ChevronRight size={13} />
                  <span className="truncate font-medium text-[#1f7a4d]">
                    {pageTitle}
                  </span>
                </div>

                <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-[#0f3d28] sm:text-xl">
                  {pageTitle}
                </h2>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#1b7048] to-[#0d3b27] px-4 py-2.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#63c192]" />
                <span className="text-xs font-semibold text-white">
                  Admin Panel
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/profile")}
                className="flex items-center gap-3 rounded-full bg-white p-1.5 pr-2 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a4d]/50 sm:pr-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#63c192] to-[#1f7a4d] text-sm font-bold text-white">
                  A
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-[#0f3d28]">
                    Admin Account
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Manage profile
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto mt-3 w-full max-w-[1800px] rounded-[28px] bg-[#f7f7f5] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>

    <EnablePushNotifications />
    <AdminPushListener />
    </>
  );
};

export default AdminLayout;
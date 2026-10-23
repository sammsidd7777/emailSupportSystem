
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Plus,
  Ticket,
  UserRound,
  LogOut,
  Menu,
  X,
  Headset,
  ChevronRight,
  Bell,
  Settings,
} from "lucide-react";

import {
  logoutSuccess,
  selectCurrentUser,
} from "../services/authSlice";
import {
  useLogoutMutation,
  authApi,
} from "../services/RTK/authApi";

const navItems = [
  {
    name: "Dashboard",
    path: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Create Ticket",
    path: "/user/create-ticket",
    icon: Plus,
  },
  {
    name: "My Tickets",
    path: "/user/my-tickets",
    icon: Ticket,
  },
  {
    name: "My Profile",
    path: "/user/profile",
    icon: UserRound,
  },
];

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();

  const userName =
    user?.name || user?.Name || user?.fullName || "Customer";

  const userEmail = user?.email || user?.Email || "";
  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const currentPage =
    navItems.find((item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    )?.name || "Customer Portal";

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout().unwrap();
    } catch (error) {
      console.error("Logout API failed:", error);
      setLoggingOut(false);
      return;
    }

    dispatch(logoutSuccess());
    dispatch(authApi.util.resetApiState());

    navigate("/auth?mode=login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px]
          flex-col border-r border-slate-800 bg-[#111827] text-white
          transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/20">
              <Headset size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                BitMax<span className="text-blue-400">.</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                SUPPORT CENTER
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white">
              {initials || "C"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="mt-1 truncate text-xs text-slate-400">
                {userEmail || "Customer account"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">
              Customer workspace
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-950/30"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3">
                        <Icon size={19} strokeWidth={1.9} />
                        {item.name}
                      </span>

                      {isActive && (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Account
            </p>

            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                navigate("/user/profile");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Settings size={19} />
              Account settings
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Sign out"}
          </button>

          <p className="mt-4 text-center text-[10px] text-slate-600">
            BitMax Support Portal
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen md:ml-[270px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Workspace</span>
                <ChevronRight size={13} />
                <span className="truncate text-slate-600">
                  {currentPage}
                </span>
              </div>

              <h2 className="mt-1 truncate text-base font-bold text-slate-900 sm:text-lg">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-slate-800">
                {userName}
              </p>
              <p className="text-xs text-slate-500">
                Customer
              </p>
            </div>

            <button
              type="button"
              aria-label="Open profile"
              onClick={() => navigate("/user/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              {initials || "C"}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;

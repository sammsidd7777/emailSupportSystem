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
  ChevronRight,
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
  { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
  { name: "Create Ticket", path: "/user/create-ticket", icon: Plus },
  { name: "My Tickets", path: "/user/my-tickets", icon: Ticket },
  { name: "My Profile", path: "/user/profile", icon: UserRound },
];

/* BitMax logo mark (inline SVG, no image file needed) */
const LogoMark = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="ul-logo-g" x1="6" y1="4" x2="42" y2="44">
        <stop offset="0" stopColor="#fdeaa8" />
        <stop offset="0.5" stopColor="#e5b84b" />
        <stop offset="1" stopColor="#a8761a" />
      </linearGradient>
    </defs>
    <path
      d="M24 3 42 13.5v21L24 45 6 34.5v-21L24 3Z"
      fill="url(#ul-logo-g)"
      fillOpacity="0.14"
      stroke="url(#ul-logo-g)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M18 14v20m0-20h6.5a5 5 0 0 1 0 10H18m0 0h7.5a5 5 0 0 1 0 10H18"
      stroke="url(#ul-logo-g)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    // CHANGED: cream background -> black
    <div className="min-h-screen bg-black text-[#f3ead2]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px]
          flex-col overflow-hidden border-r border-amber-200/10 bg-[#0a0907] text-white
          shadow-[10px_0_40px_rgba(0,0,0,0.25)]
          transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Soft gold glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-600/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-yellow-500/10 blur-[90px]" />

        {/* Brand */}
        <div className="relative flex h-[76px] items-center justify-between border-b border-amber-200/10 px-6">
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <LogoMark size={40} />

            <div className="leading-none">
              <h1 className="bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-lg font-semibold tracking-[0.2em] text-transparent">
                BITMAX
              </h1>
              <p className="mt-1.5 text-[11px] tracking-[0.1em] text-amber-100/45">
                Support center
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        <div className="relative mx-4 mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(253,234,168,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/20">
              {initials || "C"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="mt-1 truncate text-xs text-white/45">
                {userEmail || "Customer account"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs text-white/45">
              Customer workspace
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-4 py-7 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <p className="mb-3 px-3 text-xs font-medium text-white/35">
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
                    `group flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm transition-all duration-200 ${
                      isActive
                        ? "border-amber-300/30 bg-gradient-to-r from-amber-300/15 to-amber-300/[0.03] font-semibold text-amber-100 shadow-[inset_0_1px_0_rgba(253,234,168,0.15)]"
                        : "border-transparent text-white/55 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3">
                        <Icon
                          size={19}
                          strokeWidth={1.9}
                          className={isActive ? "text-amber-300" : ""}
                        />
                        {item.name}
                      </span>

                      {isActive && (
                        <ChevronRight size={16} className="text-amber-300" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="mb-3 px-3 text-xs font-medium text-white/35">
              Account
            </p>

            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                navigate("/user/profile");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Settings size={19} />
              Account settings
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="relative border-t border-amber-200/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Sign out"}
          </button>

          <p className="mt-4 text-center text-[10px] text-white/25">
            BitMax Support Portal
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen md:ml-[270px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-amber-200/10 bg-[#0a0907]/90 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:px-6 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-xl border border-white/15 p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>Workspace</span>
                <ChevronRight size={13} />
                <span className="truncate text-amber-200/80">
                  {currentPage}
                </span>
              </div>

              <h2 className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="text-xs text-amber-200/60">Customer</p>
            </div>

            <button
              type="button"
              aria-label="Open profile"
              onClick={() => navigate("/user/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110"
            >
              {initials || "C"}
            </button>
          </div>
        </header>

        {/* Page content: black bg + responsive spacing for mobile/tablet/desktop */}
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
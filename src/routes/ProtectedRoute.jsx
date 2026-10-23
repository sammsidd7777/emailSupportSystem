
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const getRole = (user) =>
  String(user?.role || user?.Role || "").toLowerCase();

const getDashboard = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "supportagent" || role === "support_agent") {
    return "/agent/dashboard";
  }
  return "/user/dashboard";
};

function ProtectedRoute({ allowedRoles, children }) {
  // Assumes your Redux auth slice stores user and authentication status.
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  const location = useLocation();
  const role = getRole(user);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboard(role)} replace />;
  }

  return children;
}

export function UserProtectRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      {children}
    </ProtectedRoute>
  );
}

export function AgentProtectRoute({ children }) {
  return (
    <ProtectedRoute
      allowedRoles={["supportagent", "support_agent"]}
    >
      {children}
    </ProtectedRoute>
  );
}

export function AdminProtectRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
}

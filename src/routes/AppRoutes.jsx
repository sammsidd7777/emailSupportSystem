
import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "../pages/Home";
import Auth from "../pages/auth/Auth";

// Layouts
import UserLayout from "../layout/UserLayout";
import AgentLayout from "../layout/AgentLayout";
import AdminLayout from "../layout/AdminLayout";

// User Pages
import UserDashboard from "../pages/users/UserDashboard";
import UserProfile from "../pages/users/UserProfile";
import CreateTicket from "../pages/users/CreateTicket";
import MyTickets from "../pages/users/MyTickets";
import TicketDetail from "../pages/users/TicketDetails";

// Agent Pages
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentMyTickets from "../pages/agent/MyAssignedTickets";
import AgentTicketDetails from "../pages/agent/AgentTicketDetails";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AllTickets from "../pages/admin/AllTickets";
import UnassignedTickets from "../pages/admin/UnassignedTickets";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageAgents from "../pages/admin/ManageAgents";
import ManageCategories from "../pages/admin/ManageCategories";

// Shared Pages
import UnderConstruction from "../pages/Undercunstruction";

// Protected Routes
import {
  UserProtectRoute,
  AgentProtectRoute,
  AdminProtectRoute,
} from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<Home />} />

      {/* All authentication sections */}
      <Route path="/auth" element={<Auth />} />

      {/* Old authentication URLs */}
      <Route
        path="/login"
        element={<Navigate to="/auth" replace />}
      />

      <Route
        path="/register"
        element={
          <Navigate to="/auth?mode=register" replace />
        }
      />

      <Route
        path="/forgot-password"
        element={
          <Navigate to="/auth?mode=forgot" replace />
        }
      />

      <Route
        path="/verification"
        element={
          <Navigate to="/auth?mode=reset" replace />
        }
      />

      <Route
        path="/reset-password"
        element={
          <Navigate to="/auth?mode=reset" replace />
        }
      />

      {/* ================= USER ROUTES ================= */}

      <Route
        path="/user"
        element={
          <UserProtectRoute>
            <UserLayout />
          </UserProtectRoute>
        }
      >
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="profile"
          element={<UserProfile />}
        />

        <Route
          path="create-ticket"
          element={<CreateTicket />}
        />

        <Route
          path="my-tickets"
          element={<MyTickets />}
        />

        <Route
          path="tickets/:ticketId"
          element={<TicketDetail />}
        />

        {/* User pages under development */}
        <Route
          path="notifications"
          element={
            <UnderConstruction
              title="Notifications"
              description="Your notifications page is coming soon."
            />
          }
        />

        <Route
          path="settings"
          element={
            <UnderConstruction
              title="User Settings"
              description="User settings are currently under development."
            />
          }
        />
      </Route>

      {/* ================= AGENT ROUTES ================= */}

      <Route
        path="/agent"
        element={
          <AgentProtectRoute>
            <AgentLayout />
          </AgentProtectRoute>
        }
      >
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<AgentDashboard />}
        />

        <Route
          path="my-tickets"
          element={<AgentMyTickets />}
        />

        <Route
          path="tickets/:ticketId"
          element={<AgentTicketDetails />}
        />

        {/* Agent pages under development */}
        <Route
          path="profile"
          element={
            <UnderConstruction
              title="Agent Profile"
              description="Agent profile management is coming soon."
            />
          }
        />

        <Route
          path="settings"
          element={
            <UnderConstruction
              title="Agent Settings"
              description="Agent settings are currently under development."
            />
          }
        />

        <Route
          path="reports"
          element={
            <UnderConstruction
              title="Agent Reports"
              description="Agent reports are coming soon."
            />
          }
        />
      </Route>

      {/* ================= ADMIN ROUTES ================= */}

      <Route
        path="/admin"
        element={
          <AdminProtectRoute>
            <AdminLayout />
          </AdminProtectRoute>
        }
      >
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="tickets"
          element={<AllTickets />}
        />

        <Route
          path="unassigned"
          element={<UnassignedTickets />}
        />

        <Route
          path="users"
          element={<ManageUsers />}
        />

        <Route
          path="agents"
          element={<ManageAgents />}
        />

        <Route
          path="categories"
          element={<ManageCategories />}
        />

        {/* Admin pages under development */}
        <Route
          path="reports"
          element={
            <UnderConstruction
              title="Admin Reports"
              description="Reports and analytics are coming soon."
            />
          }
        />

        <Route
          path="settings"
          element={
            <UnderConstruction
              title="Admin Settings"
              description="Admin settings are currently under development."
            />
          }
        />

        <Route
          path="profile"
          element={
            <UnderConstruction
              title="Admin Profile"
              description="Admin profile management is currently under development."
            />
          }
        />

        <Route
          path="activity"
          element={
            <UnderConstruction
              title="Activity Logs"
              description="System activity logs are under development."
            />
          }
        />
      </Route>

      {/* ================= SHARED ROUTES ================= */}

      <Route
        path="/under-construction"
        element={<UnderConstruction />}
      />

      {/* ================= 404 ROUTE ================= */}

      <Route
        path="*"
        element={
          <Navigate to="/under-construction" replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;

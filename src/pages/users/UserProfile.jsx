
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Pencil,
  LockKeyhole,
  Save,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function UserProfile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    createdAt: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile load nahi ho payi");
      }

      const profile = data.user || data.data?.user || data.data;

      setUser(profile);
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update nahi hui");
      }

      const updatedUser =
        data.user || data.data?.user || data.data || {
          ...user,
          ...form,
        };

      setUser((previous) => ({ ...previous, ...updatedUser }));
      setForm({
        name: updatedUser.name || form.name,
        phone: updatedUser.phone || form.phone,
      });

      setEditing(false);
      setMessage(data.message || "Profile successfully update ho gayi");
    } catch (err) {
      setError(err.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password aur confirm password match nahi karte.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(`${API_URL}/users/change-password`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change nahi hua");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(data.message || "Password successfully change ho gaya");
    } catch (err) {
      setError(err.message || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (user.name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <p className="animate-pulse text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page heading */}
        <div>
          <p className="text-sm font-medium text-blue-600">
            Account Settings
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Apni personal information aur account settings manage karein.
          </p>
        </div>

        {/* Alerts */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Profile banner */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 sm:h-36" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-2xl font-bold text-blue-700 shadow-sm sm:h-28 sm:w-28">
                  {initials}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {user.name || "Your Name"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {user.email || "Email not available"}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                    <ShieldCheck size={14} />
                    {user.role || "Customer"}
                  </span>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      name: user.name || "",
                      phone: user.phone || "",
                    });
                    setEditing(true);
                    setMessage("");
                    setError("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <UserRound size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-sm text-slate-500">
                Your basic account details
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    name="name"
                    value={editing ? form.name : user.name || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:text-slate-600"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-3 text-sm text-slate-500"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Email change karne ke liye separate verification flow rakhein.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    name="phone"
                    value={editing ? form.phone : user.phone || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:text-slate-600"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Account Role
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={17}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    value={user.role || "customer"}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-3 text-sm capitalize text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Member Since
                </label>
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Not available"
                    }
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-3 text-sm text-slate-500"
                  />
                </div>
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: user.name || "",
                      phone: user.phone || "",
                    });
                    setError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Change password */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <LockKeyhole size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Change Password
              </h2>
              <p className="text-sm text-slate-500">
                Apne account ko secure rakhein
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

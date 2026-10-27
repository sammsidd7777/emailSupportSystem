
import { useEffect, useMemo, useState } from "react";
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
  KeyRound,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  UserCircle,
  Sparkles,
} from "lucide-react";

import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateEmailMutation,
  useVerifyEmailOtpMutation,
  useChangePasswordMutation,
} from "../../services/RTK/userApi";

// Normalize different API response formats
const normalizeUser = (payload) => {
  const raw =
    payload?.user ||
    payload?.data?.user ||
    payload?.data ||
    payload ||
    {};

  return {
    id: raw._id || raw.id || "",
    name: raw.Name ?? raw.name ?? "",
    email: raw.Email ?? raw.email ?? "",
    phone: raw.Phone ?? raw.phone ?? "",
    role: raw.Role ?? raw.role ?? "customer",
    createdAt: raw.createdAt || raw.created_at || "",
  };
};

const getErrorMessage = (error, fallback) =>
  error?.data?.message ||
  error?.data?.error ||
  error?.error ||
  error?.message ||
  fallback;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-2 block text-sm font-medium text-zinc-300";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-amber-400/30 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "rounded-3xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/10 sm:p-7";

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-300">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  className = "",
  children,
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3 top-3.5 text-amber-400"
          />
        )}
        {children}
      </div>
    </div>
  );
}

export default function UserProfile() {
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch,
  } = useGetProfileQuery();

  const [updateProfile, { isLoading: isSavingProfile }] =
    useUpdateProfileMutation();

  const [updateEmail, { isLoading: isRequestingOtp }] =
    useUpdateEmailMutation();

  const [verifyEmailOtp, { isLoading: isVerifyingOtp }] =
    useVerifyEmailOtpMutation();

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const user = useMemo(
    () => normalizeUser(profileResponse),
    [profileResponse]
  );

  useEffect(() => {
    if (!profileResponse) return;

    setForm({
      name: user.name,
      phone: String(user.phone ?? ""),
    });
  }, [profileResponse, user.name, user.phone]);

  const initials = (user.name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const showError = (err, fallback) => {
    setError(getErrorMessage(err, fallback));
  };

  // Update profile details
  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    clearAlerts();

    const cleanName = form.name.trim();
    const cleanPhone = form.phone.trim();

    if (!cleanName || !cleanPhone) {
      setError("Please enter your name and phone number.");
      return;
    }

    try {
      const result = await updateProfile({
        name: cleanName,
        phone: cleanPhone,
        Name: cleanName,
        Phone: cleanPhone,
      }).unwrap();

      setMessage(result?.message || "Profile updated successfully.");
      setEditing(false);
      await refetch();
    } catch (err) {
      showError(err, "Could not update your profile.");
    }
  };

  // Request email change OTP
  const handleRequestEmailOtp = async (event) => {
    event.preventDefault();
    clearAlerts();

    const newEmail = emailForm.newEmail.trim().toLowerCase();

    if (newEmail === user.email.trim().toLowerCase()) {
      setError("Enter an email address different from your current email.");
      return;
    }

    if (!newEmail || !emailForm.password) {
      setError("Enter your new email and current password.");
      return;
    }

    try {
      const result = await updateEmail({
        newEmail,
        password: emailForm.password,
      }).unwrap();

      setOtpSent(true);
      setOtp("");
      setMessage(
        result?.message || "Verification OTP sent to your new email."
      );
    } catch (err) {
      showError(err, "Could not send the verification code.");
    }
  };

  // Verify email OTP
  const handleVerifyEmailOtp = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP sent to your new email.");
      return;
    }

    try {
      const result = await verifyEmailOtp({ otp }).unwrap();

      setMessage(result?.message || "Email updated successfully.");
      setOtpSent(false);
      setOtp("");
      setEmailForm({ newEmail: "", password: "" });

      await refetch();
    } catch (err) {
      showError(err, "OTP verification failed.");
    }
  };

  // Change password
  const handleChangePassword = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      setError("Your new password must differ from the current password.");
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(result?.message || "Password changed successfully.");
    } catch (err) {
      showError(err, "Could not change your password.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Not available";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#090909] text-amber-300">
        <div className="flex items-center gap-3 text-sm">
          <RefreshCw size={19} className="animate-spin" />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (profileError && !profileResponse) {
    return (
      <main className="min-h-screen bg-[#090909] px-4 py-10 text-zinc-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-400/20 bg-[#111111] p-6">
          <div className="flex items-center gap-3 text-red-300">
            <AlertCircle size={22} />
            <h2 className="text-lg font-bold">Could not load profile</h2>
          </div>

          <p className="mt-3 text-sm text-zinc-400">
            {getErrorMessage(
              profileError,
              "Please sign in and try again."
            )}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className={`${primaryButton} mt-5`}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page heading */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-amber-400">
              <Sparkles size={14} />
              BitMax / Account
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Manage your personal information and account security.
            </p>
          </div>

          {isProfileFetching && (
            <span className="flex items-center gap-2 text-xs text-amber-300">
              <RefreshCw size={13} className="animate-spin" />
              Refreshing profile...
            </span>
          )}
        </header>

        {/* Success message */}
        {message && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{message}</p>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="ml-auto text-emerald-300/70 hover:text-emerald-200"
              aria-label="Dismiss success message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-300/70 hover:text-red-200"
              aria-label="Dismiss error message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Profile header */}
        <section className="overflow-hidden rounded-3xl border border-amber-400/15 bg-[#111111] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="relative h-32 bg-gradient-to-r from-[#241900] via-[#8b650c] to-[#e8bd4b] sm:h-40">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-[#111111] bg-[#1a160b] text-2xl font-black text-amber-300 shadow-lg sm:h-28 sm:w-28">
                  {initials || <UserCircle size={40} />}
                </div>

                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
                    {user.name || "Your Name"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-zinc-400">
                    {user.email || "Email not available"}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold capitalize text-amber-300">
                    <ShieldCheck size={14} />
                    {user.role}
                  </span>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      name: user.name,
                      phone: String(user.phone ?? ""),
                    });
                    setEditing(true);
                    clearAlerts();
                  }}
                  className={primaryButton}
                >
                  <Pencil size={16} />
                  Edit profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className={cardClass}>
          <SectionHeading
            icon={UserRound}
            title="Personal information"
            description="Your basic account details"
          />

          <form onSubmit={handleUpdateProfile}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full name" icon={UserRound}>
                <input
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  disabled={!editing}
                  required
                  maxLength={100}
                  className={`${inputClass} pl-10`}
                  placeholder="Enter your name"
                />
              </FormField>

              <FormField label="Email address" icon={Mail}>
                <input
                  type="email"
                  autoComplete="email"
                  value={user.email}
                  disabled
                  className={`${inputClass} pl-10`}
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Change your email using the verification section below.
                </p>
              </FormField>

              <FormField label="Phone number" icon={Phone}>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  disabled={!editing}
                  required
                  maxLength={20}
                  className={`${inputClass} pl-10`}
                  placeholder="Enter phone number"
                />
              </FormField>

              <FormField label="Account role" icon={ShieldCheck}>
                <input
                  value={user.role}
                  disabled
                  className={`${inputClass} pl-10 capitalize`}
                />
              </FormField>

              <FormField label="Member since" icon={CalendarDays}>
                <input
                  value={formatDate(user.createdAt)}
                  disabled
                  className={`${inputClass} pl-10`}
                />
              </FormField>
            </div>

            {editing && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: user.name,
                      phone: String(user.phone ?? ""),
                    });
                    clearAlerts();
                  }}
                  className={secondaryButton}
                  disabled={isSavingProfile}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={primaryButton}
                >
                  {isSavingProfile ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSavingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Change email */}
        <section className={cardClass}>
          <SectionHeading
            icon={Mail}
            title="Change email address"
            description="Verify your new email address using a one-time password."
          />

          {!otpSent ? (
            <form
              onSubmit={handleRequestEmailOtp}
              className="grid gap-5 sm:grid-cols-2"
            >
              <FormField label="New email address">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={emailForm.newEmail}
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      newEmail: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </FormField>

              <FormField label="Current password">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={emailForm.password}
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      password: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Confirm your password"
                />
              </FormField>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isRequestingOtp}
                  className={primaryButton}
                >
                  {isRequestingOtp ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {isRequestingOtp ? "Sending OTP..." : "Send verification OTP"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyEmailOtp}
              className="max-w-xl space-y-5"
            >
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-zinc-300">
                Enter the 6-digit verification code sent to{" "}
                <span className="break-all font-semibold text-amber-300">
                  {emailForm.newEmail}
                </span>
                .
              </div>

              <FormField label="6-digit OTP">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={`${inputClass} max-w-xs text-center text-xl tracking-[0.45em]`}
                  placeholder="000000"
                />
              </FormField>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className={primaryButton}
                >
                  {isVerifyingOtp ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {isVerifyingOtp ? "Verifying..." : "Verify and update email"}
                </button>

                <button
                  type="button"
                  onClick={handleRequestEmailOtp}
                  disabled={isRequestingOtp}
                  className={secondaryButton}
                >
                  <RefreshCw
                    size={16}
                    className={isRequestingOtp ? "animate-spin" : ""}
                  />
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    clearAlerts();
                  }}
                  className={secondaryButton}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Change password */}
        <section className={cardClass}>
          <SectionHeading
            icon={LockKeyhole}
            title="Change password"
            description="Use a strong password with at least 8 characters."
          />

          <form onSubmit={handleChangePassword}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Current password">
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
                  className={inputClass}
                  placeholder="Current password"
                />
              </FormField>

              <FormField label="New password">
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
                  className={inputClass}
                  placeholder="At least 8 characters"
                />
              </FormField>

              <FormField label="Confirm new password">
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
                  className={inputClass}
                  placeholder="Repeat new password"
                />
              </FormField>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className={primaryButton}
              >
                {isChangingPassword ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <KeyRound size={16} />
                )}
                {isChangingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>

        <footer className="pb-4 text-center text-xs text-zinc-600">
          BitMax Support System · Keep your account information up to date.
        </footer>
      </div>
    </main>
  );
}

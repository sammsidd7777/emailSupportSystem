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
} from "lucide-react";

import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUpdateEmailMutation,
  useVerifyEmailOtpMutation,
  useChangePasswordMutation,
} from "../../services/RTK/userApi";

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
  error?.error ||
  error?.message ||
  fallback;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
  "mb-2 block text-sm font-medium text-zinc-300";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50";

export default function UserProfile() {
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch,
  } = useGetMyProfileQuery();

  const [
    updateProfile,
    { isLoading: isSavingProfile },
  ] = useUpdateProfileMutation();

  const [
    updateEmail,
    { isLoading: isRequestingOtp },
  ] = useUpdateEmailMutation();

  const [
    verifyEmailOtp,
    { isLoading: isVerifyingOtp },
  ] = useVerifyEmailOtpMutation();

  const [
    changePassword,
    { isLoading: isChangingPassword },
  ] = useChangePasswordMutation();

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
    if (profileResponse) {
      setForm({
        name: user.name,
        phone: String(user.phone ?? ""),
      });
    }
  }, [
    profileResponse,
    user.name,
    user.phone,
    user.email,
  ]);

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

  // Update profile
  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    clearAlerts();

    try {
      const cleanName = form.name.trim();
      const cleanPhone = form.phone.trim();

      const result = await updateProfile({
        name: cleanName,
        phone: cleanPhone,
        Name: cleanName,
        Phone: cleanPhone,
      }).unwrap();

      setMessage(
        result?.message ||
          "Profile updated successfully."
      );

      setEditing(false);
      await refetch();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not update your profile."
        )
      );
    }
  };

  // Request email OTP
  const handleRequestEmailOtp = async (event) => {
    event.preventDefault();
    clearAlerts();

    const newEmail = emailForm.newEmail
      .trim()
      .toLowerCase();

    if (
      newEmail === user.email.trim().toLowerCase()
    ) {
      setError(
        "Please enter an email different from your current email."
      );
      return;
    }

    if (!newEmail || !emailForm.password) {
      setError(
        "Enter your new email and current password."
      );
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
        result?.message ||
          "OTP sent to your new email address."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not send the verification code."
        )
      );
    }
  };

  // Verify email OTP
  const handleVerifyEmailOtp = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Enter the 6-digit OTP sent to your new email."
      );
      return;
    }

    try {
      const result = await verifyEmailOtp({
        otp,
      }).unwrap();

      setMessage(
        result?.message ||
          "Email updated successfully."
      );

      setOtpSent(false);
      setOtp("");

      setEmailForm({
        newEmail: "",
        password: "",
      });

      await refetch();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "OTP verification failed."
        )
      );
    }
  };

  // Change password
  const handleChangePassword = async (event) => {
    event.preventDefault();
    clearAlerts();

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      const result = await changePassword({
        currentPassword:
          passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        result?.message ||
          "Password changed successfully."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not change your password."
        )
      );
    }
  };

    // Loading screen
  if (isProfileLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center bg-[#090909] text-amber-300">
        <div className="flex items-center gap-3 text-sm">
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Loading your profile...
        </div>
      </div>
    );
  }

  // Error screen
  if (profileError && !profileResponse) {
    return (
      <div className="min-h-screen bg-[#090909] p-6 text-zinc-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
          <h2 className="text-lg font-bold text-red-300">
            Could not load profile
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {getErrorMessage(
              profileError,
              "Please sign in and try again."
            )}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className={`${primaryButton} mt-4`}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Page Heading */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-400">
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
            <span className="text-xs text-amber-300">
              Refreshing profile...
            </span>
          )}
        </header>

        {/* Success Message */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
          >
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Profile Header Card */}
        <section className="overflow-hidden rounded-3xl border border-amber-400/15 bg-[#111111] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">

          <div className="h-32 bg-gradient-to-r from-[#332300] via-[#9a6d08] to-[#e6b83f] sm:h-40" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                {/* Avatar */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-[#111111] bg-[#1a160b] text-2xl font-black text-amber-300 shadow-lg sm:h-28 sm:w-28">
                  {initials || "U"}
                </div>

                {/* User Details */}
                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-xl font-bold text-white">
                    {user.name || "Your Name"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-zinc-400">
                    {user.email || "Email not available"}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold capitalize text-amber-300">
                    <ShieldCheck size={14} />
                    {user.role || "customer"}
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

        {/* Personal Information */}
        <section className="rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-7">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-300">
              <UserRound size={21} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your basic account details
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid gap-5 sm:grid-cols-2">

              {/* Full Name */}
              <div>
                <label className={labelClass}>
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3.5 text-amber-400"
                  />

                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    disabled={!editing}
                    required
                    className={`${inputClass} pl-10`}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-3.5 text-amber-400"
                  />

                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Use the email verification section below
                  to change your email.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>
                  Phone number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-3.5 text-amber-400"
                  />

                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    disabled={!editing}
                    required
                    className={`${inputClass} pl-10`}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className={labelClass}>
                  Account role
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={17}
                    className="absolute left-3 top-3.5 text-amber-400"
                  />

                  <input
                    value={user.role}
                    disabled
                    className={`${inputClass} pl-10 capitalize`}
                  />
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className={labelClass}>
                  Member since
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-3.5 text-amber-400"
                  />

                  <input
                    value={
                      user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not available"
                    }
                    disabled
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Edit Buttons */}
            {editing && (
              <div className="mt-6 flex justify-end gap-3">

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
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={primaryButton}
                >
                  <Save size={16} />

                  {isSavingProfile
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            )}
          </form>
        </section>
        ```jsx
        {/* Change Email */}
        <section className="rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-300">
              <Mail size={21} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Change email address
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Confirm your password, then verify the new email with an OTP.
              </p>
            </div>
          </div>

          {!otpSent ? (
            <form
              onSubmit={handleRequestEmailOtp}
              className="grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label className={labelClass}>New email address</label>
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
              </div>

              <div>
                <label className={labelClass}>Current password</label>
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
                  placeholder="Enter current password"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isRequestingOtp}
                  className={primaryButton}
                >
                  <Mail size={16} />
                  {isRequestingOtp
                    ? "Sending OTP..."
                    : "Send verification OTP"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyEmailOtp}
              className="max-w-xl space-y-5"
            >
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-zinc-300">
                A 6-digit verification code was sent to{" "}
                <span className="font-semibold text-amber-300">
                  {emailForm.newEmail}
                </span>
                . Enter it below. The code expires in 5 minutes.
              </div>

              <div>
                <label className={labelClass}>6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  className={`${inputClass} max-w-xs text-center text-xl tracking-[0.45em]`}
                  placeholder="000000"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className={primaryButton}
                >
                  <CheckCircle2 size={16} />
                  {isVerifyingOtp
                    ? "Verifying..."
                    : "Verify and update email"}
                </button>

                <button
                  type="button"
                  disabled={isRequestingOtp}
                  onClick={handleRequestEmailOtp}
                  className={secondaryButton}
                >
                  <RefreshCw size={16} />
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

        {/* Change Password */}
        <section className="rounded-3xl border border-white/10 bg-[#111111] p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-300">
              <LockKeyhole size={21} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Change password
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Choose a strong password with at least 8 characters.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Current password
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
                  className={inputClass}
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className={labelClass}>New password</label>
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
              </div>

              <div>
                <label className={labelClass}>
                  Confirm new password
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
                  className={inputClass}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className={primaryButton}
              >
                <KeyRound size={16} />
                {isChangingPassword
                  ? "Updating..."
                  : "Update password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

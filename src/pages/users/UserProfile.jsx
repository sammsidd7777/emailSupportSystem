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
  Crown,
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
  const raw = payload?.user || payload?.data?.user || payload?.data || payload || {};

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

/* ---------- Design tokens: black + gold ---------- */
const inputClass =
  "w-full rounded-lg border border-[#d4af37]/15 bg-black px-4 py-3 text-sm text-[#f3ead2] placeholder:text-[#6f6652] outline-none transition focus:border-[#d4af37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] disabled:cursor-not-allowed disabled:border-white/5 disabled:text-[#8d8570]";

const labelClass = "mb-2 block text-[13px] font-medium text-[#b8ab88]";

const primaryButton =
  "bm-gold-bg inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-black transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5e6a8] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#d4af37]/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-[#e9d9a6] transition hover:bg-[#d4af37]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50";

const panelClass =
  "rounded-2xl border border-[#d4af37]/15 bg-[#0a0907] p-6 sm:p-8";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
.bm-root{font-family:'Manrope',system-ui,sans-serif}
.bm-display{font-family:'Cormorant Garamond',Georgia,serif;letter-spacing:.01em}
.bm-gold-bg{background:linear-gradient(135deg,#f5e6a8 0%,#d4af37 45%,#9a7420 100%)}
.bm-gold-text{background:linear-gradient(135deg,#f9efc2,#d4af37 55%,#b58a24);-webkit-background-clip:text;background-clip:text;color:transparent}
.bm-foil{background:linear-gradient(135deg,rgba(245,230,168,.9),rgba(212,175,55,.35) 40%,rgba(154,116,32,.8))}
.bm-grain{background-image:radial-gradient(circle at 20% 0%,rgba(212,175,55,.18),transparent 55%),radial-gradient(circle at 100% 100%,rgba(212,175,55,.08),transparent 50%)}
@keyframes bm-shine{from{transform:translateX(-120%)}to{transform:translateX(220%)}}
.bm-shine{animation:bm-shine 1.6s ease-out .3s 1 both}
@media (prefers-reduced-motion:reduce){.bm-shine{animation:none}}
`;

function FormField({ label, icon: Icon, className = "", children }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-[#d4af37]" />
        )}
        {children}
      </div>
    </div>
  );
}

function PanelHeading({ title, description }) {
  return (
    <div className="mb-7 border-b border-[#d4af37]/10 pb-5">
      <h2 className="bm-display text-2xl font-semibold text-[#f6eccb]">{title}</h2>
      <p className="mt-1 text-sm text-[#8d8570]">{description}</p>
    </div>
  );
}

const TABS = [
  { id: "profile", label: "Personal details", icon: UserRound },
  { id: "email", label: "Email", icon: Mail },
  { id: "security", label: "Password", icon: LockKeyhole },
];

export default function UserProfile() {
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch,
  } = useGetProfileQuery();

  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [updateEmail, { isLoading: isRequestingOtp }] = useUpdateEmailMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingOtp }] = useVerifyEmailOtpMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", phone: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const user = useMemo(() => normalizeUser(profileResponse), [profileResponse]);

  useEffect(() => {
    if (!profileResponse) return;
    setForm({ name: user.name, phone: String(user.phone ?? "") });
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

  const showError = (err, fallback) => setError(getErrorMessage(err, fallback));

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
      setMessage(result?.message || "Verification OTP sent to your new email.");
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

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError("Your new password must differ from the current password.");
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

  const startEditing = () => {
    setForm({ name: user.name, phone: String(user.phone ?? "") });
    setEditing(true);
    clearAlerts();
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm({ name: user.name, phone: String(user.phone ?? "") });
    clearAlerts();
  };

  if (isProfileLoading) {
    return (
      <div className="bm-root flex min-h-[60vh] items-center justify-center bg-black text-[#d4af37]">
        <style>{styles}</style>
        <div className="flex items-center gap-3 text-sm">
          <RefreshCw size={18} className="animate-spin" />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (profileError && !profileResponse) {
    return (
      <main className="bm-root min-h-screen bg-black px-4 py-10 text-[#f3ead2]">
        <style>{styles}</style>
        <div className="mx-auto max-w-xl rounded-2xl border border-red-400/25 bg-[#0a0907] p-6">
          <div className="flex items-center gap-3 text-red-300">
            <AlertCircle size={22} />
            <h2 className="bm-display text-2xl font-semibold">Could not load profile</h2>
          </div>
          <p className="mt-3 text-sm text-[#a69c80]">
            {getErrorMessage(profileError, "Please sign in and try again.")}
          </p>
          <button type="button" onClick={() => refetch()} className={`${primaryButton} mt-5`}>
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bm-root text-[#f3ead2]">
      <style>{styles}</style>

      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        

          {isProfileFetching && (
            <span className="flex items-center gap-2 text-xs text-[#d4af37]">
              <RefreshCw size={13} className="animate-spin" />
              Refreshing...
            </span>
          )}
        </header>

        {/* Alerts */}
        {message && (
          <div
            role="status"
            className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
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

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-lg border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
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

        <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* Membership card */}
          <aside className="lg:sticky lg:top-6">
            <div className="bm-foil rounded-3xl p-px">
              <div className="relative overflow-hidden rounded-[23px] bg-gradient-to-br from-[#15110a] via-black to-[#0d0a04] p-7">
                <div className="bm-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#f5e6a8]/15 to-transparent" />

                <div className="flex items-start justify-between">
                  <span className="bm-display bm-gold-text text-2xl font-bold">BitMax</span>
                  <Crown size={22} className="text-[#d4af37]" />
                </div>

                <div className="mt-10 flex h-24 w-24 items-center justify-center rounded-full bm-foil p-[2px]">
                  <div className="bm-display flex h-full w-full items-center justify-center rounded-full bg-black text-4xl font-bold text-[#f0d77a]">
                    {initials}
                  </div>
                </div>

                <h2 className="bm-display mt-6 break-words text-3xl font-semibold leading-tight text-[#fbf3d6]">
                  {user.name || "Your name"}
                </h2>
                <p className="mt-1 break-all text-sm text-[#a69c80]">
                  {user.email || "Email not available"}
                </p>

                <div className="mt-8 flex items-end justify-between border-t border-[#d4af37]/20 pt-5">
                  <div>
                    <p className="text-xs text-[#8d8570]">Member since</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#f0d77a]">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs font-semibold capitalize text-[#f0d77a]">
                    <ShieldCheck size={13} />
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {/* Tabs */}
            <nav
              role="tablist"
              aria-label="Account sections"
              className="mb-5 flex gap-1 overflow-x-auto border-b border-[#d4af37]/15"
            >
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => {
                      setTab(id);
                      clearAlerts();
                    }}
                    className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4af37] ${
                      active
                        ? "border-[#d4af37] text-[#f0d77a]"
                        : "border-transparent text-[#8d8570] hover:text-[#e9d9a6]"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Personal details */}
            {tab === "profile" && (
              <section className={panelClass}>
                <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-[#d4af37]/10 pb-5">
                  <div>
                    <h2 className="bm-display text-2xl font-semibold text-[#f6eccb]">
                      Personal details
                    </h2>
                    <p className="mt-1 text-sm text-[#8d8570]">
                      The name and phone number on your account.
                    </p>
                  </div>

                  {!editing && (
                    <button type="button" onClick={startEditing} className={primaryButton}>
                      <Pencil size={16} />
                      Edit profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Full name" icon={UserRound}>
                      <input
                        name="name"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={!editing}
                        required
                        maxLength={100}
                        className={`${inputClass} pl-10`}
                        placeholder="Enter your name"
                      />
                    </FormField>

                    <FormField label="Phone number" icon={Phone}>
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={!editing}
                        required
                        maxLength={20}
                        className={`${inputClass} pl-10`}
                        placeholder="Enter phone number"
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
                      <p className="mt-2 text-xs text-[#6f6652]">
                        To change it, use the Email tab.
                      </p>
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
                    <div className="mt-8 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className={secondaryButton}
                        disabled={isSavingProfile}
                      >
                        <X size={16} />
                        Cancel
                      </button>

                      <button type="submit" disabled={isSavingProfile} className={primaryButton}>
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
            )}

            {/* Change email */}
            {tab === "email" && (
              <section className={panelClass}>
                <PanelHeading
                  title="Change email address"
                  description="We'll send a one-time password to your new email to confirm it."
                />

                {!otpSent ? (
                  <form onSubmit={handleRequestEmailOtp} className="grid gap-5 sm:grid-cols-2">
                    <FormField label="New email address">
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={emailForm.newEmail}
                        onChange={(e) =>
                          setEmailForm({ ...emailForm, newEmail: e.target.value })
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
                          setEmailForm({ ...emailForm, password: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Confirm your password"
                      />
                    </FormField>

                    <div className="sm:col-span-2">
                      <button type="submit" disabled={isRequestingOtp} className={primaryButton}>
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
                  <form onSubmit={handleVerifyEmailOtp} className="max-w-xl space-y-5">
                    <div className="rounded-lg border border-[#d4af37]/25 bg-[#d4af37]/5 p-4 text-sm text-[#d9cba2]">
                      Enter the 6-digit code sent to{" "}
                      <span className="break-all font-semibold text-[#f0d77a]">
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
                        <RefreshCw size={16} className={isRequestingOtp ? "animate-spin" : ""} />
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
            )}

            {/* Change password */}
            {tab === "security" && (
              <section className={panelClass}>
                <PanelHeading
                  title="Change password"
                  description="Use at least 8 characters, and a password you don't use elsewhere."
                />

                <form onSubmit={handleChangePassword}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Current password" className="sm:col-span-2">
                      <input
                        type="password"
                        autoComplete="current-password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
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
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
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
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Repeat new password"
                      />
                    </FormField>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={isChangingPassword} className={primaryButton}>
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
            )}
          </div>
        </div>

        <footer className="mt-10 pb-4 text-center text-xs text-[#6f6652]">
          BitMax Support System. Keep your account information up to date.
        </footer>
      </div>
    </main>
  );
}
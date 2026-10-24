import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useRegistationMutation,
  useLoginMutation,
  useLoginWithOtpMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../services/RTK/authApi";

import {
  Headphones,
  Mail,
  LockKeyhole,
  UserRound,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../services/authSlice";

const initialValues = {
  Name: "",
  Email: "",
  Phone: "",
  Password: "",
  confirmPassword: "",
  Otp: "",
};

/* Change the brand name here if needed */
const BRAND = "BITMAX";
const BRAND_NAME = "BitMax";

/* ---------- Logo (inline SVG, no image file needed) ---------- */
function LogoMark({ size = 44, uid = "bm" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-g`} x1="6" y1="4" x2="42" y2="44">
          <stop offset="0" stopColor="#fdeaa8" />
          <stop offset="0.5" stopColor="#e5b84b" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 42 13.5v21L24 45 6 34.5v-21L24 3Z"
        fill={`url(#${uid}-g)`}
        fillOpacity="0.14"
        stroke={`url(#${uid}-g)`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18 14v20m0-20h6.5a5 5 0 0 1 0 10H18m0 0h7.5a5 5 0 0 1 0 10H18"
        stroke={`url(#${uid}-g)`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo({ size = 44, uid = "bm" }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} uid={uid} />
      <div className="leading-none">
        <div className="bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-xl font-semibold tracking-[0.22em] text-transparent">
          {BRAND}
        </div>
        <div className="mt-1.5 text-[11px] tracking-[0.12em] text-amber-100/50">
          Customer support portal
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMode = searchParams.get("mode");
  const [section, setSection] = useState(
    ["register", "forgot", "reset"].includes(initialMode)
      ? initialMode
      : "login",
  );

  const [loginMode, setLoginMode] = useState("password");
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [registerUser, registerState] = useRegistationMutation();
  const [loginUser, loginState] = useLoginMutation();
  const [loginOtp, loginOtpState] = useLoginWithOtpMutation();
  const [sendOtp, sendOtpState] = useSendOtpMutation();
  const [verifyOtp, verifyOtpState] = useVerifyOtpMutation();
  const [forgotPassword, forgotState] = useForgotPasswordMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();

  const dispatch = useDispatch();

  const busy =
    registerState.isLoading ||
    loginState.isLoading ||
    loginOtpState.isLoading ||
    sendOtpState.isLoading ||
    verifyOtpState.isLoading ||
    forgotState.isLoading ||
    resetState.isLoading;

  const update = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setMessage("");
  };

  const switchSection = (next) => {
    setSection(next);
    setSearchParams(next === "login" ? {} : { mode: next });
    setError("");
    setMessage("");
  };

  const handleError = (err) => {
    setError(
      err?.data?.message ||
        err?.data?.error ||
        "Something went wrong. Please try again.",
    );
  };

  const goToDashboard = (res) => {
    // Adjust these keys to match your actual login response.
    const user = res?.user || res?.data?.user;
    const role = String(user?.role || user?.Role || "").toLowerCase();

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "supportagent" || role === "support_agent") {
      navigate("/agent/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (section === "register") {
        if (values.Password.length < 8) {
          setError("Password must contain at least 8 characters.");
          return;
        }

        if (values.Password !== values.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const { confirmPassword, Otp, ...payload } = values;
        const res = await registerUser(payload).unwrap();

        setMessage(res?.message || "Registration successful.");
        setValues(initialValues);
        switchSection("login");
        return;
      }

      if (section === "login" && loginMode === "password") {
        const res = await loginUser({
          Email: values.Email,
          Password: values.Password,
        }).unwrap();

        const user = res?.user || res?.data?.user;

        if (!user) {
          throw new Error("User details not found in login response");
        }

        dispatch(loginSuccess(user));
        goToDashboard(res);
        return;
      }

      if (section === "login" && loginMode === "otp") {
        const res = await loginOtp({
          Email: values.Email,
          Otp: values.Otp,
        }).unwrap();

        const user = res?.user || res?.data?.user;

        if (!user) {
          throw new Error("User details not found in login response");
        }

        dispatch(loginSuccess(user));

        goToDashboard(res);
        return;
      }

      if (section === "forgot") {
        const res = await forgotPassword({
          Email: values.Email,
        }).unwrap();

        setMessage(
          res?.message ||
            "If the account exists, reset instructions have been sent.",
        );
        setSection("reset");
        setSearchParams({ mode: "reset" });
        return;
      }

      if (section === "reset") {
        if (values.Password.length < 8) {
          setError("Password must contain at least 8 characters.");
          return;
        }

        if (values.Password !== values.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        // Verify OTP for password reset.
        await verifyOtp({
          Email: values.Email,
          Otp: values.Otp,
          purpose: "reset-password",
        }).unwrap();

        const res = await resetPassword({
          Email: values.Email,
          Otp: values.Otp,
          Password: values.Password,
        }).unwrap();

        setValues(initialValues);
        setMessage(res?.message || "Password reset successfully.");
        switchSection("login");
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!values.Email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      const res = await sendOtp({
        Email: values.Email,
        purpose: "login",
      }).unwrap();

      setMessage(res?.message || "OTP sent. Please check your email.");
    } catch (err) {
      handleError(err);
    }
  };

  /* ---------- Shared styles ---------- */
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/35 outline-none transition duration-300 hover:border-white/20 focus:border-amber-300/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-amber-300/10";

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45";

  const pillClass = (active) =>
    `rounded-full border px-4 py-2 text-xs font-semibold transition ${
      active
        ? "border-amber-300/40 bg-amber-300/10 text-amber-100 shadow-[inset_0_1px_0_rgba(253,234,168,0.2)]"
        : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/10 hover:text-white"
    }`;

  const field = (name, placeholder, Icon, type = "text") => (
    <div className="relative">
      <Icon size={17} className={iconClass} />
      <input
        name={name}
        type={type}
        value={values[name]}
        onChange={update}
        placeholder={placeholder}
        required
        autoComplete={
          name === "Email"
            ? "email"
            : name === "Phone"
              ? "tel"
              : name === "Name"
                ? "name"
                : "off"
        }
        className={inputClass}
      />
    </div>
  );

  const passwordField = (name, placeholder) => (
    <div className="relative">
      <LockKeyhole size={17} className={iconClass} />
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        value={values[name]}
        onChange={update}
        placeholder={placeholder}
        required
        minLength={8}
        autoComplete="new-password"
        className={inputClass}
      />
      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-amber-200"
      >
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );

  const titles = {
    register: ["Create account", `Join ${BRAND_NAME} support in a few steps.`],
    login: ["Welcome back", "Sign in to continue to your dashboard."],
    forgot: ["Forgot password?", "Enter your registered email address."],
    reset: ["Reset password", "Verify your OTP and create a new password."],
  };

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto bg-[#070605] text-white">
      {/* Component-scoped animation */}
      <style>{`
        @keyframes bm-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes bm-drift { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(40px,-30px) scale(1.08) } }
        .bm-float { animation: bm-float 7s ease-in-out infinite; }
        .bm-drift { animation: bm-drift 16s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .bm-float, .bm-drift { animation: none; } }
      `}</style>

      {/* Company-style background (stays fixed while the form scrolls) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="bm-drift absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-amber-600/25 blur-[130px]" />
        <div
          className="bm-drift absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-yellow-500/15 blur-[140px]"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="bm-drift absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-700/15 blur-[130px]"
          style={{ animationDelay: "-11s" }}
        />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f5d78a 1px, transparent 1px), linear-gradient(to bottom, #f5d78a 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="absolute -right-24 top-10 hidden opacity-[0.05] lg:block">
          <LogoMark size={420} uid="bm-w1" />
        </div>
        <div className="absolute -left-20 bottom-0 hidden opacity-[0.04] lg:block">
          <LogoMark size={320} uid="bm-w2" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,6,5,0.88)_100%)]" />
      </div>

      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-5">
        {/* Dark glass card */}
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-amber-200/15 bg-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(253,234,168,0.12)] backdrop-blur-2xl md:grid-cols-[0.9fr_1.1fr]">
          {/* Branding panel */}
          <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-amber-200/10 bg-gradient-to-br from-amber-200/[0.06] to-transparent p-8 md:flex">
            <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-10 -top-6 h-48 w-48 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

            <div className="relative">
              <Logo uid="bm-d" />
            </div>

            <div className="relative py-8">
              <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-white">
                Every issue deserves a solution.
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/60">
                Raise support tickets, follow updates, and manage every
                conversation from one simple workspace.
              </p>

              {/* Product preview card */}
              <div className="bm-float mt-7 rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-amber-200">
                    <Headphones size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        Payment not reflecting
                      </p>
                      <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        <ShieldCheck size={10} />
                        Resolved
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                      <Mail size={12} />
                      Updated moments ago by your support agent
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3.5 text-sm text-white/65">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={17} className="text-amber-300" />
                  Secure account access
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={17} className="text-yellow-200" />
                  Email notifications
                </div>
                <div className="flex items-center gap-3">
                  <KeyRound size={17} className="text-amber-400" />
                  Password and OTP options
                </div>
              </div>
            </div>

            <p className="relative text-xs tracking-wide text-white/40">
              Secure · Simple · Organized
            </p>
          </aside>

          {/* Auth form panel */}
          <section className="bg-black/25 p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="md:hidden">
                <Logo size={38} uid="bm-m" />
              </div>

              {(section === "forgot" || section === "reset") && (
                <button
                  type="button"
                  onClick={() => switchSection("login")}
                  className="ml-auto flex items-center gap-1 text-xs font-semibold text-white/55 transition hover:text-amber-200"
                >
                  <ChevronLeft size={15} />
                  Back to login
                </button>
              )}
            </div>

            {/* Login / Register toggle */}
            {(section === "login" || section === "register") && (
              <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5">
                {["login", "register"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchSection(item)}
                    className={`rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
                      section === item
                        ? "border border-amber-300/40 bg-amber-300/10 text-amber-100 shadow-[inset_0_1px_0_rgba(253,234,168,0.2)]"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item === "login" ? "Login" : "Register"}
                  </button>
                ))}
              </div>
            )}

            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {titles[section][0]}
            </h2>

            <p className="mb-6 mt-2 text-sm leading-6 text-white/55">
              {titles[section][1]}
            </p>

            {/* Login method toggle */}
            {section === "login" && (
              <div className="mb-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("password");
                    setError("");
                    setMessage("");
                  }}
                  className={pillClass(loginMode === "password")}
                >
                  Password login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("otp");
                    setError("");
                    setMessage("");
                  }}
                  className={pillClass(loginMode === "otp")}
                >
                  Login with OTP
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {section === "register" && (
                <>
                  {field("Name", "Full name", UserRound)}
                  {field("Email", "Email address", Mail, "email")}
                  {field("Phone", "10-digit phone number", Phone, "tel")}
                  {passwordField("Password", "Create password (8+ characters)")}
                  {passwordField("confirmPassword", "Confirm password")}
                </>
              )}

              {section === "login" && loginMode === "password" && (
                <>
                  {field("Email", "Email address", Mail, "email")}
                  {passwordField("Password", "Enter your password")}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchSection("forgot")}
                      className="text-xs font-medium text-white/55 transition hover:text-amber-200 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              )}

              {section === "login" && loginMode === "otp" && (
                <>
                  {field("Email", "Registered email address", Mail, "email")}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={busy}
                    className="w-full rounded-xl border border-amber-300/30 bg-amber-300/[0.06] py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:opacity-50"
                  >
                    {sendOtpState.isLoading ? "Sending OTP..." : "Send login OTP"}
                  </button>

                  {field("Otp", "Enter the OTP", ShieldCheck)}
                </>
              )}

              {section === "forgot" && (
                <>
                  {field("Email", "Registered email address", Mail, "email")}

                  <p className="text-xs leading-5 text-white/50">
                    We'll send reset instructions if an account matches this
                    email.
                  </p>
                </>
              )}

              {section === "reset" && (
                <>
                  {field("Email", "Registered email address", Mail, "email")}
                  {field("Otp", "Password reset OTP", ShieldCheck)}
                  {passwordField("Password", "New password (8+ characters)")}
                  {passwordField("confirmPassword", "Confirm new password")}
                </>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-xs text-emerald-200"
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 py-3.5 text-sm font-bold text-neutral-950 shadow-[0_10px_30px_rgba(217,160,40,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_40px_rgba(217,160,40,0.5),inset_0_1px_0_rgba(255,255,255,0.6)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {busy ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {section === "register" && "Create account"}
                    {section === "login" &&
                      (loginMode === "otp" ? "Verify OTP & login" : "Sign in")}
                    {section === "forgot" && "Send reset instructions"}
                    {section === "reset" && "Reset password"}
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {section === "login" && (
              <p className="mt-6 text-center text-xs text-white/50">
                New to {BRAND_NAME}?{" "}
                <button
                  type="button"
                  onClick={() => switchSection("register")}
                  className="font-semibold text-amber-200 underline decoration-amber-300/40 underline-offset-4 hover:decoration-amber-300"
                >
                  Create an account
                </button>
              </p>
            )}

            {section === "register" && (
              <p className="mt-6 text-center text-xs text-white/50">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchSection("login")}
                  className="font-semibold text-amber-200 underline decoration-amber-300/40 underline-offset-4 hover:decoration-amber-300"
                >
                  Sign in
                </button>
              </p>
            )}

            <p className="mt-5 text-center text-[10px] leading-5 text-white/35">
              By continuing, you agree to use {BRAND_NAME} responsibly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
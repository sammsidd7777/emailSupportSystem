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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  const field = (name, placeholder, Icon, type = "text") => (
    <div className="relative">
      <Icon
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
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
      <LockKeyhole
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
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
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
      >
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );

  const titles = {
    register: ["Create account", "Join SupportDesk in a few steps."],
    login: ["Welcome back", "Sign in to continue to your dashboard."],
    forgot: ["Forgot password?", "Enter your registered email address."],
    reset: ["Reset password", "Verify your OTP and create a new password."],
  };

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 p-3 sm:p-5">
      <div className="my-auto grid w-full max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-indigo-950/10 md:grid-cols-[0.85fr_1.15fr]">
        {/* Branding panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white md:flex">
          <div className="absolute -right-16 -top-14 h-48 w-48 rounded-full border border-white/15" />
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-violet-400/20 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2.5 ring-1 ring-white/20">
              <Headphones size={22} />
            </div>
            <div>
              <h2 className="font-bold tracking-wide">SupportDesk</h2>
              <p className="text-[11px] text-indigo-200">
                Customer support portal
              </p>
            </div>
          </div>

          <div className="relative py-7">
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
              <ShieldCheck size={28} />
            </div>

            <h1 className="text-2xl font-bold leading-tight">
              Every issue deserves a solution.
            </h1>

            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Raise support tickets, follow updates, and manage every
              conversation from one simple workspace.
            </p>

            <div className="mt-6 space-y-3 text-xs text-indigo-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} />
                Secure account access
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} />
                Email notifications
              </div>
              <div className="flex items-center gap-2">
                <KeyRound size={15} />
                Password and OTP options
              </div>
            </div>
          </div>

          <p className="relative text-[11px] text-indigo-200">
            Secure · Simple · Organized
          </p>
        </aside>

        {/* Auth form panel */}
        <section className="p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 md:hidden">
              <div className="rounded-xl bg-indigo-600 p-2 text-white">
                <Headphones size={20} />
              </div>
              <span className="font-bold text-slate-900">SupportDesk</span>
            </div>

            {(section === "forgot" || section === "reset") && (
              <button
                type="button"
                onClick={() => switchSection("login")}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
              >
                <ChevronLeft size={15} />
                Back to login
              </button>
            )}
          </div>

          {/* Login / Register toggle */}
          {(section === "login" || section === "register") && (
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchSection(item)}
                  className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition ${
                    section === item
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {titles[section][0]}
          </h2>

          <p className="mb-5 mt-1.5 text-sm text-slate-500">
            {titles[section][1]}
          </p>

          {/* Login method toggle */}
          {section === "login" && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("password");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                  loginMode === "password"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
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
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                  loginMode === "otp"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Login with OTP
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
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
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
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
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                >
                  {sendOtpState.isLoading ? "Sending OTP..." : "Send login OTP"}
                </button>

                {field("Otp", "Enter the OTP", ShieldCheck)}
              </>
            )}

            {section === "forgot" && (
              <>
                {field("Email", "Registered email address", Mail, "email")}

                <p className="text-xs leading-5 text-slate-500">
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
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {section === "login" && (
            <p className="mt-5 text-center text-xs text-slate-500">
              New to SupportDesk?{" "}
              <button
                type="button"
                onClick={() => switchSection("register")}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Create an account
              </button>
            </p>
          )}

          {section === "register" && (
            <p className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchSection("login")}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          <p className="mt-4 text-center text-[10px] text-slate-400">
            By continuing, you agree to use SupportDesk responsibly.
          </p>
        </section>
      </div>
    </main>
  );
}

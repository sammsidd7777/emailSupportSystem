
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
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

import {
  useRegistationMutation,
  useLoginMutation,
  useLoginWithOtpMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../services/RTK/authApi";

import { loginSuccess } from "../services/RTK/authSlice";

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
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedMode = searchParams.get("mode");
  const initialMode = ["register", "forgot", "reset"].includes(requestedMode)
    ? requestedMode
    : "login";

  const [section, setSection] = useState(initialMode);
  const [loginMode, setLoginMode] = useState("password");
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [registerUser, registerState] = useRegistationMutation();
  const [loginUser, loginState] = useLoginMutation();
  const [loginWithOtp, otpLoginState] = useLoginWithOtpMutation();
  const [sendOtp, sendOtpState] = useSendOtpMutation();
  const [verifyOtp, verifyOtpState] = useVerifyOtpMutation();
  const [forgotPassword, forgotState] = useForgotPasswordMutation();
  const [resetPassword, resetState] = useResetPasswordMutation();

  const busy =
    registerState.isLoading ||
    loginState.isLoading ||
    otpLoginState.isLoading ||
    sendOtpState.isLoading ||
    verifyOtpState.isLoading ||
    forgotState.isLoading ||
    resetState.isLoading;

  const update = (event) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const switchSection = (nextSection) => {
    setSection(nextSection);
    setSearchParams({ mode: nextSection });
    setError("");
    setMessage("");
  };

  const handleError = (err) => {
    setError(
      err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Something went wrong. Please try again."
    );
  };

  const goToDashboard = (user) => {
    const role = String(user?.role || user?.Role || "customer").toLowerCase();

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (["supportagent", "support_agent"].includes(role)) {
      navigate("/agent/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  const completeLogin = (response) => {
    const user = response?.user || response?.data?.user;
    const token = response?.accessToken || response?.token;

    if (!user) {
      throw new Error("Login succeeded, but user information was not returned.");
    }

    dispatch(
      loginSuccess({
        user,
        token,
      })
    );

    goToDashboard(user);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (section === "register") {
        if (values.Password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }

        if (values.Password !== values.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const payload = {
          ...values,
        };

        delete payload.confirmPassword;
        delete payload.Otp;

        await registerUser(payload).unwrap();

        setValues(initialValues);
        setMessage("Account created successfully. Please sign in.");
        switchSection("login");
        setMessage("Account created successfully. Please sign in.");
        return;
      }

      if (section === "login") {
        let response;

        if (loginMode === "password") {
          response = await loginUser({
            Email: values.Email,
            Password: values.Password,
          }).unwrap();
        } else {
          response = await loginWithOtp({
            Email: values.Email,
            Otp: values.Otp,
            purpose: "login",
          }).unwrap();
        }

        completeLogin(response);
        return;
      }

      if (section === "forgot") {
        await forgotPassword({
          Email: values.Email,
        }).unwrap();

        setMessage("If the account exists, password reset instructions have been sent.");
        switchSection("reset");
        setMessage("Enter your email, reset OTP and new password.");
        return;
      }

      if (section === "reset") {
        if (values.Password.length < 8) {
          setError("Password must be at least 8 characters long.");
          return;
        }

        if (values.Password !== values.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await verifyOtp({
          Email: values.Email,
          Otp: values.Otp,
          purpose: "reset-password",
        }).unwrap();

        await resetPassword({
          Email: values.Email,
          Otp: values.Otp,
          Password: values.Password,
        }).unwrap();

        setValues(initialValues);
        switchSection("login");
        setMessage("Password reset successfully. Please sign in.");
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
      await sendOtp({
        Email: values.Email,
        purpose: "login",
      }).unwrap();

      setMessage("OTP sent. Please check your email.");
    } catch (err) {
      handleError(err);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/80 bg-white/20 py-3 pl-11 pr-11 text-sm text-neutral-800 placeholder:text-neutral-500 outline-none backdrop-blur-xl transition duration-300 focus:border-white focus:bg-white/50 focus:ring-4 focus:ring-white/30";

  const field = (name, placeholder, Icon, type = "text") => (
    <div className="relative">
      <Icon
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
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
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
      />

      <input
        name={name}
        type={showPassword ? "text" : "password"}
        value={values[name]}
        onChange={update}
        placeholder={placeholder}
        required
        minLength={8}
        autoComplete="current-password"
        className={inputClass}
      />

      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-black"
      >
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );

  const titles = {
    register: ["Create account", "Join BitMax support in a few steps."],
    login: ["Welcome back", "Sign in to continue to your dashboard."],
    forgot: ["Forgot password?", "Enter your registered email address."],
    reset: ["Reset password", "Verify your OTP and create a new password."],
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-3 py-8 sm:px-6">
      {/* Pure white background with subtle neutral glass lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white blur-[100px]" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-neutral-100/70 blur-[110px]" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-white blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(245,245,245,0.35)_100%)]" />
      </div>

      {/* Main translucent glass container */}
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/80 bg-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-3xl md:min-h-[650px] md:grid-cols-[0.9fr_1.1fr]">
        {/* Branding panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/60 bg-white/10 p-8 backdrop-blur-2xl md:flex lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/80" />
          <div className="pointer-events-none absolute -right-8 -top-4 h-44 w-44 rounded-full border border-white/70" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/60 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-2xl border border-white/90 bg-white/40 p-3 text-neutral-700 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
              <Headphones size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-wide text-neutral-800">
                BITMAX
              </h2>
              <p className="text-[11px] tracking-wide text-neutral-500">
                CUSTOMER SUPPORT PORTAL
              </p>
            </div>
          </div>

          <div className="relative py-10">
            <div className="mb-5 inline-flex rounded-2xl border border-white/90 bg-white/40 p-3 text-neutral-700 shadow-sm backdrop-blur-xl">
              <ShieldCheck size={28} />
            </div>

            <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight text-neutral-800">
              Every issue deserves a solution.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-600">
              Raise support tickets, follow updates, and manage every
              conversation from one simple workspace.
            </p>

            <div className="mt-8 space-y-4 text-sm text-neutral-600">
              <div className="flex items-center gap-3">
                <ShieldCheck size={17} />
                Secure account access
              </div>

              <div className="flex items-center gap-3">
                <Mail size={17} />
                Email notifications
              </div>

              <div className="flex items-center gap-3">
                <KeyRound size={17} />
                Password and OTP options
              </div>
            </div>
          </div>

          <p className="relative text-xs tracking-wide text-neutral-500">
            Secure · Simple · Organized
          </p>
        </aside>

        {/* Authentication panel */}
        <section className="relative flex flex-col justify-center bg-white/20 p-5 backdrop-blur-3xl sm:p-8 lg:p-12">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white/90 bg-white/50 p-2.5 text-neutral-700 shadow-sm">
                <Headphones size={21} />
              </div>

              <span className="font-bold tracking-wide text-neutral-800">
                BITMAX
              </span>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
              Secure authentication
            </div>

            {(section === "forgot" || section === "reset") && (
              <button
                type="button"
                onClick={() => switchSection("login")}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-neutral-500 transition hover:text-black"
              >
                <ChevronLeft size={15} />
                Back to login
              </button>
            )}
          </div>

          {(section === "login" || section === "register") && (
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/80 bg-white/20 p-1.5 backdrop-blur-xl">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchSection(item)}
                  className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${
                    section === item
                      ? "border border-white/90 bg-white/60 text-neutral-800 shadow-[0_3px_12px_rgba(0,0,0,0.04)]"
                      : "text-neutral-500 hover:bg-white/30 hover:text-neutral-800"
                  }`}
                >
                  {item === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-semibold tracking-tight text-neutral-800">
            {titles[section][0]}
          </h2>

          <p className="mb-6 mt-2 text-sm leading-6 text-neutral-500">
            {titles[section][1]}
          </p>

          {section === "login" && (
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("password");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  loginMode === "password"
                    ? "border-white/90 bg-white/60 text-neutral-800 shadow-sm"
                    : "border-white/60 bg-white/15 text-neutral-500 hover:bg-white/50"
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
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  loginMode === "otp"
                    ? "border-white/90 bg-white/60 text-neutral-800 shadow-sm"
                    : "border-white/60 bg-white/15 text-neutral-500 hover:bg-white/50"
                }`}
              >
                Login with OTP
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {section === "register" && (
              <>
                {field("Name", "Full name", UserRound)}
                {field("Email", "Email address", Mail, "email")}
                {field("Phone", "Phone number", Phone, "tel")}
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
                    className="text-xs font-medium text-neutral-500 transition hover:text-black hover:underline"
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
                  className="w-full rounded-xl border border-white/80 bg-white/25 py-3 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur-xl transition hover:bg-white/60 disabled:opacity-50"
                >
                  {sendOtpState.isLoading ? "Sending OTP..." : "Send login OTP"}
                </button>

                {field("Otp", "Enter the OTP", ShieldCheck)}
              </>
            )}

            {section === "forgot" && (
              <>
                {field("Email", "Registered email address", Mail, "email")}

                <p className="text-xs leading-5 text-neutral-500">
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
                className="rounded-xl border border-red-200/80 bg-white/70 p-3 text-xs text-red-600 backdrop-blur-xl"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-white/80 bg-white/35 p-3 text-xs text-neutral-700 backdrop-blur-xl"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/90 bg-white/45 py-3.5 text-sm font-semibold text-neutral-800 shadow-[0_8px_25px_rgba(0,0,0,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-[0_12px_30px_rgba(0,0,0,0.09)] focus:outline-none focus:ring-4 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-60"
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
            <p className="mt-6 text-center text-xs text-neutral-500">
              New to BitMax?{" "}
              <button
                type="button"
                onClick={() => switchSection("register")}
                className="font-semibold text-neutral-800 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
              >
                Create an account
              </button>
            </p>
          )}

          {section === "register" && (
            <p className="mt-6 text-center text-xs text-neutral-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchSection("login")}
                className="font-semibold text-neutral-800 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
              >
                Sign in
              </button>
            </p>
          )}

          <p className="mt-5 text-center text-[10px] leading-5 text-neutral-400">
            By continuing, you agree to use BitMax responsibly.
          </p>
        </section>
      </div>
    </main>
  );
}


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useRegistationMutation } from "../../services/RTK/authApi";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const Password = watch("Password");
  const navigate = useNavigate();

  const [registation, { isLoading }] = useRegistationMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const onSubmit = async (data) => {
    setApiError("");

    try {
      const { confirmPassword, ...payload } = data;
      const res = await registation(payload).unwrap();

      alert(res.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      setApiError(
        error?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const fields = [
    {
      name: "Name",
      label: "Full name",
      placeholder: "Enter your full name",
      type: "text",
      icon: UserRound,
      rules: { required: "Name is required" },
    },
    {
      name: "Email",
      label: "Email address",
      placeholder: "you@example.com",
      type: "email",
      icon: Mail,
      rules: {
        required: "Email is required",
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Enter a valid email",
        },
      },
    },
    {
      name: "Phone",
      label: "Phone number",
      placeholder: "10-digit mobile number",
      type: "tel",
      icon: Phone,
      rules: {
        required: "Phone number is required",
        pattern: {
          value: /^[6-9]\d{9}$/,
          message: "Enter a valid Indian mobile number",
        },
      },
    },
  ];

  const inputClass = (error) =>
    `w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-4 ${
      error
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4 py-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        {/* Compact branding panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-800 p-8 text-white md:flex">
          <div className="absolute -right-16 top-20 h-48 w-48 rounded-full border border-white/15" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2.5">
              <Headphones size={22} />
            </div>
            <div>
              <h2 className="font-bold">SupportDesk</h2>
              <p className="text-xs text-indigo-200">Support made simple</p>
            </div>
          </div>

          <div className="relative py-8">
            <h1 className="text-3xl font-bold leading-tight">
              Better support starts here.
            </h1>
            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Create tickets, track progress, and manage every conversation in
              one place.
            </p>
          </div>

          <p className="text-xs text-indigo-200">
            Secure. Simple. Organized.
          </p>
        </div>

        {/* Form panel */}
        <div className="px-6 py-6 sm:px-9 sm:py-8">
          {/* Mobile branding */}
          <div className="mb-5 flex items-center gap-2 md:hidden">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <Headphones size={20} />
            </div>
            <span className="font-bold text-slate-900">SupportDesk</span>
          </div>

          {/* Register / Login toggle */}
          <div className="mb-6 rounded-xl bg-slate-100 p-1">
            <div className="grid grid-cols-2">
              <button
                type="button"
                className="rounded-lg bg-white py-2.5 text-sm font-semibold text-indigo-600 shadow-sm"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-lg py-2.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
              >
                Login
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create account
          </h2>
          <p className="mb-6 mt-1.5 text-sm text-slate-500">
            Enter your details to get started.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => {
              const Icon = field.icon;
              const error = errors[field.name];

              return (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    {field.label}
                  </label>

                  <div className="relative">
                    <Icon
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      autoComplete={
                        field.name === "Name"
                          ? "name"
                          : field.name === "Email"
                            ? "email"
                            : "tel"
                      }
                      aria-invalid={Boolean(error)}
                      className={inputClass(Boolean(error))}
                      {...register(field.name, field.rules)}
                    />
                  </div>

                  {error && (
                    <p className="mt-1 text-xs text-red-600">
                      {error.message}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Password */}
            <div>
              <label
                htmlFor="Password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.Password)}
                  className={`${inputClass(Boolean(errors.Password))} pr-11`}
                  {...register("Password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Minimum 8 characters required",
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {errors.Password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.Password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className={`${inputClass(
                    Boolean(errors.confirmPassword)
                  )} pr-11`}
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === Password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {apiError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create account"}
              {!isLoading && <ArrowRight size={17} />}
            </button>

            <p className="pt-1 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

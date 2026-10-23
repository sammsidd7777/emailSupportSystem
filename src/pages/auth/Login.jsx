
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { useLoginMutation } from "../../services/RTK/authApi";

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [login, { isLoading }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();

      if (!res?.success) {
        throw new Error(res?.message || "Login failed");
      }

      // Redirect according to the logged-in user's role
      const role = res.user?.Role;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "supportAgent") {
        navigate("/agent/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      alert(error?.data?.message || error?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-violet-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Login to your account
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <div className="flex items-center gap-3 rounded-xl border p-3">
            <Mail size={18} className="text-gray-400" />

            <input
              type="email"
              placeholder="Enter email"
              className="w-full outline-none"
              {...register("Email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
          </div>

          {errors.Email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.Email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Password
          </label>

          <div className="flex items-center gap-3 rounded-xl border p-3">
            <Lock size={18} className="text-gray-400" />

            <input
              type="password"
              placeholder="Enter password"
              className="w-full outline-none"
              {...register("Password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Minimum 8 characters required",
                },
              })}
            />
          </div>

          {errors.Password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.Password.message}
            </p>
          )}
        </div>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-violet-600"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/verification")}
          className="w-full rounded-xl border border-violet-200 py-3 font-semibold text-violet-700"
        >
          Login with OTP
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-violet-600"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

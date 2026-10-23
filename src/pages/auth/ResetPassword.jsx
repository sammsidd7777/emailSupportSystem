import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useResetPasswordMutation } from '../../services/RTK/authApi';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const Email = location.state?.Email;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
  });

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (!Email) {
      alert('Email not found. Please verify your email again.');
      return;
    }

    const payload = {
      Email,
      newPassword: data.newPassword,
    };

    try {
      const response = await resetPassword(payload).unwrap();

      alert(
        response.message ||
          'Password reset successful. Please log in with your new password.'
      );

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error resetting password:', error);

      alert(
        error?.data?.message ||
          'Unable to reset password. Please try again.'
      );
    }
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-white to-indigo-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <ShieldCheck size={28} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Reset Password
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Create a new password using at least 8 characters.
        </p>

        {Email && (
          <p className="mt-2 text-sm text-gray-500">
            Account: {Email}
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 space-y-5"
        >
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              New Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                autoComplete="new-password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className={`${inputClass} ${
                  errors.newPassword ? 'border-red-400' : ''
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
                className={`${inputClass} ${
                  errors.confirmPassword ? 'border-red-400' : ''
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={
                  showConfirm ? 'Hide password' : 'Show password'
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading || !Email}
            className="w-full rounded-xl bg-violet-600 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-60"
          >
            {isSubmitting || isLoading
              ? 'Resetting...'
              : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-semibold text-violet-700 hover:text-violet-900"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

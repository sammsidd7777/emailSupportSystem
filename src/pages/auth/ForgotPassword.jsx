import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useForgetPasswordMutation } from '../../services/RTK/authApi';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();
  const [forgetPassword] = useForgetPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const response = await forgetPassword(data).unwrap();

      if (!response.success) {
        console.error(
          'Error occurred while submitting forgot password request:',
          response.error
        );
        return;
      }

      alert(
        'Password reset request sent successfully. Please check your email.'
      );

      navigate('/verification', {
        state: { Email: data.Email },
      });
    } catch (error) {
      console.error('Forgot password request failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-violet-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-3xl font-bold">Forgot Password?</h1>

        <p className="text-sm text-gray-500">
          Enter your email address to request a password reset.
        </p>

        <div>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border p-3 outline-none focus:border-violet-500"
            {...register('Email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />

          {errors.Email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.Email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>

        <Link
          to="/login"
          className="block text-center text-sm font-semibold text-violet-600"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
}

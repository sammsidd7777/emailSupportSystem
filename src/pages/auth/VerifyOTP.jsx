import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useVerifyOtpMutation } from '../../services/RTK/authApi';

export default function Verification() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive email from Forgot Password page
  const Email = location.state?.Email;
  const purpose = location.state?.purpose || 'reset-password'; // Default to 'reset-password' if not provided

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [verifyOtp] = useVerifyOtpMutation();

  console.log(Email, 'Coming from forgot password page');

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        Email,
        purpose,
      };

      console.log('OTP submitted:', payload);

      const response = await verifyOtp(payload).unwrap();

      if(!response.success) {
        console.error('Error occurred while verifying OTP:', response.error);
        alert('OTP verification failed. Please try again.');
        return;
      }

     navigate('/reset-password', { state: { Email } });
     

      // Navigate after successful verification if appropriate
      // navigate('/reset-password', { state: { Email } });

    } catch (error) {
      console.error('Error occurred while verifying OTP:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-violet-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="text-4xl">🔐</div>

        <h1 className="text-3xl font-bold">Verify OTP</h1>

        <p className="text-sm text-gray-500">
          Enter the 6-digit verification code.
        </p>

        {Email && (
          <p className="text-sm text-gray-600">
            Verification for: {Email}
          </p>
        )}

        {!Email && (
          <p className="text-sm text-red-500">
            Email not found. Please return to Forgot Password.
          </p>
        )}

        <div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-xl border p-3 text-center text-xl tracking-[0.5em] outline-none focus:border-violet-500"
            {...register('otp', {
              required: 'OTP is required',
              pattern: {
                value: /^\d{6}$/,
                message: 'Enter a valid 6-digit OTP',
              },
            })}
          />

          {errors.otp && (
            <p className="mt-1 text-sm text-red-500">
              {errors.otp.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !Email}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
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

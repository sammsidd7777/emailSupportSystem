
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useCreateTicketMutation } from "../../services/RTK/ticketApi";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subject: "",
      category: "",
      priority: "medium",
      description: "",
    },
  });

  const description = watch("description") || "";

  const inputClass = (error) =>
    `w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900
    outline-none transition placeholder:text-gray-400
    focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10
    disabled:cursor-not-allowed disabled:bg-gray-50
    ${error ? "border-red-400" : "border-gray-300 hover:border-gray-400"}`;

  const onSubmit = async (data) => {
    setApiError("");

    try {
      const result = await createTicket({
        Subject: data.subject.trim(),
        Category: data.category,
        Priority: data.priority,
        Description: data.description.trim(),
      }).unwrap();

      const ticket =
        result?.ticket ??
        result?.data?.ticket ??
        result?.data;

      if (!ticket?._id) {
        setApiError(
          "Ticket response mein ID nahi mili. Please My Tickets section check karein."
        );
        return;
      }

      reset();
      navigate(`/user/tickets/${ticket._id}`);
    } catch (error) {
      setApiError(
        error?.data?.message ||
          error?.data?.error ||
          error?.message ||
          "Ticket create nahi ho paya. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-7 sm:px-6 lg:px-8">
     <div className="w-full max-w-none">
        {/* Back navigation */}
        

        {/* Form */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">
              Ticket details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 p-5 sm:p-6"
            noValidate
          >
            {/* API error */}
            {apiError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {apiError}
              </div>
            )}

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 block text-sm font-medium text-gray-800"
              >
                Subject <span className="text-red-500">*</span>
              </label>

              <input
                id="subject"
                type="text"
                maxLength={150}
                placeholder="Enter a short title for your issue"
                disabled={isLoading}
                className={inputClass(errors.subject)}
                {...register("subject", {
                  required: "Subject is required.",
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Subject cannot be empty.",
                  maxLength: {
                    value: 150,
                    message: "Subject cannot exceed 150 characters.",
                  },
                })}
              />

              {errors.subject && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Category and priority */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-medium text-gray-800"
                >
                  Category <span className="text-red-500">*</span>
                </label>

                <select
                  id="category"
                  disabled={isLoading}
                  className={inputClass(errors.category)}
                  {...register("category", {
                    required: "Please select a category.",
                  })}
                >
                  <option value="">Select category</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Account & Login">Account &amp; Login</option>
                  <option value="Billing & Payment">Billing &amp; Payment</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>

                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="mb-1.5 block text-sm font-medium text-gray-800"
                >
                  Priority <span className="text-red-500">*</span>
                </label>

                <select
                  id="priority"
                  disabled={isLoading}
                  className={inputClass(errors.priority)}
                  {...register("priority", {
                    required: "Please select a priority.",
                    validate: (value) =>
                      ["low", "medium", "high", "urgent"].includes(value) ||
                      "Please select a valid priority.",
                  })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                {errors.priority && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-800"
                >
                  Description <span className="text-red-500">*</span>
                </label>

                <span className="shrink-0 text-xs text-gray-500">
                  {description.length}/5000
                </span>
              </div>

              <textarea
                id="description"
                rows={6}
                maxLength={5000}
                disabled={isLoading}
                placeholder="Describe what happened and what you have already tried."
                className={`${inputClass(errors.description)} resize-y`}
                {...register("description", {
                  required: "Description is required.",
                  validate: (value) =>
                    value.trim().length >= 10 ||
                    "Please enter at least 10 characters.",
                  maxLength: {
                    value: 5000,
                    message: "Description cannot exceed 5000 characters.",
                  },
                })}
              />

              {errors.description ? (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.description.message}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  Include enough detail to help the support team understand the problem.
                </p>
              )}
            </div>

            {/* Form actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <Link
                to="/user/my-tickets"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}

                {isLoading ? "Creating ticket..." : "Create ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;

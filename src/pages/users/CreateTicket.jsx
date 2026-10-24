import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useCreateTicketMutation } from "../../services/RTK/ticketApi";

const priorityOptions = [
  { value: "low", label: "Low", hint: "No rush", dot: "bg-slate-400" },
  { value: "medium", label: "Medium", hint: "Normal", dot: "bg-amber-400" },
  { value: "high", label: "High", hint: "Blocking me", dot: "bg-orange-500" },
  { value: "urgent", label: "Urgent", hint: "Critical", dot: "bg-red-500" },
];

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
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900
    outline-none transition placeholder:text-slate-400
    focus:border-amber-400 focus:ring-4 focus:ring-amber-300/20
    disabled:cursor-not-allowed disabled:bg-slate-50
    ${
      error
        ? "border-red-400"
        : "border-amber-200/70 hover:border-amber-300"
    }`;

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
          "Your request was sent, but we didn't get a ticket ID back. Please check the My Tickets page."
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
          "We couldn't create your ticket. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div>
        <Link
          to="/user/my-tickets"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-amber-700"
        >
          <ArrowLeft size={16} />
          Back to my tickets
        </Link>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Raise a request
        </h1>

        <p className="mt-1.5 text-sm text-slate-500">
          Tell us what's going on and our team will pick it up.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---------- Form ---------- */}
        <div className="overflow-hidden rounded-2xl border border-amber-200/50 bg-white shadow-[0_8px_30px_rgba(120,85,10,0.06)]">
          <div className="h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600" />

          <div className="border-b border-amber-100 px-5 py-4 sm:px-7">
            <h2 className="text-base font-semibold text-slate-900">
              Request details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 p-5 sm:p-7"
            noValidate
          >
            {/* API error */}
            {apiError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {apiError}
              </div>
            )}

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Subject <span className="text-red-500">*</span>
              </label>

              <input
                id="subject"
                type="text"
                maxLength={150}
                placeholder="Give your issue a short title"
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

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-slate-800"
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
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-800">
                How urgent is it? <span className="text-red-500">*</span>
              </legend>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative block ${
                      isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      disabled={isLoading}
                      className="peer sr-only"
                      {...register("priority", {
                        required: "Please select a priority.",
                        validate: (value) =>
                          ["low", "medium", "high", "urgent"].includes(value) ||
                          "Please select a valid priority.",
                      })}
                    />

                    <div className="rounded-xl border border-amber-200/70 bg-white p-3 transition hover:border-amber-300 peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:shadow-[inset_0_0_0_1px_rgba(229,184,75,0.6)] peer-focus-visible:ring-4 peer-focus-visible:ring-amber-300/30">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                        <span className="text-sm font-semibold text-slate-800">
                          {option.label}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {option.hint}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {errors.priority && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.priority.message}
                </p>
              )}
            </fieldset>

            {/* Description */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-800"
                >
                  Description <span className="text-red-500">*</span>
                </label>

                <span className="shrink-0 text-xs text-slate-400">
                  {description.length}/5000
                </span>
              </div>

              <textarea
                id="description"
                rows={7}
                maxLength={5000}
                disabled={isLoading}
                placeholder="What happened, and what have you already tried?"
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
                <p className="mt-1.5 text-xs text-slate-500">
                  The more detail you share, the faster we can help.
                </p>
              )}
            </div>

            {/* Form actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-amber-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                to="/user/my-tickets"
                className="inline-flex items-center justify-center rounded-xl border border-amber-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-amber-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 px-6 py-3 text-sm font-bold text-neutral-950 shadow-[0_10px_30px_rgba(217,160,40,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isLoading && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}

                {isLoading ? "Sending..." : "Submit request"}
              </button>
            </div>
          </form>
        </div>

        {/* ---------- Side panel ---------- */}
        <aside className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-[#0a0907] p-6 text-white shadow-[0_18px_40px_rgba(20,15,5,0.25),inset_0_1px_0_rgba(253,234,168,0.1)] lg:sticky lg:top-[100px]">
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-amber-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative">
            <h3 className="text-lg font-semibold">
              Get a faster answer
            </h3>

            <p className="mt-1.5 text-sm leading-6 text-white/55">
              A few details up front save everyone a round of questions.
            </p>

            <ul className="mt-5 space-y-4 text-sm leading-6 text-white/75">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                Say what you expected, and what happened instead.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                Mention any error message exactly as you saw it.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                List what you've already tried.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                Save Urgent for issues that fully block your work.
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] p-4 text-xs leading-5 text-white/55 backdrop-blur">
              After you submit, you'll land on your ticket where you can
              follow replies.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateTicket;
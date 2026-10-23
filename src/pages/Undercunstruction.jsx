import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Construction,
  House,
  Sparkles,
} from "lucide-react";

/**
 * Reusable placeholder for admin pages that are not ready yet.
 *
 * Example:
 * <UnderConstruction
 *   title="User Management"
 *   description="Manage customer accounts and support access."
 *   backTo="/admin/dashboard"
 * />
 */
export default function UnderConstruction({
  title = "Page under construction",
  description = "We're working on this page to make it ready for you.",
  backTo = "/admin/dashboard",
  backLabel = "Back to dashboard",
  badge = "Coming soon",
}) {
  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-violet-100/70 blur-3xl" />

          <div className="relative grid items-center gap-8 px-6 py-12 sm:px-10 sm:py-14 md:grid-cols-[1fr_0.8fr] md:px-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                <Sparkles size={14} /> {badge}
              </span>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                {description}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This section is being prepared. Please check back soon.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={backTo}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <House size={16} /> {backLabel} <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ArrowLeft size={16} /> Go back
                </button>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-xs items-center justify-center md:max-w-none">
              <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-inner">
                <div className="absolute inset-5 rounded-[2rem] border border-dashed border-blue-200" />
                <div className="absolute right-8 top-8 h-3 w-3 rounded-full bg-violet-400" />
                <div className="absolute bottom-10 left-8 h-2.5 w-2.5 rounded-full bg-blue-400" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-600/30 sm:h-36 sm:w-36">
                  <Construction size={58} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-md">
                  Work in progress
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <span>BitMax Support Management</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> This page is not available yet
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
    
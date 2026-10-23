import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  MessageSquare,
  ShieldCheck,
  Ticket,
  Zap,
  Clock3,
  Menu,
  Mail,
  Users,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Ticket,
      title: "Smart Ticket Management",
      description:
        "Create, track, and manage support tickets from one simple dashboard.",
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description:
        "Keep conversations organized with your support team in one place.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      description:
        "Role-based access keeps customer, agent, and admin work organized.",
    },
    {
      icon: Zap,
      title: "Faster Resolution",
      description:
        "Track ticket priorities and statuses to help resolve issues efficiently.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Assign tickets to support agents and manage workloads easily.",
    },
    {
      icon: Mail,
      title: "Email Notifications",
      description:
        "Stay updated with notifications about important ticket activities.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Headphones size={23} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Support<span className="text-blue-600">Desk</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How it works
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get started <span className="ml-1">→</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="relative">
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-[120px]" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                Your smarter customer support solution
              </div>

              <h1 className="max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Support made simple.
                <span className="mt-2 block bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Customers made happy.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Manage support requests, collaborate with your team, and
                resolve customer issues from one clean and powerful workspace.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-700"
                >
                  Create your account
                  <ArrowRight
                    size={19}
                    className="transition group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  Track your tickets
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  Easy ticket tracking
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  Organized conversations
                </span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-indigo-200/60 blur-2xl" />
              <div className="absolute -bottom-5 -left-5 h-28 w-28 rounded-full bg-blue-200/70 blur-2xl" />

              <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/50 sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      WORKSPACE
                    </p>
                    <h2 className="mt-1 text-lg font-bold">Support overview</h2>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                    Dashboard
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Total tickets",
                      value: "128",
                      color: "bg-blue-50 text-blue-600",
                      icon: Ticket,
                    },
                    {
                      label: "In progress",
                      value: "24",
                      color: "bg-amber-50 text-amber-600",
                      icon: Clock3,
                    },
                    {
                      label: "Resolved",
                      value: "86",
                      color: "bg-emerald-50 text-emerald-600",
                      icon: CheckCircle2,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4"
                      >
                        <span
                          className={`inline-flex rounded-lg p-2 ${item.color}`}
                        >
                          <Icon size={17} />
                        </span>
                        <p className="mt-3 text-2xl font-extrabold">
                          {item.value}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-slate-100 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold">Recent tickets</h3>
                    <span className="text-xs font-semibold text-blue-600">
                      View all
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: "#TK-1024",
                        title: "Unable to access my account",
                        status: "Open",
                        color: "bg-blue-50 text-blue-700",
                        initials: "AK",
                      },
                      {
                        id: "#TK-1023",
                        title: "Payment confirmation issue",
                        status: "In progress",
                        color: "bg-amber-50 text-amber-700",
                        initials: "RS",
                      },
                      {
                        id: "#TK-1022",
                        title: "Update profile information",
                        status: "Resolved",
                        color: "bg-emerald-50 text-emerald-700",
                        initials: "PM",
                      },
                    ].map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                          {ticket.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {ticket.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {ticket.id}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs ${ticket.color}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl bg-blue-600 p-4 text-white">
                  <div className="rounded-lg bg-white/15 p-2">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      Every conversation in one place
                    </p>
                    <p className="mt-1 text-xs text-blue-100">
                      Keep your team and customers connected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 top-1/3 hidden items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-xl sm:flex">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold">Ticket resolved</p>
                  <p className="text-xs text-slate-500">Great work!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Everything you need
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Support that works smarter
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                The essential tools your team needs to handle customer requests
                without unnecessary complexity.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <Icon size={23} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Simple process
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Get support in three steps
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                No complicated process. Just create a ticket, follow updates,
                and get your issue resolved.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Create a ticket",
                  description:
                    "Describe your issue and submit a support request in minutes.",
                },
                {
                  number: "02",
                  title: "Connect with support",
                  description:
                    "Your ticket can be assigned to an agent who follows up with you.",
                },
                {
                  number: "03",
                  title: "Track resolution",
                  description:
                    "Follow the conversation and check your ticket status anytime.",
                },
              ].map((step) => (
                <div key={step.number} className="relative rounded-2xl border border-slate-200 p-7">
                  <span className="text-4xl font-black text-blue-100">
                    {step.number}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="about" className="px-5 pb-20 sm:pb-24 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Let's get started
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
              Better support starts with one simple step.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">
              Create your account and bring your support conversations into one
              organized workspace.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Get started for free <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 self-start"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Headphones size={18} />
            </span>
            <span className="font-extrabold">
              Support<span className="text-blue-600">Desk</span>
            </span>
          </button>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SupportDesk. All rights reserved.
          </p>

          <div className="flex gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => navigate("/login")}
              className="transition hover:text-blue-600"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="transition hover:text-blue-600"
            >
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}


  const inputClass =
    "w-full rounded-xl border border-white/80 bg-white/45 py-3 pl-11 pr-11 text-sm text-slate-700 placeholder:text-slate-500 outline-none backdrop-blur-xl transition duration-300 focus:border-white focus:bg-white/70 focus:ring-4 focus:ring-white/40";

  const field = (name, placeholder, Icon, type = "text") => (
    <div className="relative">
      <Icon
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
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
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        value={values[name]}
        onChange={update}
        placeholder={placeholder}
        required
        minLength={8}
        autoComplete="new-password"
        className={inputClass}
      />
      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black"
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f8fa] via-[#e8ebef] to-[#fdfdfd] px-3 py-8 sm:px-6">
      {/* Soft blurred white / silver background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/90 blur-[100px]" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-slate-300/50 blur-[110px]" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-white blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(255,255,255,0.25)_100%)]" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/90 bg-white/30 shadow-[0_25px_80px_rgba(80,90,105,0.18)] backdrop-blur-3xl md:min-h-[650px] md:grid-cols-[0.9fr_1.1fr]">
        {/* Branding panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/60 bg-white/15 p-8 backdrop-blur-2xl md:flex lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/80" />
          <div className="pointer-events-none absolute -right-8 -top-4 h-44 w-44 rounded-full border border-white/70" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/60 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-2xl border border-white bg-white/60 p-3 text-slate-700 shadow-lg shadow-slate-400/10 backdrop-blur-xl">
              <Headphones size={25} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-slate-800">
                BITMAX
              </h2>
              <p className="text-[11px] tracking-wide text-slate-500">
                CUSTOMER SUPPORT PORTAL
              </p>
            </div>
          </div>

          <div className="relative py-10">
            <div className="mb-5 inline-flex rounded-2xl border border-white bg-white/50 p-3 text-slate-700 shadow-sm backdrop-blur-xl">
              <ShieldCheck size={28} />
            </div>

            <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight text-slate-800">
              Every issue deserves a solution.
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Raise support tickets, follow updates, and manage every
              conversation from one simple workspace.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-600">
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

          <p className="relative text-xs tracking-wide text-slate-500">
            Secure · Simple · Organized
          </p>
        </aside>

        {/* Auth form panel */}
        <section className="relative flex flex-col justify-center bg-white/40 p-5 backdrop-blur-3xl sm:p-8 lg:p-12">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-white bg-white/70 p-2.5 text-slate-700 shadow-sm">
                <Headphones size={21} />
              </div>
              <span className="font-bold tracking-wide text-slate-800">
                BITMAX
              </span>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
              Secure authentication
            </div>

            {(section === "forgot" || section === "reset") && (
              <button
                type="button"
                onClick={() => switchSection("login")}
                className="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-black"
              >
                <ChevronLeft size={15} />
                Back to login
              </button>
            )}
          </div>

          {(section === "login" || section === "register") && (
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/80 bg-slate-200/30 p-1.5">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchSection(item)}
                  className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${
                    section === item
                      ? "border border-white bg-white/90 text-slate-800 shadow-[0_3px_12px_rgba(100,110,125,0.12)]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
            {titles[section][0]}
          </h2>

          <p className="mb-6 mt-2 text-sm leading-6 text-slate-500">
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
                    ? "border-white bg-white/90 text-slate-800 shadow-sm"
                    : "border-white/50 bg-white/20 text-slate-500 hover:bg-white/60"
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
                    ? "border-white bg-white/90 text-slate-800 shadow-sm"
                    : "border-white/50 bg-white/20 text-slate-500 hover:bg-white/60"
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
                    className="text-xs font-medium text-slate-500 transition hover:text-black hover:underline"
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
                  className="w-full rounded-xl border border-white bg-white/55 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white/85 disabled:opacity-50"
                >
                  {sendOtpState.isLoading ? "Sending OTP..." : "Send login OTP"}
                </button>

                {field("Otp", "Enter the OTP", ShieldCheck)}
              </>
            )}

            {section === "forgot" && (
              <>
                {field("Email", "Registered email address", Mail, "email")}
                <p className="text-xs leading-5 text-slate-500">
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
                className="rounded-xl border border-white bg-white/65 p-3 text-xs text-slate-700 backdrop-blur-xl"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white bg-gradient-to-b from-white/95 to-slate-200/80 py-3.5 text-sm font-semibold text-slate-800 shadow-[0_8px_25px_rgba(100,110,125,0.16)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(100,110,125,0.22)] focus:outline-none focus:ring-4 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-60"
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
            <p className="mt-6 text-center text-xs text-slate-500">
              New to BitMax?{" "}
              <button
                type="button"
                onClick={() => switchSection("register")}
                className="font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700"
              >
                Create an account
              </button>
            </p>
          )}

          {section === "register" && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchSection("login")}
                className="font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700"
              >
                Sign in
              </button>
            </p>
          )}

          <p className="mt-5 text-center text-[10px] leading-5 text-slate-400">
            By continuing, you agree to use BitMax responsibly.
          </p>
        </section>
      </div>
    </main>
  );

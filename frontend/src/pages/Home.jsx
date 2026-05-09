import { Link } from "react-router-dom";

const audience = [
  "Medical Laboratory Scientists",
  "Doctors and clinicians",
  "Nurses and specialist staff",
  "Students and interns",
  "Researchers and educators"
];

const features = [
  {
    title: "Structured CME Library",
    text: "Keep videos, PDFs, notes, and course material organized in one searchable clinical learning environment."
  },
  {
    title: "Designed for Retrieval",
    text: "Filter by speaker, topic, format, date, and discipline so important material stays useful long after a live session ends."
  },
  {
    title: "Progress With Proof",
    text: "Support real learning with guided completion, visible progress, CME credit tracking, and certificate delivery."
  }
];

export default function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-stone-100 text-slate-900">
      <section className="relative overflow-hidden bg-[#171717] text-white">
        <div
          className="hero-slide-a absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Med-1.jpg')" }}
        />
        <div
          className="hero-slide-b absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Med-2.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(12,12,12,0.94)_0%,rgba(28,28,28,0.86)_44%,rgba(68,68,68,0.42)_100%)]" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-[-3rem] bottom-[-4rem] h-64 w-64 rounded-full bg-stone-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-3 sm:px-6 sm:py-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-8">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-stone-200">
              Continuous Medical Education Platform
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Smarter CME. Seamless Access.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-stone-200 sm:text-base">
              Access a centralized archive of continuous medical education resources designed to support your growth, enhance your skills, and advance patient care. Easy access. Anytime. Anywhere.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {token ? (
                <>
                  <Link
                    to="/library"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-stone-100"
                  >
                    Explore Library
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl border border-white/50 px-6 py-3 font-medium text-white transition hover:bg-white hover:text-slate-950"
                  >
                    Open Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-stone-100"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/50 px-6 py-3 font-medium text-white transition hover:bg-white hover:text-slate-950"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="mt-10 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Who It Serves</h2>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100">
                  Multi-role
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {audience.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-stone-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-600">Platform Value</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                A production-ready learning hub for modern CME delivery
              </h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Built to preserve training value after live events, CME Nexus helps teams move from scattered materials
              to a polished, searchable, measurable learning system.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                text={feature.text}
                accent={index === 0 ? "blue" : index === 1 ? "cyan" : "slate"}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, text, accent }) {
  const accents = {
    blue: "from-stone-900/6 to-stone-500/6 border-stone-200",
    cyan: "from-stone-300/20 to-stone-100/50 border-stone-200",
    slate: "from-slate-900/6 to-slate-500/6 border-slate-200"
  };

  return (
    <div className={`rounded-[2rem] border bg-gradient-to-br ${accents[accent]} bg-white p-6 shadow-sm`}>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}

import { Link } from "react-router-dom";

const audience = [
  "Medical Laboratory Scientists",
  "Doctors and clinicians",
  "Nurses",
  "Students and interns",
  "Researchers"
];

const features = [
  {
    title: "Structured CME Library",
    text: "Store and retrieve recorded videos, slide decks, and notes across hematology, microbiology, chemistry, molecular biology, quality assurance, parasitology, and lab automation."
  },
  {
    title: "Smart Search and Filters",
    text: "Find content by topic, speaker, date, discipline, keyword, and format so learning resources stay accessible long after live sessions end."
  },
  {
    title: "Credits and Certificates",
    text: "Track completed sessions, accumulate CME points, and download verifiable certificates after completion."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <section className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#06b6d4_100%)] text-white px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.28em] text-cyan-200 text-xs mb-4">Connecting knowledge. Advancing care.</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-5">
              Smarter CME. Seamless Access.
            </h1>
            <p className="text-blue-50 text-base sm:text-lg max-w-2xl mb-8">
              Access a centralized archive of continuous medical education resources designed to support your growth,
              enhance your skills, and advance patient care. Easy access. Anytime. Anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="bg-white text-blue-950 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition text-center"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="border border-white/70 px-6 py-3 rounded-xl hover:bg-white hover:text-blue-950 transition text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl border border-white/15 p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">Who it serves</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {audience.map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 border border-white/10">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-2">Core Concept</p>
              <h2 className="text-2xl sm:text-3xl font-semibold">A learning hub and professional resource center</h2>
            </div>
            <p className="text-gray-600 max-w-2xl">
              CME Nexus preserves valuable CME content that is usually lost after events and turns it into a structured, searchable medical knowledge archive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} text={feature.text} />
            ))}
          </div>
        </div>
      </section>

      {/* <section className="py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border shadow-sm p-8 sm:p-10 grid lg:grid-cols-[1fr_1fr] gap-8">
          <div>
            <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-2">Platform Pages</p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Built around the actual CME workflow</h2>
            <p className="text-gray-600">
              Home, Library, Upload, Dashboard, About, Contact, and Login all serve a clear purpose in the learning and accreditation journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {["Home", "Library", "Upload", "Dashboard", "About", "Contact", "Login"].map((page) => (
              <div key={page} className="rounded-2xl border bg-gray-50 px-4 py-4 font-medium text-gray-800">
                {page}
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border">
      <h3 className="font-semibold text-blue-950 mb-3 text-lg">{title}</h3>
      <p className="text-sm text-gray-600 leading-6">{text}</p>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* HERO */}
      <section className="bg-blue-900 text-white py-16 sm:py-20 px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
          CME Nexus
        </h1>

        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-4 sm:mb-6">
          Smarter CME. Seamless Access.
        </p>

        <p className="text-gray-200 text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-10">
          Access a centralized archive of continuous medical education resources 
          designed to enhance clinical competence, support professional growth, 
          and improve patient outcomes.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            to="/library"
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-lg font-medium transition w-full sm:w-auto"
          >
            Explore Library
          </Link>

          <Link
            to="/login"
            className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-900 transition w-full sm:w-auto"
          >
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8 sm:mb-12">
          Designed for Continuous Professional Development
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">

          <FeatureCard
            title="Structured CME Library"
            text="Access categorized medical content including videos, slide decks, and clinical notes across multiple disciplines."
          />

          <FeatureCard
            title="Track Learning Progress"
            text="Monitor completed sessions, track CME credits, and maintain a clear record of professional development."
          />

          <FeatureCard
            title="Certification & Verification"
            text="Earn verifiable certificates upon completion of CME activities, supporting accreditation requirements."
          />

        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 text-center border-t">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Advance Your Clinical Knowledge
        </h2>

        <p className="text-gray-600 text-sm sm:text-base mb-6">
          Learn, revise, and stay ahead in your medical practice with structured CME resources.
        </p>

        <Link
          to="/register"
          className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition w-full sm:w-auto inline-block"
        >
          Get Started
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs sm:text-sm text-gray-500 py-6 px-4">
        Connecting knowledge. Advancing care.
      </footer>

    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border">
      <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600">
        {text}
      </p>
    </div>
  );
}
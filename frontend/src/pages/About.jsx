export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white border rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-blue-950 text-white p-8 sm:p-10">
          <p className="text-cyan-300 uppercase tracking-[0.25em] text-xs mb-3">About CME Nexus</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mb-4">A centralized platform for continuous medical education</h1>
          <p className="text-blue-100 max-w-2xl">
            CME Nexus is designed to simplify access to continuous medical education resources,
            empowering lab professionals, clinicians, nurses, students, and researchers to learn,
            grow, and deliver better care.
          </p>
        </div>

        <div className="p-8 sm:p-10 space-y-8 text-sm sm:text-base text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Core concept</h2>
            <p>
              The platform preserves valuable CME sessions that are often lost after live events and
              turns them into a structured, searchable archive of videos, slide decks, and notes.
            </p>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border p-5 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">What it supports</h3>
              <ul className="space-y-2">
                <li>Searchable content library by discipline, topic, speaker, date, and keywords.</li>
                <li>User accounts that track completed sessions, certificates, and CME points.</li>
                <li>Verification-ready certificates for accreditation and professional records.</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-5 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2">Primary audience</h3>
              <ul className="space-y-2">
                <li>Medical Laboratory Scientists</li>
                <li>Doctors and clinicians</li>
                <li>Nurses, students, interns, and researchers</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

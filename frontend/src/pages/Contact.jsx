export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-12">
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="bg-white border rounded-3xl shadow-sm p-8 sm:p-10">
          <p className="text-cyan-700 uppercase tracking-[0.25em] text-xs mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
            Have questions or need support?
          </h1>
          <p className="text-gray-600 mb-8">
            Get in touch with us. We are here to help you make the most of your learning experience.
          </p>

          <div className="space-y-4 text-sm sm:text-base text-gray-700">
            <div className="rounded-2xl bg-gray-50 border p-4">
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">support@cmenexus.com</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border p-4">
              <p className="text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-900">Nairobi, Kenya</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border p-4">
              <p className="text-gray-500 mb-1">Support focus</p>
              <p className="font-medium text-gray-900">Accounts, library access, certificates, and admin uploads</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-950 text-white rounded-3xl shadow-sm p-8 sm:p-10">
          <h2 className="text-2xl font-semibold mb-4">Support promise</h2>
          <p className="text-blue-100 mb-6">
            CME Nexus is built to make professional learning easier to access, easier to track, and easier to verify.
          </p>
          <div className="space-y-3 text-sm">
            <p>Easy access. Anytime. Anywhere.</p>
            <p>Structured, searchable, and professional.</p>
            <p>Designed for healthcare education and accreditation workflows.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

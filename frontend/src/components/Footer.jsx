import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">

        {/* BRAND */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">
            CME Nexus
          </h2>
          <p className="text-gray-300 text-sm">
            Advancing clinical knowledge through structured continuous
            medical education.
          </p>
        </div>

        {/* NAVIGATION */}
        <div>
          <h3 className="text-white font-medium mb-3">
            Navigation
          </h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-cyan-400">Home</Link></li>
            <li><Link to="/library" className="hover:text-cyan-400">Library</Link></li>
            <li><Link to="/dashboard" className="hover:text-cyan-400">Dashboard</Link></li>
          </ul>
        </div>

        {/* RESOURCES */}
        <div>
          <h3 className="text-white font-medium mb-3">
            Resources
          </h3>
          <ul className="space-y-2">
            <li><Link to="/verify/sample" className="hover:text-cyan-400">Verify Certificate</Link></li>
            <li><span className="text-gray-400">Accreditation Info</span></li>
            <li><span className="text-gray-400">Help & Support</span></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-white font-medium mb-3">
            Contact
          </h3>
          <p className="text-gray-300 text-sm">
            Email: support@cmenexus.com
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Nairobi, Kenya
          </p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-blue-800 text-center py-4 text-xs sm:text-sm text-gray-400 px-4">
        © {new Date().getFullYear()} CME Nexus. All rights reserved.
      </div>
    </footer>
  );
}
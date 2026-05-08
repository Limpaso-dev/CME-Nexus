import { Link } from "react-router-dom";

export default function Footer() {
  const token = localStorage.getItem("token");

  return (
    <footer className="bg-blue-950 text-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h2 className="text-white font-semibold text-lg mb-3">CME Nexus</h2>
          <p className="text-gray-300 text-sm">
            Connecting knowledge. Advancing care through a structured archive of continuous medical education resources.
          </p>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3">Navigation</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-cyan-300">Home</Link></li>
            <li><Link to={token ? "/library" : "/register"} className="hover:text-cyan-300">Library</Link></li>
            <li><Link to={token ? "/dashboard" : "/register"} className="hover:text-cyan-300">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3">Platform</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-cyan-300">About</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-300">Contact</Link></li>
            {!token && (
              <li><Link to="/login" className="hover:text-cyan-300">Login</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3">Contact</h3>
          <p className="text-gray-300 text-sm">Email: support@cmenexus.com</p>
          <p className="text-gray-300 text-sm mt-1">Nairobi, Kenya</p>
         
        </div>
      </div>

      <div className="border-t border-blue-900 text-center py-4 text-xs sm:text-sm text-gray-400 px-4">
        © {new Date().getFullYear()} CME Nexus. All rights reserved.
      </div>
    </footer>
  );
}

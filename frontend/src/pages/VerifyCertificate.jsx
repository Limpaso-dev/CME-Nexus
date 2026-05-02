import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/certificate/verify/${id}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [id]);

  if (!data) {
    return <p className="p-6">Verifying...</p>;
  }

  if (!data.valid) {
    return <p className="p-6 text-red-500">Invalid Certificate</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white border rounded-3xl shadow-sm p-8 text-center">
        <p className="text-cyan-700 uppercase tracking-[0.22em] text-xs mb-3">Verification</p>
        <h1 className="text-2xl font-semibold mb-6">Certificate Verified</h1>
        <div className="space-y-3 text-sm sm:text-base">
          <p><strong>Name:</strong> {data.user}</p>
          <p><strong>Course:</strong> {data.content}</p>
          <p><strong>Issued:</strong> {new Date(data.issuedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

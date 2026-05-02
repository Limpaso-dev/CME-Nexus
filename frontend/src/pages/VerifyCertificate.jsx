import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/certificate/verify/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [id]);

  if (!data) return <p className="p-6">Verifying...</p>;

  if (!data.valid) {
    return <p className="p-6 text-red-500">Invalid Certificate</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-xl font-semibold mb-4">
        Certificate Verified
      </h1>

      <p className="mb-2"><strong>Name:</strong> {data.user}</p>
      <p className="mb-2"><strong>Course:</strong> {data.content}</p>
      <p className="mb-2">
        <strong>Issued:</strong>{" "}
        {new Date(data.issuedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
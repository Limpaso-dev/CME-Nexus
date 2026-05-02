import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";

// FRONTEND URL (SET IN .env)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const generateCertificate = async ({
  name,
  title,
  certificateId
}) => {
  const filePath = `./certificates/${certificateId}.pdf`;

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  // TITLE
  doc.fontSize(20).text("CME CERTIFICATE", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text("This certifies that", { align: "center" });
  doc.moveDown();

  doc.fontSize(18).text(name, { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(
    "has successfully completed the CME session:",
    { align: "center" }
  );
  doc.moveDown();

  doc.fontSize(16).text(title, { align: "center" });
  doc.moveDown(2);

  // ✅ CORRECT QR URL (FRONTEND VERIFY PAGE)
  const qrData = `${FRONTEND_URL}/verify/${certificateId}`;

  const qrImage = await QRCode.toDataURL(qrData);

  doc.image(qrImage, 250, 400, { width: 100 });

  // OPTIONAL: show verification link text
  doc.moveDown(4);
  doc.fontSize(10).text(
    `Verify: ${qrData}`,
    { align: "center" }
  );

  doc.end();

  return filePath;
};
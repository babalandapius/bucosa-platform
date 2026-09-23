import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateMembershipCard = async (student) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Standard ID Card Dimensions (Credit Card Size: 3.375" x 2.125" in points)
      const cardWidth = 243;
      const cardHeight = 153;

      const doc = new PDFDocument({
        size: [cardWidth, cardHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      // Output Directory Setup
      const outputDir = path.join(__dirname, '../uploads/cards');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = `card_${student.student_id.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const filePath = path.join(outputDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Colors
      const BRAND_BLUE = '#0B5DA7';
      const BRAND_GOLD = '#FFDE00';
      const TEXT_DARK = '#0F172A';

      // 1. Header Banner
      doc.rect(0, 0, cardWidth, 32).fill(BRAND_BLUE);
      doc.rect(0, 32, cardWidth, 3).fill(BRAND_GOLD);

      // 2. Draw BUCoSA Logo
      const logoPath = path.join(__dirname, '../uploads/assets/bucosa_logo.jpg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 5, 3, { width: 26, height: 26 });
      }

      // 3. Header Text
      doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold').text('BUSITEMA UNIVERSITY', 34, 5);
      doc.fillColor(BRAND_GOLD).fontSize(5.5).text('COMPUTING STUDENTS ASSOCIATION', 34, 13);
      doc.fillColor('#FFFFFF').fontSize(4.5).font('Helvetica-Oblique').text('"The Engine of Innovation"', 34, 20);

      // 4. Member ID Bar
      doc.fillColor(BRAND_BLUE).fontSize(6).font('Helvetica-Bold').text('OFFICIAL MEMBERSHIP CARD', 10, 40);
      doc.fillColor('#64748B').fontSize(5).text(`ID: ${student.membership_id}`, 10, 48);

      // 5. Student Details
      const labelsY = 58;
      doc.fillColor('#475569').fontSize(5.5).font('Helvetica-Bold');
      doc.text('NAME:', 10, labelsY);
      doc.text('REG NO:', 10, labelsY + 10);
      doc.text('PROGRAMME:', 10, labelsY + 20);
      doc.text('YEAR:', 10, labelsY + 30);

      doc.fillColor(TEXT_DARK).fontSize(5.5).font('Helvetica-Bold');
      doc.text(student.full_name.toUpperCase(), 50, labelsY, { width: 120 });
      doc.text(student.student_id, 50, labelsY + 10);
      doc.text(student.course, 50, labelsY + 20, { width: 120 });
      doc.text(`Year ${student.year_of_study}`, 50, labelsY + 30);

      // 6. Generate Dynamic QR Code
      const qrData = JSON.stringify({
        association: 'BUCoSA',
        member_id: student.membership_id,
        student_id: student.student_id,
        name: student.full_name,
        verified: true,
      });

      const qrBuffer = await QRCode.toBuffer(qrData, {
        margin: 1,
        color: { dark: '#0B5DA7', light: '#FFFFFF' },
      });

      doc.image(qrBuffer, cardWidth - 60, 45, { width: 50, height: 50 });

      // 7. Footer Bar
      doc.rect(0, cardHeight - 12, cardWidth, 12).fill(BRAND_BLUE);
      doc.fillColor('#FFFFFF').fontSize(4.5).font('Helvetica').text('Faculty of Science & Education', 10, cardHeight - 8);
      doc.fillColor(BRAND_GOLD).fontSize(4.5).text('AY 2025/2026', cardWidth - 50, cardHeight - 8);

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/cards/${fileName}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
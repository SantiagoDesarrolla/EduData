const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const ReportGeneratorService = {
  async generatePDF(title, data) {
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    const filePath = path.join(reportsDir, `${title}_${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('EduData - Reporte Analítico', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Título: ${title}`);
    doc.moveDown();

    data.forEach((item) => {
      doc.fontSize(10).text(JSON.stringify(item));
      doc.moveDown();
    });

    doc.end();
    return new Promise((resolve) => stream.on('finish', () => resolve(filePath)));
  },

  async generateCSV(title, data) {
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    const filePath = path.join(reportsDir, `${title}_${Date.now()}.csv`);
    const parser = new Parser();
    const csv = parser.parse(data);
    fs.writeFileSync(filePath, csv);
    return filePath;
  },
};

module.exports = ReportGeneratorService;

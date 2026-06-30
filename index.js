const express = require('express');
const { PDFDocument, rgb } = require('pdf-lib');
const multer = require('multer'); // Library untuk handle upload file
const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server PDF Fery Berhasil Jalan!');
});

// Ubah endpoint agar menerima upload file dengan nama field "pdfFile"
app.post('/api/edit-pdf', upload.single('pdfFile'), async (req, res) => {
    try {
        const { teksBaru, x, y, fontSize } = req.body;
        
        // Cek apakah ada file yang di-upload
        if (!req.file || !teksBaru) {
            return res.status(400).json({ error: 'File PDF dan teksBaru wajib diisi' });
        }

        // 1. Ambil file PDF langsung dari memory server
        const existingPdfBytes = req.file.buffer;

        // 2. Load dokumen ke pdf-lib
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // 3. Timpa teks sesuai koordinat
        firstPage.drawText(teksBaru, {
            x: parseFloat(x) || 100,
            y: parseFloat(y) || 100,
            size: parseFloat(fontSize) || 20,
            color: rgb(0, 0, 0)
        });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=hasil_edit.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server aktif di port ${PORT}`));

module.exports = app;

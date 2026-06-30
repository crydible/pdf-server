const express = require('express');
const { PDFDocument, rgb } = require('pdf-lib');
const app = express();

// Supaya server bisa membaca data text/JSON yang dikirim dari web tampilan (frontend)
app.use(express.json());

// Endpoint Utama untuk tes apakah server Vercel sudah aktif atau belum
app.get('/', (req, res) => {
    res.send('Server PDF Fery Berhasil Jalan!');
});

// Endpoint Inti untuk memproses edit PDF berdasarkan koordinat
app.post('/api/edit-pdf', async (req, res) => {
    try {
        // Mengambil data yang dikirim oleh web frontend
        const { pdfUrl, teksBaru, x, y, fontSize } = req.body;

        // Validasi dasar, pastikan URL PDF dan Teks tidak kosong
        if (!pdfUrl || !teksBaru) {
            return res.status(400).json({ error: 'Data pdfUrl dan teksBaru wajib diisi' });
        }

        // 1. Download file PDF template secara online dari URL yang diberikan
        const responsePdf = await fetch(pdfUrl);
        if (!responsePdf.ok) throw new Error('Gagal mengunduh file PDF template');
        const existingPdfBytes = await responsePdf.arrayBuffer();

        // 2. Load dokumen PDF tersebut ke dalam library pdf-lib
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0]; // Mengedit halaman pertama

        // 3. Proses menimpa teks baru ke atas PDF sesuai koordinat X dan Y
        // Jika koordinat X atau Y tidak dikirim, maka otomatis pakai angka 100
        firstPage.drawText(teksBaru, {
            x: parseFloat(x) || 100,
            y: parseFloat(y) || 100,
            size: parseFloat(fontSize) || 20, // Ukuran font default 20
            color: rgb(0, 0, 0) // Warna teks hitam
        });

        // 4. Simpan hasil edit PDF ke dalam bentuk buffer data
        const pdfBytes = await pdfDoc.save();

        // 5. Kirimkan file PDF hasil edit langsung kembali ke user untuk di-download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=hasil_edit.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        // Jika ada error di tengah jalan, kirim pesan errornya ke log browser
        res.status(500).json({ error: error.message });
    }
});

// Settingan port otomatis agar bisa dibaca oleh server cloud Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server aktif di port ${PORT}`));

module.exports = app;

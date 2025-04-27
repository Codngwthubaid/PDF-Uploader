import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config()

const myQueue = new Queue('file-upload-queue', {
    connection: {
        host: 'localhost',
        port: 6379,
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
})


const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    await myQueue.add("file-ready", JSON.stringify({
        fileName: req.file.originalname,
        destination: req.file.destination,
        filePath: req.file.path,
    }))
    res.send("PDF file uploading place.");

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send(`File uploaded successfully: ${req.file.originalname}`);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


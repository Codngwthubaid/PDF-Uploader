import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { QdrantVectorStore } from '@langchain/qdrant';
import { CohereEmbeddings } from '@langchain/cohere';
import { CohereClient } from 'cohere-ai';

dotenv.config()

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

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


app.get("/chat", async (req, res) => {
    const userQuery = "Tell me the important events of Ali's Caliphate in brief ?"
    const embeddings = new CohereEmbeddings({
        model: "embed-english-v3.0"
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: "langchainjs-testing",
    });

    const retriever = vectorStore.asRetriever({
        k: 2,
    });
    const result = await retriever.invoke(userQuery);
    const SYSTEM_PROMPT = `You are an advanced, precision-driven assistant tasked with providing authoritative, contextually grounded responses. For every interaction, you will be presented with a question and a curated body of context. Your objective is to deliver a clear, accurate, and logically structured answer derived exclusively from the provided context, without incorporating external information, assumptions, or speculation. Maintain a consistently professional, articulate, and concise tone, ensuring your responses reflect critical understanding, relevance, and the highest standards of quality. Context: ${JSON.stringify(result)}`


    const response = await cohere.chat({
        model: "command-a-03-2025",
        message: userQuery,
        system_prompt: SYSTEM_PROMPT,
    });

    const chatResponse = response.text;
    console.log(chatResponse)


    return res.json({ chatResponse });
})




const port = process.env.PORT || 5000;
app.listen(port, () => { console.log(`Server running at port : http://localhost:${port}`) });


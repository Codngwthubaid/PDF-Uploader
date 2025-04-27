import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import dotenv from 'dotenv';

dotenv.config()

const myWorker = new Worker('file-upload-queue', async (job) => {
    console.log(job.data)
    const data = JSON.parse(job.data)


    const loader = new PDFLoader(data.filePath);
    const docs = await loader.load();
    console.log("Docs :", docs)


    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-large"
    });
    console.log("OpenAI API Key :", process.env.OPENAI_API_KEY)
    console.log("Qdrant URL :", process.env.QDRANT_URL)

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: "langchainjs-testing",
    });

    await vectorStore.addDocuments(docs);
    console.log("File uploaded and indexed successfully.")

}, {
    concurrency: 100,
    connection: {
        host: 'localhost',
        port: 6379,
    },
})





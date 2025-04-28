import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from '@langchain/cohere';
import dotenv from "dotenv"

dotenv.config()

const myWorker = new Worker('file-upload-queue', async (job) => {
  try {
    console.log(job.data)
    const data = JSON.parse(job.data)

    const loader = new PDFLoader(data.filePath);
    const docs = await loader.load();
    console.log("Docs:", docs)

    const embeddings = new CohereEmbeddings({
      model: "embed-english-v3.0"
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "langchainjs-testing",
    });

    await vectorStore.addDocuments(docs);
    console.log("File uploaded and indexed successfully.")
  } catch (error) {
    console.error("Error while processing the job:", error)
  }
}, {
  concurrency: 100,
  connection: {
    host: 'localhost',
    port: 6379,
  },
});



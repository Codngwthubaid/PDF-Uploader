"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UserButton } from "@clerk/nextjs";
import { Upload, Brain, Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";


interface Doc {
    pageContent?: string;
    metdata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}

interface IMessage {
    role: "assistant" | "user" | "loading" | "pdf";
    content?: string;
    document?: Doc[];
}

export default function ChatPortion() {
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [uploaded, setUploaded] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string>("");

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            if (file.type !== "application/pdf") {
                setFileError("Only PDF files are allowed.");
                return;
            }

            setFileError("");
            const formData = new FormData();
            formData.append("pdf", file);
            setUploaded(true);

            try {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/pdf`, formData, {
                    headers: {
                        "Content-Type": "application/pdf",
                        "Accept": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
                setUploaded(true);
                setMessages((prev) => [{ role: "pdf", content: `${file?.name} uploaded successfully` }, ...prev]);
            } catch (error) {
                console.error("File upload error:", error);
            } finally {
                setUploaded(false);
            }
        }
    };

    const handleSendChatMessage = async () => {
        if (!message.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: message }]);
        setMessages((prev) => [...prev, { role: "loading", content: "Thinking..." }]);

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat?message=${message}`);
            const data = await response.data;

            setMessages((prev) => [
                ...prev.filter((msg) => msg.role !== "loading"),
                { role: "assistant", content: data?.message, document: data?.doc },
            ]);
        } catch (error) {
            console.error("Error fetching chat response:", error);
            setMessages((prev) => [
                ...prev.filter((msg) => msg.role !== "loading"),
                { role: "assistant", content: "Sorry, something went wrong." },
            ]);
        }

        setMessage("");
    };

    return (
        <div className="p-4 pb-36 max-w-screen-xl mx-auto">
            {uploaded && (
                <div className="flex justify-center items-center my-4">
                    <Loader className="w-8 h-8 mr-2 animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                </div>
            )}
            {fileError && (
                <div className="text-red-600 text-sm text-center mt-2">
                    {fileError}
                </div>
            )}
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex gap-x-4 my-2 ${message.role === "assistant" ? "justify-start" : "justify-end"} flex-wrap`}
                >
                    <div className="flex-shrink-0 flex items-center">
                        {message.role === "user" && <UserButton />}
                        {message.role === "assistant" && <Brain className="size-10 ml-3 bg-gradient-to-r from-blue-950 to-gray-300 border border-gray-700 p-1 rounded-full text-" />}
                        {message.role === "loading" && (<Loader className="w-8 h-8 mr-2 animate-spin" />)}
                        {message.role === "pdf" && (<div className="text-blue-500 font-semibold text-sm">📄 PDF Uploaded</div>)}
                    </div>

                    <div
                        className={`w-full sm:w-fit p-3 rounded-md ${message.role === "assistant" ? "h-fit overflow-y-auto" : ""
                            }`}
                    >
                        <ReactMarkdown>{message.content || ""}</ReactMarkdown>
                    </div>

                </div>

            ))}

            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 p-4 shadow-md z-10">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-screen-lg mx-auto">
                    <div className="flex items-center gap-3 w-full">
                        <label htmlFor="file" className="cursor-pointer">
                            <Upload className="size-9 p-2 rounded-md border border-gray-400 text-gray-500" />
                        </label>
                        <Input type="file" id="file" className="hidden" onChange={handleFileChange} />

                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here"
                            className="flex-1 w-full"
                        />

                    </div>
                    <Button
                        onClick={handleSendChatMessage}
                        disabled={!message.trim()}
                        className="w-full sm:w-auto cursor-pointer"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}

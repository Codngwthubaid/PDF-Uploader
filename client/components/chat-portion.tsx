"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UserButton } from "@clerk/nextjs";
import { Upload, Bot } from "lucide-react";
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

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("pdf", file);

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
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex gap-x-4 my-2 ${message.role === "assistant" ? "justify-start" : "justify-end"} flex-wrap`}
                >
                    <div className="flex-shrink-0 flex flex-col items-center">
                        {message.role === "user" && <UserButton />}
                        {message.role === "assistant" && <Bot />}
                        {message.role === "loading" && (
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        )}
                        {message.role === "pdf" && (
                            <div className="text-blue-500 font-semibold text-sm">📄 PDF Uploaded</div>
                        )}
                    </div>

                    <div
                        className={`w-full sm:w-[80%] md:w-[70%] lg:w-[60%] border border-gray-700 p-3 rounded-md ${message.role === "assistant" ? "max-h-80 overflow-y-auto" : ""
                            }`}
                    >
                        <ReactMarkdown>{message.content || ""}</ReactMarkdown>
                    </div>

                </div>

            ))}

            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 p-4 shadow-md z-10">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-screen-lg mx-auto">
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

                    <Button
                        onClick={handleSendChatMessage}
                        disabled={!message.trim()}
                        className="w-full sm:w-auto"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}

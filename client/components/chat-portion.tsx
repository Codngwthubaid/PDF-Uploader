"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { UserButton } from "@clerk/nextjs";
import { Upload, Bot } from "lucide-react";

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
        console.log(file)
        if (file) {
            const formData = new FormData();
            formData.append("pdf", file);

            try {
                await axios.post("http://localhost:5000/upload/pdf", formData, {
                    headers: {
                        "Content-Type": "application/pdf",
                        "Accept": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
                console.log("File uploaded successfully");
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
            const response = await axios.get(`http://localhost:5000/chat?message=${message}`);
            const data = await response.data;

            setMessages((prev) => [
                ...prev.filter((msg) => msg.role !== "loading"),
                { role: "assistant", content: data?.message, document: data?.doc },
            ]);

            console.log("Response:", data);
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
        <div className="p-4">
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex items-start gap-x-4 my-2 ${message.role === "assistant" ? "justify-start" : "justify-end"
                        }`}
                >
                    <div className="flex-shrink-0">
                        {message.role === "user" && <UserButton />}
                        {message.role === "assistant" && <Bot />}
                        <div className="flex flex-col justify-center items-center">
                            {message.role === "loading" && (
                                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                            )}
                            {message.role === "pdf" && (
                                <div className="text-blue-500 font-semibold">📄 PDF Uploaded</div>
                            )}
                        </div>
                    </div>

                    <div className="w-[60%] border border-gray-700 p-4 rounded-md overflow-y-auto">
                        {message.content}
                    </div>
                </div>
            ))}

            <div className="fixed bottom-12 w-[80vw] flex items-center justify-center gap-5">
                <div>
                    <label htmlFor="file" className="cursor-pointer">
                        <Upload className="size-9 p-2 rounded-md border border-gray-400 text-gray-500" />
                    </label>
                    <Input type="file" id="file" className="hidden" onChange={handleFileChange} />
                </div>

                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here"
                />
                <Button
                    onClick={handleSendChatMessage}
                    disabled={!message.trim()}
                    className="cursor-pointer"
                >
                    Send
                </Button>
            </div>
        </div>
    );
}

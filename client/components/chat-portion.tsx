import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";


interface Doc {
    pageContent?: string,
    metdata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}

interface IMessage {
    role: 'assistant' | 'user',
    content?: string,
    document?: Doc[],
}

export default function ChatPortion() {

    const [message, setMessage] = useState<string>("");
    console.log("Sending message:", message);
    const [messages, setMessages] = useState<IMessage[]>([]);
    console.log("All Messages:", messages);

    const handleSendChatMessage = async () => {
        setMessages((prev) => [...prev, { role: "user", content: message }]);
        const response = await axios.get(`http://localhost:5000/chat?message=${message}`)
        const data = await response.data;
        setMessages((prev) => [...prev, { role: "assistant", content: data?.message, document: data?.docs }]);
        console.log("Response:", data);
    }
    return (
        <div className="p-4">
            {messages.map((message, index) => {
                return (
                    <div key={index} className={`flex ${message.role === "assistant" ? "flex-row-reverse" : ""}`}>
                        <div className="w-[60%] border border-gray-700 p-4">
                            {message.content}
                        </div>
                    </div>
                );
            })}
            <div className="fixed bottom-8 w-[60vw] flex items-center justify-center gap-3">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here"
                />
                <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
                    Send
                </Button>
            </div>
        </div>
    )
}
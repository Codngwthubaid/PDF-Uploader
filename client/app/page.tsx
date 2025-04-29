"use client"

import { UploadFile } from "@/components/upload-file"
import ChatPortion from "@/components/chat-portion"

export default function App() {
  return (
    <div className="w-[95vw] border border-gray-700 h-[85vh] mx-auto p-5 rounded-md">
      <ChatPortion />
    </div>
  )
}
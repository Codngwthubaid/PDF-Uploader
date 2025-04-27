"use client"

import { UploadFile } from "@/components/upload-file"

export default function App() {
  return (
    <div className="m-4 flexBlock h-[calc(100vh-100px)]">
      <div className="w-[30%] border border-gray-700 h-full flexBlock"><UploadFile /></div>
      <div className="w-[70%] border border-gray-700 h-full flexBlock">2</div>
    </div>
  )
}
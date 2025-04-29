"use client"

import ChatPortion from "@/components/chat-portion"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { ModeToggle } from "@/components/toggle-mode"

export default function App() {
  return (
    <div>
      <header className="flex justify-start items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <h1 className="text-2xl font-bold">PDF Uploader</h1>
          <UserButton />
          <ModeToggle />
        </SignedIn>
      </header>
      <div className="w-[95vw] border border-gray-700 h-[85vh] mx-auto p-5 rounded-md">
        <ChatPortion />
      </div>
    </div>
  )
}
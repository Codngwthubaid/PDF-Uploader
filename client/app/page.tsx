"use client"

import ChatPortion from "@/components/chat-portion"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { ModeToggle } from "@/components/toggle-mode"

export default function App() {
  return (
    <div>
      <header className="flex justify-start items-center p-8 gap-4 h-16">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold">PDF Uploader</h1>
            <div className="flex gap-x-3">
              <UserButton />
              <ModeToggle />
            </div>
          </div>
        </SignedIn>
      </header >
      <div className="w-[95vw] h-fit mx-auto p-5">
        <ChatPortion />
      </div>
    </div >
  )
}
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ambil pesan dari DB
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data);
    }
    load();
  }, []);

  // kirim pesan baru
  async function sendMessage() {
    if (!text.trim()) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: session.user.name,
        email: session.user.email,
        text,
      }),
    });
    const newMsg = await res.json();
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  }

  return (
    <main className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-2 font-semibold">
        Chit-Chat v2
      </header>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-100">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              m.email === session.user.email ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                m.email === session.user.email
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <div className="text-xs opacity-70 mb-1">{m.sender}</div>
              <div>{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* input form */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Tulis pesan..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-1 bg-green-600 text-white rounded"
        >
          Kirim
        </button>
      </div>
    </main>
  );
}

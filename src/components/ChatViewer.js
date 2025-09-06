"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import ChatBubble from "./ChatBubble";

// 🔑 parser multi-format
function parseLine(line) {
  // Format 1: Android (EN/ID) → "8/26/25, 6:42 AM - Nama: Pesan"
  let match = line.match(/^(\d{1,2}\/\d{1,2}\/\d{2,4}), (.*?) - (.*?): (.*)$/);
  if (match) {
    return {
      date: match[1],
      time: match[2],
      sender: match[3],
      text: match[4],
    };
  }

  // Format 2: Indo (24 jam, titik) → "17/04/22 03.46 - Nama: Pesan"
  match = line.match(
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}) (\d{1,2}\.\d{2}) - (.*?): (.*)$/
  );
  if (match) {
    return {
      date: match[1],
      time: match[2],
      sender: match[3],
      text: match[4],
    };
  }

  // Format 3: iOS style → "[26/08/25, 06:42:01] Nama: Pesan"
  match = line.match(
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\] (.*?): (.*)$/
  );
  if (match) {
    return {
      date: match[1],
      time: match[2],
      sender: match[3],
      text: match[4],
    };
  }

  return null; // kalau ga cocok format apapun
}

export default function ChatViewer() {
  const [messages, setMessages] = useState([]);
  const [names, setNames] = useState([]);
  const [selfName, setSelfName] = useState("");

  // ⬇️ load data dari MongoDB saat buka /viewer
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        setMessages(data);

        const nameSet = new Set(data.map((m) => m.sender));
        setNames([...nameSet]);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    }
    loadMessages();
  }, []);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n");
      const parsed = [];
      const nameSet = new Set();

      for (let line of lines) {
        const parsedLine = parseLine(line);
        if (parsedLine) {
          parsed.push(parsedLine);
          nameSet.add(parsedLine.sender);
        }
      }

      setMessages(parsed);
      setNames([...nameSet]);

      // ⬇️ kirim ke MongoDB
      fetch("/api/messages/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Imported:", data);
          alert(`✅ Berhasil import ${data.inserted} chat ke database`);
        })
        .catch((err) => console.error("Import error:", err));
    };
    reader.readAsText(file, "UTF-8");
  }

  return (
    <div className="flex flex-col h-screen">
      {/* header */}
      <div className="bg-green-600 text-white px-4 py-2 font-semibold flex justify-between items-center">
        <span>Chit-Chat v2</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* upload file + pilih user */}
      <div className="p-3 border-b flex gap-3 items-center">
        <input type="file" accept=".txt" onChange={handleFile} />
        {names.length > 0 && (
          <select
            className="border px-2 py-1 rounded"
            value={selfName}
            onChange={(e) => setSelfName(e.target.value)}
          >
            <option value="">Pilih saya</option>
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-100">
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} isSelf={m.sender === selfName} />
        ))}
      </div>
    </div>
  );
}

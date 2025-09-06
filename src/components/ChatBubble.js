export default function ChatBubble({ msg, isSelf }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg shadow text-sm mb-1 ${
          isSelf ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <div className="text-xs opacity-70 mb-1">
          {msg.sender} • {msg.time}
        </div>
        <div>{msg.text}</div>
      </div>
    </div>
  );
}

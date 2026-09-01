import React, { useEffect, useState } from "react";

export default function MessageBox({ user }) {
  const [messages, setMessages] = useState([]);
  const [toEmail, setToEmail] = useState("");
  const [text, setText] = useState("");

  const fetchMessages = async () => {
    const res = await fetch(`http://localhost:5001/messages/${user._id}`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!toEmail || !text) return alert("Fill both fields");
    const res = await fetch("http://localhost:5001/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user._id, to: toEmail, text }),
    });
    await res.json();
    setText("");
    fetchMessages();
  };

  return (
    <div style={container}>
      <h2>Messages</h2>
      <div style={messageList}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.from._id === user._id ? sentMsg : receivedMsg}>
            <b>{msg.from.name}</b>: {msg.text}
          </div>
        ))}
      </div>

      <input
        placeholder="Recipient user ID"
        value={toEmail}
        onChange={(e) => setToEmail(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="Message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={textareaStyle}
      />
      <button onClick={sendMessage} style={buttonStyle}>Send</button>
    </div>
  );
}

const container = { border: "1px solid #ccc", padding: 15, borderRadius: 8, marginTop: 20 };
const messageList = { maxHeight: 200, overflowY: "auto", marginBottom: 10 };
const sentMsg = { background: "#DCF8C6", padding: 5, borderRadius: 5, marginBottom: 5, textAlign: "right" };
const receivedMsg = { background: "#FFF", padding: 5, borderRadius: 5, marginBottom: 5 };
const inputStyle = { width: "100%", padding: 8, marginBottom: 5 };
const textareaStyle = { width: "100%", padding: 8, marginBottom: 5, height: 60 };
const buttonStyle = { padding: "8px 15px", background: "#2196F3", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" };

// src/pages/MessageBox.jsx
import React, { useEffect, useState } from "react";

export default function MessageBox({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [to, setTo] = useState(""); // recipient user ID

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    const res = await fetch(`http://localhost:5001/messages/${user._id}`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!to || !text) return alert("Fill all fields");
    const res = await fetch("http://localhost:5001/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user._id, to, text }),
    });
    const data = await res.json();
    alert(data.message);
    setText(""); setTo("");
    fetchMessages();
  };

  return (
    <div>
      <h2>Messages</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>Send Message</h3>
        <input placeholder="Recipient ID" value={to} onChange={e => setTo(e.target.value)} /><br/>
        <input placeholder="Message" value={text} onChange={e => setText(e.target.value)} /><br/>
        <button onClick={sendMessage}>Send</button>
      </div>

      <div>
        <h3>Inbox</h3>
        {messages.map(msg => (
          <div key={msg._id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <strong>From: {msg.from?.name}</strong><br/>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}

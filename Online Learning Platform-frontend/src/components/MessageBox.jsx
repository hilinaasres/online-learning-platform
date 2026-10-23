import React, { useEffect, useState } from "react";
import { api, asArray } from "../api/client";

export default function MessageBox({ user }) {
  const [messages, setMessages] = useState([]);
  const [toUserId, setToUserId] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      try {
        const data = await api(`/messages/${user._id}`);
        if (active) {
          setMessages(asArray(data));
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load messages.");
      }
    };

    void loadMessages();
    const interval = setInterval(() => void loadMessages(), 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user._id]);

  const sendMessage = async () => {
    if (!toUserId || !text.trim()) {
      setError("Choose a recipient and enter a message.");
      return;
    }

    try {
      await api("/message", {
        method: "POST",
        body: { from: user._id, to: toUserId, text: text.trim() },
      });
      setText("");
      setError("");
      const data = await api(`/messages/${user._id}`);
      setMessages(asArray(data));
    } catch (err) {
      setError(err.message || "Could not send message.");
    }
  };

  return (
    <div style={container}>
      <h2>Messages</h2>
      {error && <p role="alert">{error}</p>}
      <div style={messageList}>
        {messages.map((msg) => (
          <div key={msg._id} style={msg.from?._id === user._id ? sentMsg : receivedMsg}>
            <b>{msg.from?.name}</b>: {msg.text}
          </div>
        ))}
      </div>

      <input
        placeholder="Recipient user ID"
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="Message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={textareaStyle}
      />
      <button type="button" onClick={sendMessage} style={buttonStyle}>Send</button>
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

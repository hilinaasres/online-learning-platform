import React, { useEffect, useState } from "react";
import { api, asArray } from "../api/client";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [toUserId, setToUserId] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/users")
      .then((data) => {
        if (active) setUsers(asArray(data));
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load recipients.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      try {
        const data = await api(`/messages/${user._id}`);
        if (active) setMessages(asArray(data));
      } catch (err) {
        if (active) setError(err.message || "Could not load messages.");
      }
    };

    void loadMessages();
    const interval = setInterval(() => void loadMessages(), 3000);
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
        body: { to: toUserId, text: text.trim() },
      });
      setText("");
      setError("");
    } catch (err) {
      setError(err.message || "Could not send message.");
    }
  };

  return (
    <div style={container}>
      <h2>Messages</h2>
      {error && <p role="alert">{error}</p>}
      <div style={messageList}>
        {messages
          .slice()
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((msg) => (
            <div key={msg._id} style={msg.from?._id === user._id ? sentMsg : receivedMsg}>
              <b>{msg.from?.name}</b>: {msg.text}
            </div>
          ))}
      </div>

      <select value={toUserId} onChange={(e) => setToUserId(e.target.value)} style={inputStyle}>
        <option value="">Select recipient</option>
        {users
          .filter((u) => u._id !== user._id)
          .map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.role})
            </option>
          ))}
      </select>

      <textarea
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={textareaStyle}
      />
      <button type="button" onClick={sendMessage} style={buttonStyle}>Send</button>
    </div>
  );
}

const container = {
  border: "1px solid #ccc",
  padding: 15,
  borderRadius: 8,
  marginTop: 20,
  maxWidth: 500,
};
const messageList = {
  maxHeight: 300,
  overflowY: "auto",
  marginBottom: 10,
  border: "1px solid #ddd",
  padding: 10,
  borderRadius: 5,
  background: "#f9f9f9",
};
const sentMsg = {
  background: "#DCF8C6",
  padding: 5,
  borderRadius: 5,
  marginBottom: 5,
  textAlign: "right",
};
const receivedMsg = {
  background: "#FFF",
  padding: 5,
  borderRadius: 5,
  marginBottom: 5,
};
const inputStyle = { width: "100%", padding: 8, marginBottom: 5 };
const textareaStyle = { width: "100%", padding: 8, marginBottom: 5, height: 60 };
const buttonStyle = {
  padding: "8px 15px",
  background: "#2196F3",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

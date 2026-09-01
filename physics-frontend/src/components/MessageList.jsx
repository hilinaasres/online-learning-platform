import React, { useEffect, useState } from "react";

export default function MessageBox({ user }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [toUserId, setToUserId] = useState("");
  const [text, setText] = useState("");

  // Fetch all users for dropdown
  useEffect(() => {
    fetch("http://localhost:5001/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  // Fetch messages periodically
  const fetchMessages = async () => {
    const res = await fetch(`http://localhost:5001/messages/${user._id}`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // refresh every 3s
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!toUserId || !text) return alert("Choose a user and type message");
    await fetch("http://localhost:5001/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user._id, to: toUserId, text }),
    });
    setText("");
    fetchMessages();
  };

  return (
    <div style={container}>
      <h2>Messages</h2>
      <div style={messageList}>
        {messages
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map((msg, idx) => (
            <div
              key={idx}
              style={msg.from._id === user._id ? sentMsg : receivedMsg}
            >
              <b>{msg.from.name}</b>: {msg.text}
            </div>
          ))}
      </div>

      <select
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
        style={inputStyle}
      >
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
      <button onClick={sendMessage} style={buttonStyle}>
        Send
      </button>
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

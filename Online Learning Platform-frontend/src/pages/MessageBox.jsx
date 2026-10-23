import React, { useEffect, useState } from "react";
import { api, asArray } from "../api/client";

export default function MessageBox({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
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
    return () => {
      active = false;
    };
  }, [user._id]);

  const sendMessage = async () => {
    if (!to || !text) {
      setError("Fill all fields");
      return;
    }
    try {
      await api("/message", { method: "POST", body: { from: user._id, to, text } });
      setText("");
      setTo("");
      setError("");
      const data = await api(`/messages/${user._id}`);
      setMessages(asArray(data));
    } catch (err) {
      setError(err.message || "Could not send message.");
    }
  };

  return (
    <div>
      <h2>Messages</h2>
      {error && <p className="auth-message error">{error}</p>}

      <div style={{ marginBottom: 20 }}>
        <h3>Send Message</h3>
        <input placeholder="Recipient ID" value={to} onChange={(e) => setTo(e.target.value)} /><br />
        <input placeholder="Message" value={text} onChange={(e) => setText(e.target.value)} /><br />
        <button type="button" onClick={sendMessage}>Send</button>
      </div>

      <div>
        <h3>Inbox</h3>
        {messages.map((msg) => (
          <div key={msg._id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <strong>From: {msg.from?.name}</strong><br />
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/Notes.jsx
import React, { useEffect, useState } from "react";

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch("http://localhost:5001/notes");
    const data = await res.json();
    setNotes(data);
  };

  const uploadNote = async () => {
    if (!title || !description || !fileUrl) return alert("Fill all fields");
    const res = await fetch("http://localhost:5001/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, fileUrl, teacherId: user._id }),
    });
    const data = await res.json();
    alert(data.message);
    setTitle(""); setDescription(""); setFileUrl("");
    fetchNotes();
  };

  return (
    <div>
      <h2>Notes</h2>

      {user.role === "Teacher" && (
        <div style={{ marginBottom: 20 }}>
          <h3>Upload Note</h3>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br/>
          <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} /><br/>
          <input placeholder="File URL" value={fileUrl} onChange={e => setFileUrl(e.target.value)} /><br/>
          <button onClick={uploadNote}>Upload</button>
        </div>
      )}

      <div>
        <h3>All Notes</h3>
        {notes.map(note => (
          <div key={note._id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <strong>{note.title}</strong> by {note.uploadedBy?.name}<br/>
            {note.description}<br/>
            <a href={note.fileUrl} target="_blank" rel="noreferrer">View File</a>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { api, asArray, isStaffRole } from "../api/client";

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadNotes = async () => {
      try {
        const data = await api("/notes");
        if (active) {
          setNotes(asArray(data));
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load notes.");
      }
    };

    void loadNotes();
    return () => {
      active = false;
    };
  }, []);

  const uploadNote = async () => {
    if (!title || !description || !fileUrl) {
      setError("Fill all fields");
      return;
    }
    try {
      await api("/notes", {
        method: "POST",
        body: { title, description, fileUrl, instructorId: user._id },
      });
      setTitle("");
      setDescription("");
      setFileUrl("");
      setError("");
      setNotes(asArray(await api("/notes")));
    } catch (err) {
      setError(err.message || "Could not upload the note.");
    }
  };

  return (
    <div>
      <h2>Notes</h2>
      {error && <p className="auth-message error">{error}</p>}

      {isStaffRole(user.role) && (
        <div style={{ marginBottom: 20 }}>
          <h3>Upload Note</h3>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} /><br />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><br />
          <input placeholder="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} /><br />
          <button type="button" onClick={uploadNote}>Upload</button>
        </div>
      )}

      <div>
        <h3>All Notes</h3>
        {notes.length === 0 ? <p>No notes available.</p> : notes.map((note) => (
          <div key={note._id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <strong>{note.title}</strong> by {note.uploadedBy?.name}<br />
            {note.description}<br />
            <a href={note.fileUrl} target="_blank" rel="noreferrer">View File</a>
          </div>
        ))}
      </div>
    </div>
  );
}

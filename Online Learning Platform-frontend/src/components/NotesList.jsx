import React from "react";

export default function NotesList({ notes }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Notes</h2>
      {notes.length === 0 ? (
        <p>No notes available.</p>
      ) : (
        notes.map((note) => (
          <div key={note._id} style={cardStyle}>
            <h3>{note.title}</h3>
            <p>{note.description}</p>
            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: 15,
  borderRadius: 8,
  marginBottom: 10,
};

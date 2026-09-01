import React from "react";

export default function GradeDrawer({ open, onClose, student, onSave, grade }) {
  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="grade-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Enter grade for {student?.name || "Student"}</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          <label>
            Assignment / Quiz
            <input placeholder="Assignment title" id="grade-title" />
          </label>

          <label>
            Score
            <input placeholder="Score (number)" id="grade-score" type="number" />
          </label>

          <label>
            Max Score
            <input placeholder="Max score" id="grade-max" type="number" />
          </label>
        </div>

        <div className="drawer-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              const title = document.getElementById("grade-title").value || "Assignment";
              const score = Number(document.getElementById("grade-score").value || 0);
              const maxScore = Number(document.getElementById("grade-max").value || 100);
              onSave({ title, score, maxScore });
            }}
          >
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
}

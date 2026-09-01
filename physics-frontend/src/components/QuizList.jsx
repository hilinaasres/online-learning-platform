import React from "react";

export default function QuizList({ quizzes, submitQuiz }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz._id} style={cardStyle}>
            <h3>{quiz.title}</h3>
            <button onClick={() => submitQuiz(quiz)}>Take Quiz</button>
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

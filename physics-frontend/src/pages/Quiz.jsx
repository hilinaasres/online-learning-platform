// src/pages/Quiz.jsx
import React, { useEffect, useState } from "react";

export default function Quiz({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ question: "", correctAnswer: "" }]);
  const [answers, setAnswers] = useState({}); // student answers
  const [score, setScore] = useState(null);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    const res = await fetch("http://localhost:5001/quiz");
    const data = await res.json();
    setQuizzes(data);
  };

  const createQuiz = async () => {
    if (!title || questions.some(q => !q.question || !q.correctAnswer)) return alert("Fill all fields");
    const res = await fetch("http://localhost:5001/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, questions, teacherId: user._id }),
    });
    const data = await res.json();
    alert(data.message);
    setTitle(""); setQuestions([{ question: "", correctAnswer: "" }]);
    fetchQuizzes();
  };

  const submitQuiz = async (quizId) => {
    const res = await fetch("http://localhost:5001/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, studentId: user._id, answers: Object.values(answers[quizId] || {}) }),
    });
    const data = await res.json();
    alert(`Quiz submitted! Score: ${data.score}`);
  };

  return (
    <div>
      <h2>Quizzes</h2>

      {user.role === "Teacher" && (
        <div style={{ marginBottom: 20 }}>
          <h3>Create Quiz</h3>
          <input placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} /><br/>
          {questions.map((q, i) => (
            <div key={i}>
              <input placeholder="Question" value={q.question} onChange={e => {
                const newQs = [...questions]; newQs[i].question = e.target.value; setQuestions(newQs);
              }} />
              <input placeholder="Correct Answer" value={q.correctAnswer} onChange={e => {
                const newQs = [...questions]; newQs[i].correctAnswer = e.target.value; setQuestions(newQs);
              }} />
            </div>
          ))}
          <button onClick={() => setQuestions([...questions, { question: "", correctAnswer: "" }])}>Add Question</button><br/>
          <button onClick={createQuiz}>Create Quiz</button>
        </div>
      )}

      <div>
        <h3>All Quizzes</h3>
        {quizzes.map(quiz => (
          <div key={quiz._id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <strong>{quiz.title}</strong> by {quiz.createdBy?.name}
            {user.role === "Student" && (
              <div>
                {quiz.questions.map((q, i) => (
                  <div key={i}>
                    {q.question}<br/>
                    <input placeholder="Your answer" value={answers[quiz._id]?.[i] || ""} onChange={e => {
                      setAnswers(prev => ({ ...prev, [quiz._id]: { ...prev[quiz._id], [i]: e.target.value } }));
                    }} />
                  </div>
                ))}
                <button onClick={() => submitQuiz(quiz._id)}>Submit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

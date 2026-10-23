import React, { useEffect, useState } from "react";
import { api, asArray, isStaffRole, isStudentRole } from "../api/client";

export default function Quiz({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ question: "", correctAnswer: "" }]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadQuizzes = async () => {
      try {
        const data = await api("/quiz");
        if (active) {
          setQuizzes(asArray(data));
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load quizzes.");
      }
    };

    void loadQuizzes();
    return () => {
      active = false;
    };
  }, []);

  const createQuiz = async () => {
    if (!title || questions.some((q) => !q.question || !q.correctAnswer)) {
      setError("Fill all fields");
      return;
    }
    try {
      await api("/quiz", {
        method: "POST",
        body: { title, questions, instructorId: user._id },
      });
      setTitle("");
      setQuestions([{ question: "", correctAnswer: "" }]);
      setError("");
      setQuizzes(asArray(await api("/quiz")));
    } catch (err) {
      setError(err.message || "Could not create the quiz.");
    }
  };

  const submitQuiz = async (quizId) => {
    try {
      const data = await api("/answer", {
        method: "POST",
        body: {
          quizId,
          studentId: user._id,
          answers: (quizzes.find((quiz) => quiz._id === quizId)?.questions || []).map(
            (_, index) => answers[quizId]?.[index] || ""
          ),
        },
      });
      setScore(data.score);
      setError("");
    } catch (err) {
      setError(err.message || "Could not submit the quiz.");
    }
  };

  return (
    <div>
      <h2>Quizzes</h2>
      {error && <p className="auth-message error">{error}</p>}
      {score !== null && <p className="auth-message ok">Last score: {score}</p>}

      {isStaffRole(user.role) && (
        <div style={{ marginBottom: 20 }}>
          <h3>Create Quiz</h3>
          <input placeholder="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} /><br />
          {questions.map((q, i) => (
            <div key={i}>
              <input
                placeholder="Question"
                value={q.question}
                onChange={(e) => {
                  const next = [...questions];
                  next[i].question = e.target.value;
                  setQuestions(next);
                }}
              />
              <input
                placeholder="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) => {
                  const next = [...questions];
                  next[i].correctAnswer = e.target.value;
                  setQuestions(next);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={() => setQuestions([...questions, { question: "", correctAnswer: "" }])}>
            Add Question
          </button>
          <br />
          <button type="button" onClick={createQuiz}>Create Quiz</button>
        </div>
      )}

      <div>
        <h3>All Quizzes</h3>
        {quizzes.map((quiz) => (
          <div key={quiz._id} style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
            <strong>{quiz.title}</strong> by {quiz.createdBy?.name}
            {isStudentRole(user.role) && (
              <div>
                {(quiz.questions || []).map((q, i) => (
                  <div key={i}>
                    {q.question}<br />
                    <input
                      placeholder="Your answer"
                      value={answers[quiz._id]?.[i] || ""}
                      onChange={(e) => {
                        setAnswers((prev) => ({
                          ...prev,
                          [quiz._id]: { ...prev[quiz._id], [i]: e.target.value },
                        }));
                      }}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => submitQuiz(quiz._id)}>Submit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

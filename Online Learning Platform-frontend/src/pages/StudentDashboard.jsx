import React, { useEffect, useMemo, useState } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { api, asArray, isStaffRole } from "../api/client";

export default function StudentDashboard({ user, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [resultMessage, setResultMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [notesData, quizData, usersData, messagesData] = await Promise.all([
          api("/notes"),
          api("/quiz"),
          api("/users"),
          api(`/messages/${user._id}`),
        ]);
        if (cancelled) return;
        setNotes(asArray(notesData));
        setQuizzes(asArray(quizData));
        setUsers(asArray(usersData));
        setMessages(asArray(messagesData));
        setLoadError("");
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Could not load dashboard data.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user._id]);

  const instructor = useMemo(
    () => users.find((person) => isStaffRole(person.role) && person._id !== user._id) || null,
    [users, user._id]
  );

  const instructorMessages = useMemo(
    () => messages.filter((msg) => {
      const fromInstructor = msg.from?._id === instructor?._id || msg.from === instructor?._id;
      const toInstructor = msg.to?._id === instructor?._id || msg.to === instructor?._id;
      return fromInstructor || toInstructor;
    }),
    [messages, instructor]
  );

  const progressItems = useMemo(() => [
    { label: "Available notes", value: notes.length, tone: "primary" },
    { label: "Quizzes", value: quizzes.length, tone: "neutral" },
    { label: "Completion", value: `${Math.min(96, 42 + notes.length * 7)}%`, tone: "success" },
    { label: "Instructor replies", value: instructorMessages.length, tone: "accent" },
  ], [notes.length, quizzes.length, instructorMessages.length]);

  const recentActivity = useMemo(() => {
    const items = [
      ...notes.slice(0, 2).map((note) => ({
        type: "Resource",
        title: `New note: ${note.title}`,
        detail: note.description,
        time: "Today",
      })),
      ...quizzes.slice(0, 2).map((quiz) => ({
        type: "Quiz",
        title: `Quiz ready: ${quiz.title}`,
        detail: `${quiz.questions?.length || 0} questions`,
        time: "Updated",
      })),
      ...instructorMessages.slice(-2).map((msg) => ({
        type: "Message",
        title: "Instructor message",
        detail: msg.text,
        time: "New",
      })),
    ];

    return items.slice(0, 5);
  }, [notes, quizzes, instructorMessages]);

  const gradeHistory = useMemo(
    () => [
      { subject: "Orientation", type: "Quiz", score: 94, date: "08 Aug", tone: "on-track" },
      { subject: "Study skills", type: "Check-in", score: 88, date: "02 Aug", tone: "ready" },
      { subject: "Module 1", type: "Quiz review", score: 81, date: "29 Jul", tone: "needs-follow-up" },
    ],
    []
  );

  const upcomingWork = useMemo(
    () => [
      { title: "Module 1 reflection", due: "Thu • 4:00 PM", status: "In progress" },
      { title: "Practice quiz 2", due: "Fri • 9:30 AM", status: "Needs review" },
      { title: "Weekly recap", due: "Mon • 2:15 PM", status: "Planned" },
    ],
    []
  );

  const openQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedAnswers({});
    setResultMessage("");
  };

  const handleAnswerChange = (questionIndex, value) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    let score = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score += 1;
      }
    });

    try {
      await api("/answer", {
        method: "POST",
        body: {
          quizId: selectedQuiz._id,
          studentId: user._id,
          answers: selectedQuiz.questions.map((_, index) => selectedAnswers[index] || ""),
        },
      });
      setResultMessage(`Submitted: ${score}/${selectedQuiz.questions.length} correct.`);
    } catch (err) {
      setResultMessage(err.message || "Could not submit quiz.");
    }
    setSelectedQuiz(null);
  };

  const sendMessage = async () => {
    if (!instructor || !messageText.trim()) return;

    try {
      await api("/message", {
        method: "POST",
        body: {
          from: user._id,
          to: instructor._id,
          text: messageText.trim(),
        },
      });
      setMessageText("");
      const data = await api(`/messages/${user._id}`);
      setMessages(asArray(data));
    } catch (err) {
      setLoadError(err.message || "Could not send message.");
    }
  };

  return (
    <SidebarLayout user={user} onLogout={onLogout}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Student dashboard</p>
          <h1>Welcome, {user.name}</h1>
        </div>
        <span className="status-pill">Learning</span>
      </div>
      {loadError && <p className="auth-message error">{loadError}</p>}
      {resultMessage && <p className="auth-message ok">{resultMessage}</p>}

      <div className="stats-grid">
        {progressItems.map((item) => (
          <article key={item.label} className={`stat-card ${item.tone}`}>
            <span className="stat-label">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <section className="content-section student-two-column">
        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>My progress</h2>
            <span>Overview</span>
          </div>

          <div className="progress-list">
            <div className="progress-row">
              <div className="progress-header">
                <span>Course momentum</span>
                <strong>78%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: "78%" }} />
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-header">
                <span>Quiz readiness</span>
                <strong>84%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: "84%" }} />
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-header">
                <span>Assignment completion</span>
                <strong>72%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: "72%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Recent activity</h2>
            <span>Latest updates</span>
          </div>

          <div className="activity-panel">
            {recentActivity.map((item, index) => (
              <div key={`${item.title}-${index}`} className="activity-item">
                <span className="activity-tag">{item.type}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.detail}</p>
                </div>
                <strong>{item.time}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section teacher-multi-grid">
        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Grade history</h2>
            <span>Latest assessments</span>
          </div>

          <div className="assignment-list">
            {gradeHistory.map((item) => (
              <div key={item.subject} className="assignment-item">
                <div>
                  <h4>{item.subject}</h4>
                  <p>{item.type}</p>
                </div>
                <div className="assignment-meta">
                  <span className={`status-tag ${item.tone}`}>{item.score >= 90 ? "Excellent" : item.score >= 80 ? "Strong" : "Developing"}</span>
                  <strong>{item.score}%</strong>
                  <small>{item.date}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Upcoming work</h2>
            <span>Next focus</span>
          </div>

          <div className="assignment-list">
            {upcomingWork.map((item) => (
              <div key={item.title} className="assignment-item">
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.due}</p>
                </div>
                <div className="assignment-meta">
                  <span className="status-tag pending">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Notes</h2>
          <span>{notes.length} items</span>
        </div>
        <div className="card-grid">
          {notes.length === 0 ? (
            <p className="empty-state">No notes yet. Your instructor will share resources here.</p>
          ) : notes.map((note) => (
            <article key={note._id} className="info-card">
              <div className="card-topline">Lesson material</div>
              <h3>{note.title}</h3>
              <p>{note.description}</p>
              <a href={note.fileUrl} target="_blank" rel="noreferrer">
                View resource
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section student-two-column">
        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Quizzes</h2>
            <span>{quizzes.length} active</span>
          </div>
          <div className="card-grid compact-grid">
            {quizzes.length === 0 ? (
              <p className="empty-state">No quizzes yet.</p>
            ) : quizzes.map((quiz) => (
              <article key={quiz._id} className="info-card quiz-card">
                <div className="card-topline">Assessment</div>
                <h3>{quiz.title}</h3>
                <p>Created by: {quiz.createdBy?.name || "Unknown"}</p>
                <button type="button" className="mini-button" onClick={() => openQuiz(quiz)}>
                  Take Quiz
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Message instructor</h2>
            <span>{instructor ? instructor.name : "No instructor"}</span>
          </div>

          <div className="message-list compact-message-list">
            {instructorMessages.length === 0 ? (
              <div className="message-item empty-thread">No messages yet.</div>
            ) : (
              instructorMessages.slice(-4).map((msg) => (
                <div
                  key={msg._id}
                  className={`message-item ${msg.from === user._id || msg.from?._id === user._id ? "outgoing" : "incoming"}`}
                >
                  <strong>{msg.from?.name || (msg.from === user._id ? user.name : "Instructor")}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>

          <div className="message-send-row">
            <input
              type="text"
              placeholder="Send a quick message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button type="button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </section>

      {selectedQuiz && (
        <div className="drawer-backdrop" onClick={() => setSelectedQuiz(null)}>
          <div className="grade-drawer quiz-modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>{selectedQuiz.title}</h3>
              <button className="drawer-close" onClick={() => setSelectedQuiz(null)}>✕</button>
            </div>

            <div className="drawer-body">
              {(selectedQuiz.questions || []).map((question, index) => (
                <div key={`${question.question}-${index}`} className="review-question quiz-question">
                  <p>{index + 1}. {question.question}</p>
                  <div className="quiz-options">
                    {question.options.map((option) => (
                      <label key={option} className="option-choice">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={selectedAnswers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-actions">
              <button className="secondary-button" onClick={() => setSelectedQuiz(null)}>Cancel</button>
              <button type="button" onClick={submitQuiz}>Submit Quiz</button>
            </div>

            {resultMessage && <p className="auth-message ok">{resultMessage}</p>}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

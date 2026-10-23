import React, { useState, useEffect, useMemo, useCallback } from "react";
import SidebarLayout from "../components/SidebarLayout";
import GradeDrawer from "../components/GradeDrawer";
import { api, asArray, isStudentRole } from "../api/client";

const createBlankQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
});

const formatInitials = (name) => {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "S";
};

export default function InstructorDashboard({ user, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([createBlankQuestion()]);
  const [loadError, setLoadError] = useState("");

  const fetchNotes = useCallback(async () => {
    setNotes(asArray(await api("/notes")));
  }, []);

  const fetchQuizzes = useCallback(async () => {
    setQuizzes(asArray(await api("/quiz")));
  }, []);

  const fetchMessages = useCallback(async () => {
    setMessages(asArray(await api(`/messages/${user._id}`)));
  }, [user._id]);

  const fetchUsers = useCallback(async () => {
    const data = asArray(await api("/users"));
    const students = data.filter((person) => person._id !== user._id && isStudentRole(person.role));
    setUsers(students);
    setSelectedStudentId((current) => current || students[0]?._id || "");
  }, [user._id]);

  const fetchGrades = useCallback(async () => {
    setGrades(asArray(await api("/grades")));
  }, []);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        await Promise.all([fetchNotes(), fetchQuizzes(), fetchMessages(), fetchUsers(), fetchGrades()]);
        if (active) setLoadError("");
      } catch (err) {
        if (active) setLoadError(err.message || "Could not load dashboard data.");
      }
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [fetchNotes, fetchQuizzes, fetchMessages, fetchUsers, fetchGrades]);

  const studentThreadMessages = messages.filter(
    (msg) =>
      msg.from?._id === selectedStudentId ||
      msg.to?._id === selectedStudentId ||
      msg.from === selectedStudentId ||
      msg.to === selectedStudentId
  );

  const updateQuestion = (index, field, value) => {
    setQuestions((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index) return question;

        if (field === "options") {
          return { ...question, options: value };
        }

        return { ...question, [field]: value };
      })
    );
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question;

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;
        return { ...question, options: updatedOptions };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, createBlankQuestion()]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      setQuestions([createBlankQuestion()]);
      return;
    }

    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
  };

  const uploadNote = async () => {
    if (!title || !description || !fileUrl) return;
    await api("/notes", {
      method: "POST",
      body: { title, description, fileUrl },
    });
    setTitle("");
    setDescription("");
    setFileUrl("");
    fetchNotes();
  };

  const createQuiz = async () => {
    const validQuestions = questions
      .filter((question) => question.question.trim() && question.options.every((option) => option.trim()))
      .map((question) => ({
        question: question.question.trim(),
        options: question.options.map((option) => option.trim()),
        correctAnswer: question.correctAnswer || question.options[0],
      }));

    if (!quizTitle || validQuestions.length === 0) return;

    await api("/quiz", {
      method: "POST",
      body: { title: quizTitle, questions: validQuestions },
    });

    setQuizTitle("");
    setQuestions([createBlankQuestion()]);
    fetchQuizzes();
  };

  const sendMessage = async () => {
    if (!selectedStudentId || !messageText.trim()) return;

    await api("/message", {
      method: "POST",
      body: {
        to: selectedStudentId,
        text: messageText.trim(),
      },
    });

    setMessageText("");
    fetchMessages();
  };

  const selectedStudentGrades = useMemo(
    () => grades.filter((grade) => grade.studentId?._id === selectedStudentId || grade.studentId === selectedStudentId),
    [grades, selectedStudentId]
  );

  const selectedStudentAverage = useMemo(() => {
    if (!selectedStudentGrades.length) return 0;
    const total = selectedStudentGrades.reduce((sum, grade) => {
      const maxScore = Number(grade.maxScore) || 100;
      return sum + ((Number(grade.score) || 0) / maxScore) * 100;
    }, 0);
    return Math.round(total / selectedStudentGrades.length);
  }, [selectedStudentGrades]);

  const openGradeDrawer = (student) => {
    setDrawerStudent(student);
    setDrawerOpen(true);
  };

  const saveGrade = async ({ title, score, maxScore }) => {
    const payload = {
      studentId: drawerStudent?._id,
      title,
      score,
      maxScore,
    };

    try {
      await api("/grade", { method: "POST", body: payload });
      await fetchGrades();
      setDrawerOpen(false);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message || "Could not save the grade.");
    }
  };

  const overviewStudents = users.map((student) => ({
    ...student,
    unread: messages.filter((msg) => msg.from === student._id || msg.to === student._id).length,
  }));

  const selectedStudent = users.find((student) => student._id === selectedStudentId) || users[0] || null;

  const classroomPulse = useMemo(() => {
    const activeStudents = users.length;
    const recentMessages = messages.length;
    const averageGrade = grades.length
      ? Math.round(
          grades.reduce((sum, grade) => {
            const maxScore = Number(grade.maxScore) || 100;
            return sum + ((Number(grade.score) || 0) / maxScore) * 100;
          }, 0) / grades.length
        )
      : 0;
    const averageUpdateCount = activeStudents ? Math.max(1, Math.round((recentMessages + notes.length + quizzes.length) / activeStudents)) : 0;

    return [
      { label: "Active students", value: activeStudents, tone: "primary" },
      { label: "Messages", value: recentMessages, tone: "neutral" },
      { label: "Avg. grade", value: `${averageGrade}%`, tone: "accent" },
      { label: "Avg. engagement", value: `${averageUpdateCount}/wk`, tone: "success" },
    ];
  }, [users.length, messages, notes.length, quizzes.length, grades]);

  const activityFeed = useMemo(() => {
    const items = [
      ...notes.map((note) => ({
        type: "Resource",
        title: `New note: ${note.title}`,
        detail: note.uploadedBy?.name || "Instructor",
        time: "Recently",
      })),
      ...quizzes.map((quiz) => ({
        type: "Quiz",
        title: `Assessment: ${quiz.title}`,
        detail: `${quiz.questions?.length || 0} questions`,
        time: "Updated",
      })),
      ...messages.slice(-4).map((msg) => ({
        type: "Message",
        title: `Conversation with ${msg.from?.name || "student"}`,
        detail: msg.text,
        time: "New",
      })),
    ];

    return items.slice(0, 5);
  }, [notes, quizzes, messages]);

  const assignmentList = useMemo(() => {
    const defaults = [
      { title: "Module 1 write-up", due: "Due today", status: "In review", completion: 76 },
      { title: "Week 2 worksheet", due: "Due tomorrow", status: "On track", completion: 64 },
      { title: "Practice set", due: "Due Friday", status: "Needs follow-up", completion: 48 },
    ];

    if (notes.length === 0 && quizzes.length === 0) return defaults;

    return [
      {
        title: notes[0]?.title || "Lesson recap",
        due: "Due today",
        status: notes.length > 0 ? "Shared" : "Pending",
        completion: 82,
      },
      {
        title: quizzes[0]?.title || "Practice quiz",
        due: "Due tomorrow",
        status: quizzes.length > 0 ? "Ready" : "Draft",
        completion: 69,
      },
      ...defaults.slice(2),
    ];
  }, [notes, quizzes]);

  const analyticsBreakdown = useMemo(() => {
    const participation = users.length ? Math.min(100, Math.round(((messages.length + notes.length + quizzes.length) / (users.length * 5)) * 100)) : 0;
    const quizAccuracy = grades.length
      ? Math.min(100, Math.round(
          grades.reduce((sum, grade) => sum + ((Number(grade.score) || 0) / (Number(grade.maxScore) || 100)) * 100, 0) / grades.length
        ))
      : 0;
    const completion = users.length ? Math.min(100, Math.round((notes.length * 12 + quizzes.length * 18 + grades.length * 8) / Math.max(users.length, 1))) : 0;
    const engagement = users.length ? Math.min(100, Math.round((messages.length * 12 + notes.length * 6 + quizzes.length * 14) / Math.max(users.length, 1))) : 0;

    return [
      { label: "Participation", value: participation },
      { label: "Quiz accuracy", value: quizAccuracy },
      { label: "Completion", value: completion },
      { label: "Engagement", value: engagement },
    ];
  }, [users.length, messages.length, notes.length, quizzes.length, grades]);

  const studentProgress = useMemo(() => {
    return users.map((student, index) => {
      const studentGradeSet = grades.filter((grade) => grade.studentId?._id === student._id || grade.studentId === student._id);
      const progress = studentGradeSet.length
        ? Math.min(100, Math.round(
            studentGradeSet.reduce((sum, grade) => sum + ((Number(grade.score) || 0) / (Number(grade.maxScore) || 100)) * 100, 0) / studentGradeSet.length
          ))
        : 58 + ((index + 1) * 9) % 35;

      const trend = progress >= 80 ? "Up" : progress >= 65 ? "Stable" : "Needs support";
      return { name: student.name, progress, trend };
    });
  }, [users, grades]);

  const reviewQuiz = quizzes[0] || {
    title: "Midterm review",
    questions: [
      { question: "Where do enrolled courses appear?", correctAnswer: "Dashboard" },
      { question: "Who can publish a course?", correctAnswer: "Instructors" },
      { question: "What marks a lesson as finished?", correctAnswer: "Mark complete" },
    ],
  };

  return (
    <SidebarLayout user={user} onLogout={onLogout}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Instructor dashboard</p>
          <h1>Welcome, {user.name}</h1>
        </div>
        <span className="status-pill">Teaching</span>
      </div>
      {loadError && <p className="auth-message error">{loadError}</p>}

      <div className="stats-grid">
        {classroomPulse.map((item) => (
          <article key={item.label} className={`stat-card ${item.tone}`}>
            <span className="stat-label">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <section className="content-section teacher-split-layout">
        <div className="teacher-focus-panel">
          <div className="section-heading">
            <h2>Class overview</h2>
            <span>Performance snapshot</span>
          </div>
          <div className="overview-panel">
            <div className="overview-summary">
              <div>
                <span>Active students</span>
                <strong>{users.length}</strong>
              </div>
              <div>
                <span>Open quizzes</span>
                <strong>{quizzes.length}</strong>
              </div>
              <div>
                <span>Resources</span>
                <strong>{notes.length}</strong>
              </div>
            </div>

            <div className="student-overview-list">
              {overviewStudents.map((student) => (
                <button
                  key={student._id}
                  type="button"
                  className={`student-pill-row ${selectedStudentId === student._id ? "active" : ""}`}
                  onClick={() => setSelectedStudentId(student._id)}
                >
                  <span className="student-avatar">{formatInitials(student.name)}</span>
                  <span className="student-name">{student.name}</span>
                  <span className="student-unread">{student.unread} updates</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="teacher-focus-panel">
          <div className="section-heading">
            <h2>Student focus</h2>
            <span>Current class attention</span>
          </div>
          <div className="focus-panel">
            {selectedStudent ? (
              <>
                <div className="focus-header">
                  <span className="student-avatar large">{formatInitials(selectedStudent.name)}</span>
                  <div>
                    <h3>{selectedStudent.name}</h3>
                    <p>{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="focus-metrics">
                  <div>
                    <span>Messages</span>
                    <strong>{messages.filter((msg) => msg.from === selectedStudent._id || msg.to === selectedStudent._id).length}</strong>
                  </div>
                  <div>
                    <span>Avg. grade</span>
                    <strong>{selectedStudentAverage ? `${selectedStudentAverage}%` : "New"}</strong>
                  </div>
                  <div>
                    <span>Priority</span>
                    <strong>{selectedStudentAverage >= 80 ? "Strong" : selectedStudentAverage >= 65 ? "Normal" : "Support"}</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className="empty-state">No student selected.</p>
            )}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Classroom activity</h2>
          <span>Latest updates</span>
        </div>
        <div className="activity-panel">
          {activityFeed.map((item, index) => (
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
      </section>

      <section className="content-section teacher-multi-grid">
        <div className="dashboard-card analytics-card">
          <div className="section-heading compact">
            <h2>Instructor analytics</h2>
            <span>This week</span>
          </div>

          <div className="analytics-list">
            {analyticsBreakdown.map((item) => (
              <div key={item.label} className="analytics-row">
                <div className="analytics-label-row">
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className="analytics-track">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Assignment tracking</h2>
            <span>Next deadlines</span>
          </div>

          <div className="assignment-list">
            {assignmentList.map((assignment) => (
              <div key={assignment.title} className="assignment-item">
                <div>
                  <h4>{assignment.title}</h4>
                  <p>{assignment.due}</p>
                </div>
                <div className="assignment-meta">
                  <span className={`status-tag ${assignment.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {assignment.status}
                  </span>
                  <strong>{assignment.completion}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section teacher-multi-grid">
        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Student progress summary</h2>
            <span>Class momentum</span>
          </div>

          <div className="progress-list">
            {studentProgress.map((student) => (
              <div key={student.name} className="progress-row">
                <div className="progress-header">
                  <span>{student.name}</span>
                  <strong>{student.progress}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${student.progress}%` }} />
                </div>
                <small>{student.trend}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-heading compact">
            <h2>Quiz review</h2>
            <span>Latest assessment</span>
          </div>

          <div className="review-quiz">
            <div className="review-header">
              <h3>{reviewQuiz.title}</h3>
              <span>{reviewQuiz.questions?.length || 0} questions</span>
            </div>

            {reviewQuiz.questions?.slice(0, 3).map((question, index) => (
              <div key={`${question.question}-${index}`} className="review-question">
                <p>{index + 1}. {question.question}</p>
                <strong>Answer key: {question.correctAnswer}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Upload note</h2>
          <span>Share learning resources</span>
        </div>
        <div className="form-card">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input placeholder="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          <button type="button" onClick={uploadNote}>Upload Note</button>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Create quiz</h2>
          <span>New assessment</span>
        </div>
        <div className="form-card quiz-builder">
          <input placeholder="Quiz Title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />

          {questions.map((question, index) => (
            <div key={index} className="question-block">
              <div className="question-header">
                <h4>Question {index + 1}</h4>
                <button type="button" className="remove-question" onClick={() => removeQuestion(index)}>
                  Remove
                </button>
              </div>

              <input
                placeholder="Question text"
                value={question.question}
                onChange={(e) => updateQuestion(index, "question", e.target.value)}
              />

              <div className="option-grid">
                {question.options.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                  />
                ))}
              </div>

              <select
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
              >
                <option value="">Select correct answer</option>
                {question.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option} disabled={!option.trim()}>
                    {option || `Option ${optionIndex + 1}`}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="question-actions">
            <button type="button" className="secondary-button" onClick={addQuestion}>Add Question</button>
            <button type="button" onClick={createQuiz}>Create Quiz</button>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Existing notes</h2>
          <span>{notes.length} files</span>
        </div>
        <div className="card-grid">
          {notes.map((note) => (
            <article key={note._id} className="info-card">
              <div className="card-topline">Resource</div>
              <h3>{note.title}</h3>
              <p>{note.description}</p>
              <p className="meta-text">By {note.uploadedBy?.name || "Unknown"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Existing quizzes</h2>
          <span>{quizzes.length} active</span>
        </div>
        <div className="card-grid">
          {quizzes.map((quiz) => (
            <article key={quiz._id} className="info-card quiz-card">
              <div className="card-topline">Assessment</div>
              <h3>{quiz.title}</h3>
              <p>{quiz.questions?.length || 0} questions</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Messages</h2>
          <span>Student thread</span>
        </div>
        <div className="form-card compact-form">
          <label className="select-label">
            <span>Select student</span>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              {users.length === 0 ? <option value="">No students found</option> : users.map((student) => (
                <option key={student._id} value={student._id}>{student.name}</option>
              ))}
            </select>
          </label>

          <div className="message-list">
            {studentThreadMessages.length === 0 ? (
              <div className="message-item empty-thread">No messages yet for this student.</div>
            ) : (
              studentThreadMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-item ${msg.from === user._id || msg.from?._id === user._id ? "outgoing" : "incoming"}`}
                >
                  <strong>{msg.from?.name || (msg.from === user._id ? user.name : "Student")}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>

          <div className="message-send-row">
            <input
              type="text"
              placeholder="Write a message to the selected student"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button type="button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Grades</h2>
          <span>Quick grade entry</span>
        </div>

        <div className="form-card">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              {users.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button type="button" onClick={() => openGradeDrawer(users.find((u) => u._id === selectedStudentId))}>Enter grade</button>
          </div>

          <div style={{ marginTop: 12 }}>
            {grades.length === 0 ? (
              <p className="meta-text">No grades entered in this session.</p>
            ) : (
              grades.map((g) => (
                <div key={g._id} className="info-card" style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>{g.title}</strong>
                      <div className="meta-text">{g.studentId?.name || "Student"}</div>
                    </div>
                    <div>
                      <strong>{g.score}/{g.maxScore}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <GradeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} student={drawerStudent} onSave={saveGrade} />
    </SidebarLayout>
  );
}

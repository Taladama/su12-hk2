"use client";

import { useMemo, useRef, useState } from "react";
import { chapters, questions } from "../data/questions";
import { createQuizQuestions, formatTruthValue, getDisplayedChoiceLabel, gradeAnswer } from "../lib/quiz";

const scopes = [
  { id: "chapter-5", label: "Chương 5" },
  { id: "chapter-6", label: "Chương 6" },
  { id: "all", label: "Tất cả" }
];
const tfOptions = [
  { value: true, label: "Đúng" },
  { value: false, label: "Sai" }
];

const byScope = (scope) => (scope === "all" ? questions : questions.filter((q) => q.chapter === scope));
const chapterName = (id) => chapters.find((c) => c.id === id)?.title ?? "Chương";
const kind = (q) => (q.type === "single-choice" ? "Trắc nghiệm" : "Đúng/Sai");

function statsOf(session, answers) {
  if (!session) return { correct: 0, wrong: [], improved: 0 };
  const wrong = [];
  let correct = 0;
  let improved = 0;
  for (const q of session.questions) {
    const answer = answers[q.id];
    if (answer?.correct) {
      correct += 1;
      if (session.mode === "mistakes") improved += 1;
    } else {
      wrong.push(q);
    }
  }
  return { correct, wrong, improved };
}

export default function App() {
  const [scope, setScope] = useState("chapter-5");
  const [view, setView] = useState("home");
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState({});
  const [locked, setLocked] = useState(false);
  const [mistakes, setMistakes] = useState({});
  const timer = useRef(null);

  const pool = useMemo(() => byScope(scope), [scope]);
  const mistakeQuestions = useMemo(
    () => questions.filter((q) => mistakes[q.id] === "needs-review"),
    [mistakes]
  );
  const q = session?.questions[index];
  const stats = useMemo(() => statsOf(session, answers), [session, answers]);

  function clearTimer() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }

  function start(mode = "normal") {
    clearTimer();
    const selected = mode === "mistakes" ? mistakeQuestions : pool;
    if (!selected.length) return;
    setSession({ mode, questions: createQuizQuestions(selected) });
    setIndex(0);
    setAnswers({});
    setDraft({});
    setLocked(false);
    setView("quiz");
  }

  function finish(finalAnswers) {
    setMistakes((old) => {
      const next = { ...old };
      for (const item of session.questions) {
        if (finalAnswers[item.id]?.correct) {
          if (next[item.id] || session.mode === "mistakes") next[item.id] = "improved";
        } else {
          next[item.id] = "needs-review";
        }
      }
      return next;
    });
    setLocked(false);
    setView("result");
  }

  function submit(question, rawAnswer) {
    if (locked) return;
    const answer = { ...rawAnswer, correct: gradeAnswer(question, rawAnswer) };
    const nextAnswers = { ...answers, [question.id]: answer };
    setAnswers(nextAnswers);
    setLocked(true);
    timer.current = window.setTimeout(() => {
      if (index + 1 >= session.questions.length) finish(nextAnswers);
      else {
        setIndex((i) => i + 1);
        setDraft({});
        setLocked(false);
      }
    }, 1000);
  }

  function chooseTf(statementId, value) {
    if (!q || locked) return;
    const next = { ...draft, [statementId]: value };
    setDraft(next);
    if (q.statements.every((s) => typeof next[s.id] === "boolean")) submit(q, { selections: next });
  }

  function home() {
    clearTimer();
    setView("home");
    setSession(null);
    setIndex(0);
    setAnswers({});
    setDraft({});
    setLocked(false);
  }

  if (view === "quiz" && q) {
    const answer = answers[q.id];
    return (
      <main className="app study">
        <header className="topbar">
          <button disabled={locked} onClick={home}>Trang chính</button>
          <div className="progress"><span style={{ width: `${((index + 1) / session.questions.length) * 100}%` }} /></div>
          <b>{index + 1}/{session.questions.length}</b>
        </header>
        <section className="question">
          <p>{chapterName(q.chapter)} • Câu {q.sourceNumber} • {kind(q)}</p>
          <h1>{q.prompt}</h1>
          {q.passage ? <blockquote>{q.passage}</blockquote> : null}
        </section>
        {q.type === "single-choice" ? (
          <section className="answers">
            {q.displayChoices.map((choice, i) => {
              const selected = answer?.selectedChoiceId === choice.id;
              const correct = q.correctChoiceId === choice.id;
              const cls = ["answer", selected && "selected", answer && locked && correct && "right", answer && locked && selected && !correct && "wrong"].filter(Boolean).join(" ");
              return <button className={cls} disabled={!!answer || locked} key={choice.id} onClick={() => submit(q, { selectedChoiceId: choice.id })}><b>{String.fromCharCode(65 + i)}</b><span>{choice.text}</span></button>;
            })}
          </section>
        ) : (
          <section className="tf-list">
            {q.displayStatements.map((st, i) => {
              const selected = answer?.selections?.[st.id] ?? draft[st.id];
              return <article className="tf" key={st.id}><p><b>{String.fromCharCode(97 + i)}</b>{st.text}</p><div>{tfOptions.map((opt) => {
                const picked = selected === opt.value;
                const correct = st.correct === opt.value;
                const cls = ["tf-btn", picked && "selected", answer && locked && correct && "right", answer && locked && picked && !correct && "wrong"].filter(Boolean).join(" ");
                return <button className={cls} disabled={!!answer || locked} key={opt.label} onClick={() => chooseTf(st.id, opt.value)}>{opt.label}</button>;
              })}</div></article>;
            })}
          </section>
        )}
      </main>
    );
  }

  if (view === "result" && session) {
    return <main className="app result"><section className="card center"><p>Kết quả</p><h1>{stats.correct}/{session.questions.length} câu đúng</h1><div className="metrics"><span>{stats.correct}<small>Đúng</small></span><span>{stats.wrong.length}<small>Sai</small></span><span>{stats.improved}<small>Đã cải thiện</small></span></div></section><section className="actions"><button className="primary" onClick={() => setView("review")}>Xem đáp án</button><button onClick={() => start("mistakes")} disabled={!mistakeQuestions.length}>Ôn câu sai</button><button onClick={home}>Làm bài mới</button></section></main>;
  }

  if (view === "review" && session) {
    return <main className="app review"><header className="review-head"><h1>Đối chiếu đáp án</h1><button onClick={() => setView("result")}>Kết quả</button></header>{session.questions.map((item) => <Review key={item.id} question={item} answer={answers[item.id]} />)}<section className="actions"><button className="primary" onClick={() => start("mistakes")} disabled={!mistakeQuestions.length}>Ôn câu sai</button><button onClick={home}>Trang chính</button></section></main>;
  }

  return <main className="app home"><section className="hero"><p>Lịch sử 12 • HK2</p><h1>Vào làm bài</h1></section><section className="card"><p>Chọn phần</p><h2>{pool.length} câu</h2><div className="scopes">{scopes.map((s) => <button aria-pressed={scope === s.id} key={s.id} onClick={() => setScope(s.id)}>{s.label}<b>{byScope(s.id).length}</b></button>)}</div><button className="primary wide" onClick={() => start()}>Bắt đầu</button><button className="wide" disabled={!mistakeQuestions.length} onClick={() => start("mistakes")}>Ôn câu sai {mistakeQuestions.length ? `(${mistakeQuestions.length})` : ""}</button></section></main>;
}

function Review({ question, answer }) {
  return <article className={`review-card ${answer?.correct ? "ok" : "bad"}`}><header><p>Câu {question.sourceNumber} • {chapterName(question.chapter)} • {kind(question)}</p><strong>{answer?.correct ? "Đúng" : "Sai"}</strong></header><h2>{question.prompt}</h2>{question.passage ? <blockquote>{question.passage}</blockquote> : null}{question.type === "single-choice" ? <ReviewChoice question={question} answer={answer} /> : <ReviewTf question={question} answer={answer} />}<p className="explain"><b>Giải thích:</b> {question.explanation}</p></article>;
}

function ReviewChoice({ question, answer }) {
  const selected = question.choices.find((c) => c.id === answer?.selectedChoiceId);
  const correct = question.choices.find((c) => c.id === question.correctChoiceId);
  return <><div className="summary"><p><span>Đáp án của bạn</span><b>{getDisplayedChoiceLabel(question, answer?.selectedChoiceId)}. {selected?.text ?? "Chưa chọn"}</b></p><p><span>Đáp án đúng</span><b>{getDisplayedChoiceLabel(question, question.correctChoiceId)}. {correct?.text}</b></p></div><div className="review-options">{question.displayChoices.map((choice, i) => <p className={choice.id === question.correctChoiceId ? "right-soft" : choice.id === answer?.selectedChoiceId ? "wrong-soft" : ""} key={choice.id}><b>{String.fromCharCode(65 + i)}</b>{choice.text}</p>)}</div></>;
}

function ReviewTf({ question, answer }) {
  return <div className="tf-review">{question.displayStatements.map((st, i) => { const user = answer?.selections?.[st.id]; return <div className={user === st.correct ? "right-soft" : "wrong-soft"} key={st.id}><p><b>{String.fromCharCode(97 + i)}</b>{st.text}</p><small>Bạn chọn: {typeof user === "boolean" ? formatTruthValue(user) : "Chưa chọn"} • Đúng: {formatTruthValue(st.correct)}</small></div>; })}</div>;
}

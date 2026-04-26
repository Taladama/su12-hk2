import { questions } from "../data/questions.js";
import { gradeAnswer } from "../lib/quiz.js";

const keys = {
  "chapter-5": ["A","D","A","A","A","D","B",[true,false,false,false],[false,true,false,true],"B",[false,true,false,true],"B","A",[true,false,false,true],"D","B","D","D","A","A","A","D","C","C","C","D","B","D","C","A"],
  "chapter-6": ["A","C","B","D","C","A","D","C","B","C",[true,false,false,true],"A","B","D","A","D","B","C","A","B","C","D","B","B",[false,true,true,false],"D","A","A","D",[true,false,true,false]]
};

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

assert(questions.length === 60, `Expected 60 questions, got ${questions.length}`);
const ids = new Set();
for (const q of questions) {
  assert(!ids.has(q.id), `Duplicate id ${q.id}`);
  ids.add(q.id);
  const expected = keys[q.chapter]?.[q.sourceNumber - 1];
  assert(expected, `Missing answer key for ${q.id}`);
  assert(q.explanation?.length > 10, `${q.id} missing explanation`);
  if (q.type === "single-choice") {
    assert(q.choices.length === 4, `${q.id} should have 4 choices`);
    assert(q.correctChoiceId === expected, `${q.id} answer mismatch`);
    assert(gradeAnswer(q, { selectedChoiceId: expected }), `${q.id} grading failed`);
  } else {
    assert(q.statements.length === 4, `${q.id} should have 4 statements`);
    q.statements.forEach((st, i) => assert(st.correct === expected[i], `${q.id}${st.id} answer mismatch`));
    assert(gradeAnswer(q, { selections: Object.fromEntries(q.statements.map((st) => [st.id, st.correct])) }), `${q.id} grading failed`);
  }
}

console.log("Data check passed: 60 questions, answer keys, and grading are valid.");

export function shuffleArray(items, random = Math.random) {
  return items
    .map((item) => ({ item, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export function createQuizQuestions(questions, random = Math.random) {
  return shuffleArray(questions, random).map((question) => {
    if (question.type === "single-choice") {
      return {
        ...question,
        displayChoices: shuffleArray(question.choices, random)
      };
    }

    return {
      ...question,
      displayStatements: shuffleArray(question.statements, random)
    };
  });
}

export function gradeAnswer(question, answer) {
  if (!answer) {
    return false;
  }

  if (question.type === "single-choice") {
    return answer.selectedChoiceId === question.correctChoiceId;
  }

  return question.statements.every(
    (statement) => answer.selections?.[statement.id] === statement.correct
  );
}

export function formatTruthValue(value) {
  return value ? "Đúng" : "Sai";
}

export function getDisplayedChoiceLabel(question, choiceId) {
  const index = question.displayChoices?.findIndex((choice) => choice.id === choiceId);
  return index >= 0 ? String.fromCharCode(65 + index) : "";
}

export function getDisplayedStatementLabel(question, statementId) {
  const index = question.displayStatements?.findIndex((statement) => statement.id === statementId);
  return index >= 0 ? String.fromCharCode(97 + index) : "";
}

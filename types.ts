
export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export type UserAnswers = {
  [questionId: number]: number; // key is question.id, value is the selected option index
};

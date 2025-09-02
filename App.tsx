
import React, { useState, useMemo } from 'react';
import { quizQuestions } from './constants';
import { Question, UserAnswers } from './types';

// Helper Icon Components (defined outside main component to prevent re-creation)
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface QuizViewProps {
  questions: Question[];
  userAnswers: UserAnswers;
  onAnswerSelect: (questionId: number, optionIndex: number) => void;
  onSubmit: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, userAnswers, onAnswerSelect, onSubmit }) => {
  return (
    <>
      {questions.map((q, index) => (
        <div key={q.id} className="mb-8 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <p className="text-xl text-slate-300 mb-4 font-semibold">
            <span className="text-indigo-400 font-bold mr-2">{index + 1}.</span>
            {q.questionText}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((option, optionIndex) => {
              const isSelected = userAnswers[q.id] === optionIndex;
              return (
                <button
                  key={optionIndex}
                  onClick={() => onAnswerSelect(q.id, optionIndex)}
                  className={`p-4 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 ${
                    isSelected
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-lg'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {String.fromCharCode(97 + optionIndex)}. {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onSubmit}
          className="bg-emerald-600 text-white font-bold py-3 px-12 text-lg rounded-full shadow-lg hover:bg-emerald-500 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400"
        >
          Submit Answers
        </button>
      </div>
    </>
  );
};

interface ResultsViewProps {
  questions: Question[];
  userAnswers: UserAnswers;
  score: number;
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, userAnswers, score, onRestart }) => {
    const percentage = Math.round((score / questions.length) * 100);
    const getResultColor = () => {
        if (percentage >= 80) return 'text-emerald-400';
        if (percentage >= 50) return 'text-yellow-400';
        return 'text-rose-400';
    };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
      <p className={`text-7xl font-extrabold ${getResultColor()}`}>{percentage}%</p>
      <p className="text-xl text-slate-300 mb-8">
        You answered {score} out of {questions.length} questions correctly.
      </p>
      
      <div className="text-left max-h-[45vh] overflow-y-auto pr-4 space-y-4 mb-8">
        {questions.map((q, index) => {
          const userAnswerIndex = userAnswers[q.id];
          const isCorrect = userAnswerIndex === q.correctAnswerIndex;
          const userAnswerText = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "Not Answered";
          const correctAnswerText = q.options[q.correctAnswerIndex];

          return (
            <div
              key={q.id}
              className={`p-4 rounded-lg border-l-4 ${
                isCorrect ? 'bg-emerald-900/50 border-emerald-500' : 'bg-rose-900/50 border-rose-500'
              }`}
            >
              <p className="font-semibold text-slate-300 mb-2">{index + 1}. {q.questionText}</p>
              <div className="flex items-center space-x-3 text-sm">
                {isCorrect ? <CheckIcon className="text-emerald-400 flex-shrink-0" /> : <XIcon className="text-rose-400 flex-shrink-0" />}
                <div>
                    <p>Your answer: <span className="font-medium">{userAnswerText}</span></p>
                    {!isCorrect && <p>Correct answer: <span className="font-medium text-emerald-400">{correctAnswerText}</span></p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        className="bg-indigo-600 text-white font-bold py-3 px-12 text-lg rounded-full shadow-lg hover:bg-indigo-500 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        Try Again
      </button>
    </div>
  );
};


const App: React.FC = () => {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const score = useMemo(() => {
    if (!isSubmitted) return 0;
    return quizQuestions.reduce((total, question) => {
      if (userAnswers[question.id] === question.correctAnswerIndex) {
        return total + 1;
      }
      return total;
    }, 0);
  }, [isSubmitted, userAnswers]);


  const handleSubmit = () => {
    setIsSubmitted(true);
  };
  
  const handleRestart = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans bg-slate-900">
      <main className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
          JUPEB QUESTIONS MINI QUIZ
        </h1>
        {isSubmitted ? (
          <ResultsView 
            questions={quizQuestions}
            userAnswers={userAnswers}
            score={score}
            onRestart={handleRestart}
          />
        ) : (
          <QuizView 
            questions={quizQuestions}
            userAnswers={userAnswers}
            onAnswerSelect={handleAnswerSelect}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  );
};

export default App;

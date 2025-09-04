
import React, { useState, useMemo, useEffect, useCallback } from 'react';
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

const TimerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface QuizViewProps {
  questions: Question[];
  userAnswers: UserAnswers;
  onAnswerSelect: (questionId: number, optionIndex: number) => void;
  onSubmit: () => void;
  timeLeft: number;
  answeredCount: number;
  totalQuestions: number;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, userAnswers, onAnswerSelect, onSubmit, timeLeft, answeredCount, totalQuestions }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    
  return (
    <>
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-1">
                <div className="flex items-center space-x-2" aria-label={`Time left: ${minutes} minutes and ${seconds} seconds`}>
                    <TimerIcon className="text-indigo-600" />
                    <span className="text-lg font-bold text-gray-700 tabular-nums">{formattedTime}</span>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    {answeredCount} / {totalQuestions} Answered
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={totalQuestions}>
                <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
      <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
      {questions.map((q, index) => (
        <div key={q.id} className="mb-8 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          <p className="text-xl text-gray-800 mb-4 font-semibold">
            <span className="text-indigo-600 font-bold mr-2">{index + 1}.</span>
            {q.questionText}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((option, optionIndex) => {
              const isSelected = userAnswers[q.id] === optionIndex;
              return (
                <button
                  key={optionIndex}
                  onClick={() => onAnswerSelect(q.id, optionIndex)}
                  className={`p-4 rounded-lg text-left transition-all duration-200 transform hover:-translate-y-0.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg border-transparent'
                      : 'bg-white hover:bg-indigo-50 text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                  aria-pressed={isSelected}
                >
                  {String.fromCharCode(97 + optionIndex)}. {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      </div>
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
        if (percentage >= 80) return 'text-emerald-500';
        if (percentage >= 50) return 'text-yellow-500';
        return 'text-rose-500';
    };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
      <p className={`text-7xl font-extrabold mb-2 ${getResultColor()}`}>{percentage}%</p>
      <p className="text-xl text-gray-600 mb-8">
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
                isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'
              }`}
            >
              <p className="font-semibold text-gray-800 mb-2">{index + 1}. {q.questionText}</p>
              <div className="flex items-start space-x-3 text-sm">
                {isCorrect ? <CheckIcon className="text-emerald-500 flex-shrink-0 mt-1" /> : <XIcon className="text-rose-500 flex-shrink-0 mt-1" />}
                <div className="text-gray-700">
                    <p>Your answer: <span className="font-medium text-gray-900">{userAnswerText}</span></p>
                    {!isCorrect && <p>Correct answer: <span className="font-medium text-emerald-600">{correctAnswerText}</span></p>}
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
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, handleSubmit]);

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
  
  const handleRestart = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setTimeLeft(30 * 60); // Reset timer
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen text-gray-800 flex flex-col items-center justify-center p-4 font-sans">
      <main className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-4xl my-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
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
            timeLeft={timeLeft}
            answeredCount={answeredCount}
            totalQuestions={quizQuestions.length}
          />
        )}
      </main>
    </div>
  );
};

export default App;

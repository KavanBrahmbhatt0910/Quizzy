import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizGamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameCode, playerName } = location.state || {};

  const [questions, setQuestions] = useState([]); // Store all questions
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Store answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question index
  const [timeRemaining, setTimeRemaining] = useState(30); // Time limit for each question
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all questions at once
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeRemaining > 0 && currentQuestionIndex < questions.length) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (timeRemaining === 0) {
      handleNextQuestion();
    }
  }, [timeRemaining, currentQuestionIndex]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/get-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode: gameCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setQuestions(JSON.parse(data.body).questions);
        setTimeRemaining(30); // Reset time for the first question
      } else {
        setError(data.error || 'Failed to load questions.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = index;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeRemaining(30); // Reset time for the next question
    } else {
      submitAllAnswers(); // If it's the last question, submit all answers
    }
  };

  const submitAllAnswers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: gameCode,
          playerName,
          answers: selectedAnswers, // Submit all selected answers
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Show final score or navigate to results page
        navigate('/quiz-result', {
          state: { gameCode, playerName, score: JSON.parse(data.body).score, totalQuestions: questions.length },
        });
      } else {
        setError(data.error || 'Failed to submit answers.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (!gameCode || !playerName) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <p className="text-white text-2xl">Invalid Game Access</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <p className="text-white text-2xl">Loading Questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <p className="text-white text-2xl">{error}</p>
      </div>
    );
  }

  if (!questions.length) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-lg font-semibold">Player: {playerName}</p>
            <p className="text-sm text-gray-600">Game Code: {gameCode}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-600">Time: {timeRemaining}s</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`p-4 rounded-lg text-lg font-semibold transition duration-300 ${
                selectedAnswers[currentQuestionIndex] === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-blue-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleNextQuestion}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Answers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizGamePage;

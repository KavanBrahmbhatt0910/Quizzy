import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateQuizPage = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null); // WebSocket state
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const navigate = useNavigate();
  let room_code_variable = '';

  const resetForm = () => {
    setQuizTitle('');
    setQuestions([{
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null,
    }]);
    setCode('');
    setError('');
    setGameStarted(false);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: null,
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // setCode('');
  
    const quizData = {
      quizTitle,
      questions,
    };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/create-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });
  
      const data = await response.json();
      
      if (response.ok && data.statusCode === 200) {
        // Parse the body only once
        const roomData = JSON.parse(data.body);
        
        // Set the room code correctly
        setCode(roomData.roomCode);
  
        // Setup WebSocket connection once room is created
        const socketConnection = new WebSocket(`${process.env.REACT_APP_SOCKET_URL}?roomCode=${roomData.roomCode}&userType=host`);
        setSocket(socketConnection);
  
        // Handle WebSocket events
        socketConnection.onopen = () => {
          console.log('Connected to WebSocket');
        };
  
        socketConnection.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.action === 'startQuiz') {
            setGameStarted(true);
            navigate('/leaderboard', { state: { roomCode: roomData.roomCode } });
          }
        };
  
        socketConnection.onclose = () => {
          console.log('WebSocket disconnected');
        };
  
        socketConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } else {
        setError(data.message || 'Failed to create quiz');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (socket || code) {
      // Send message to WebSocket clients that the quiz is starting
      socket.send(JSON.stringify({ action: 'startQuiz', roomCode: code }));
      setGameStarted(true);
      navigate('/leaderboard', { state: { gameCode: code } });
    }
  };

  // Render quiz creation form
  if (!code && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Create Quiz</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
                required
              />
            </div>

            {questions.map((q, questionIndex) => (
              <div key={questionIndex} className="mb-6 p-6 border-2 border-blue-100 rounded-xl bg-blue-50/50">
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Question {questionIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter question"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {q.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <label className="block text-gray-700 mb-2">
                        Option {optionIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Correct Answer</label>
                  <select
                    value={q.correctAnswer ?? ''}
                    onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Correct Answer</option>
                    {q.options.map((option, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={addQuestion}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Add Question
              </button>
              <button
                type="submit"
                className={`bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition duration-300 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  // Render success or error screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 text-center">
        {code ? (
          <>
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-green-600 mb-4">Quiz Created!</h2>
              <p className="text-gray-700 mb-6">Your room code is:</p>
              <div className="bg-green-100 text-green-800 text-3xl font-bold py-4 rounded-lg mb-6">
                {code}
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert('Room code copied to clipboard!');
                  }}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Copy Room Code
                </button>
                <button
                  onClick={startQuiz}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300"
                >
                  Start Quiz
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-300"
                >
                  Create Another Quiz
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-red-600 mb-4">Oops!</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={resetForm}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateQuizPage;
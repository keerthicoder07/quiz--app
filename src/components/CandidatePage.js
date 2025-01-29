import React, { useState } from "react";

const CandidatePage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [isRoomCodeValid, setIsRoomCodeValid] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [candidateName, setCandidateName] = useState("");

  const handleRoomCodeSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/validate-room/${roomCode}`);
      if (!response.ok) {
        alert("Invalid room code or server error. Please try again.");
        return;
      }
      const data = await response.json();
      setIsRoomCodeValid(true);
      setQuestions(data.questions);
      setIsQuizStarted(true);
    } catch (error) {
      alert("Failed to validate room code. Please try again.");
    }
  };

  const submitResults = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/submit-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, candidateName, results }),
      });

      if (!response.ok) throw new Error("Failed to submit results");
      
      alert("Your results have been submitted successfully!");
    } catch (error) {
      alert("Failed to submit results. Please try again.");
    }
  };

  const handleAnswerSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const trimmedAnswer = selectedAnswer.trim();
    const isCorrect = trimmedAnswer === currentQuestion.correctAnswer.trim();

    setResults([...results, { question: currentQuestion.questionText, selectedAnswer: trimmedAnswer, isCorrect }]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
    } else {
      alert("Quiz completed! Submitting results...");
      submitResults();
      setIsQuizStarted(false);
    }
  };

  return (
    <div className="candidate-container">
      <h1>Candidate Quiz Page</h1>
      {!isRoomCodeValid ? (
        <div className="candidate-box">
          <h3>Enter Your Details</h3>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Enter your name"
          />
          <h3>Enter Room Code</h3>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
          />
          <button onClick={handleRoomCodeSubmit}>Submit</button>
        </div>
      ) : isQuizStarted ? (
        <div className="quiz-container">
          <h2>Quiz</h2>
          <p>Question {currentQuestionIndex + 1}/{questions.length}</p>
          <h3>{questions[currentQuestionIndex].questionText}</h3>
          {questions[currentQuestionIndex].options.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`option-${index}`}
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              />
              <label htmlFor={`option-${index}`}>{option}</label>
            </div>
          ))}
          <button onClick={handleAnswerSubmit} disabled={!selectedAnswer} style={{ marginTop: "10px" }}>
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="quiz-container">
          <h3>Quiz Completed</h3>
          <p>Thank you for participating!</p>
          <button onClick={() => window.location.reload()}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default CandidatePage;

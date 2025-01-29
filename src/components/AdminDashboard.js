import React, { useState, useEffect } from "react";
import AnalyticsChart from "./AnalyticsChart";

const AdminDashboard = () => {
  const [timer, setTimer] = useState(60);
  const [question, setQuestion] = useState({ questionText: "", options: [], correctAnswer: "" });
  const [roomCode, setRoomCode] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateData, setCandidateData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(generatedCode);
  }, []);

  const fetchCandidatePerformance = async () => {
    if (!candidateName) {
      alert("Please enter a candidate's name.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/candidate-performance/${candidateName}`);
      const data = await response.json();
      if (response.ok) {
        setCandidateData(data.performanceData);
      } else {
        alert(data.message || "Error fetching candidate performance data.");
        setCandidateData(null);
      }
    } catch (error) {
      console.error("Error fetching candidate performance:", error);
      alert("An error occurred while fetching the performance data.");
      setCandidateData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimerUpdate = (event) => {
    setTimer(event.target.value);
  };

  const addQuestion = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add question");
      }

      setQuestion({ questionText: "", options: [], correctAnswer: "" });
      alert("Question added successfully!");
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  return (
    <div className="admin-container">
     
      

      <div className="room-code">
      <h1>Admin Dashboard</h1>
        <h3>Room Code</h3>
        <p>Share this code with candidates:</p>
        <h2>{roomCode}</h2>
      </div>

      <div className="admin-content">
        {/* Left Side - Quiz Management */}
        <div className="quiz-section">
          <h3>Set Quiz Timer</h3>
          <label>
            Timer (seconds):
            <input
              type="number"
              value={timer}
              onChange={handleTimerUpdate}
              className="input-box"
            />
          </label>
          <p>Current Timer: {timer} seconds</p>

          <h3>Add Quiz Questions</h3>
          <label>
            Question Text:
            <input
              type="text"
              value={question.questionText}
              onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
              className="input-box"
            />
          </label>
          <label>
            Options (comma-separated):
            <input
              type="text"
              value={question.options.join(", ")}
              onChange={(e) => setQuestion({ ...question, options: e.target.value.split(",") })}
              className="input-box"
            />
          </label>
          <label>
            Correct Answer:
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
              className="input-box"
            />
          </label>
          <button onClick={addQuestion} className="btn">Add Question</button>
        </div>

        {/* Right Side - Performance Section */}
        <div className="performance-section">
          <h3>Search Candidate Performance</h3>
          <label>
            Candidate Name:
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="input-box"
            />
          </label>
          <button onClick={fetchCandidatePerformance} className="btn">View Performance</button>

          
          {isLoading ? (
            <p>Loading analytics...</p>
          ) : candidateData ? (
            <AnalyticsChart data={candidateData} />
          ) : (
            <p>No performance data available. Search for a candidate to view their performance.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

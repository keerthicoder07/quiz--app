import React from "react";
import Timer from "./Timer";

const Quiz = () => {
  const handleTimeUp = () => {
    alert("Time is up! Submitting your quiz.");
    // Add your quiz submission logic here
  };

  return (
    <div>
      <h1>Quiz Page</h1>
      <Timer initialTime={60} onTimeUp={handleTimeUp} />
      <p>Answer the following questions:</p>
      {/* Add quiz questions here */}
    </div>
  );
};

export default Quiz;

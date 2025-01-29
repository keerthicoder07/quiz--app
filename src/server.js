const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri =
  "mongodb+srv://keerthiofficial007:admin123@quizapp.vsdbf.mongodb.net/quizapp?retryWrites=true&w=majority";
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Database connection error:", err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // 'admin' or 'candidate'
});
const User = mongoose.model("User", userSchema);

// Quiz Schema and Model
const quizSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: String,
    },
  ],
});
const Quiz = mongoose.model("Quiz", quizSchema);

// Result Schema and Model


const resultSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  candidateName: { type: String, required: true },
  marks: { type: Number, required: true },
  totalQuestions: { type: Number, required: true }, // Add total questions field
  createdAt: { type: Date, default: Date.now },
});
const Result =mongoose.model("Result",resultSchema)

// Signup Route
app.post("/api/signup", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", role: user.role });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Question Route (Admin Functionality)
app.post("/api/add-question", async (req, res) => {
  try {
    const { roomCode, questionText, options, correctAnswer } = req.body;

    // Check if the roomCode exists
    let quiz = await Quiz.findOne({ roomCode });

    if (quiz) {
      // Add question to the existing quiz
      quiz.questions.push({ questionText, options, correctAnswer });
      await quiz.save();
      return res
        .status(201)
        .json({ message: "Question added successfully to existing room." });
    }

    // If roomCode doesn't exist, create a new quiz
    const generatedRoomCode =
      roomCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const newQuiz = new Quiz({
      roomCode: generatedRoomCode,
      questions: [{ questionText, options, correctAnswer }],
    });

    await newQuiz.save();
    return res.status(201).json({
      message: "New quiz created and question added successfully.",
      roomCode: generatedRoomCode,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Submit Results Route
app.post("/api/submit-results", async (req, res) => {
  try {
    const { roomCode, candidateName, results } = req.body;

    if (!roomCode || !candidateName || !results || !Array.isArray(results)) {
      return res.status(400).json({ error: "Invalid or missing fields" });
    }

    const quiz = await Quiz.findOne({ roomCode });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found for the given roomCode" });
    }

    // Calculate marks
const totalQuestions = quiz.questions.length;
let marks = 1; // Explicit initialization

results.forEach(({ question, selectedAnswer }) => {
  const matchedQuestion = quiz.questions.find(q => 
    q.questionText.trim().replace(/\s+/g, " ").toLowerCase() === question.trim().replace(/\s+/g, " ").toLowerCase()
  );

  if (matchedQuestion) {
    const correctAnswer = matchedQuestion.correctAnswer.trim().replace(/\s+/g, " ").toLowerCase();
    const userAnswer = selectedAnswer.trim().replace(/\s+/g, " ").toLowerCase();

    if (userAnswer === correctAnswer) {
      marks++; // Increment marks correctly
    }
  }
});


// Save results with total questions
const resultEntry = new Result({ roomCode, candidateName, marks, totalQuestions });
await resultEntry.save();




    res.status(201).json({ message: "Results submitted successfully!" });
  } catch (error) {
    console.error("Error submitting results:", error);
    res.status(500).json({ error: "Failed to submit results" });
  }
});

// Get Candidate Performance Route
app.get("/api/candidate-performance/:candidateName", async (req, res) => {
  const { candidateName } = req.params;

  try {
    const results = await Result.find({ candidateName });

    if (results.length === 0) {
      return res.status(404).json({ message: "No performance data found." });
    }

    let totalMarks = 0;
    let totalQuestions = 0;

    const performanceData = results.map((entry) => {
      totalMarks += entry.marks;  // Sum up all marks
      totalQuestions += entry.totalQuestions;  // Ensure totalQuestions is stored

      return {
        quizName: entry.roomCode,  
        score: entry.marks,  
        percentage: ((entry.marks / entry.totalQuestions) * 100).toFixed(2),  // Compute percentage
      };
    });

    res.status(200).json({
      performanceData,
      totalMarks,
      totalQuestions,
      overallPercentage: ((totalMarks / totalQuestions) * 100).toFixed(2), // Overall percentage
    });
  } catch (error) {
    console.error("Error fetching candidate performance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Validate Room Code
app.get("/api/validate-room/:roomCode", async (req, res) => {
  const { roomCode } = req.params;

  try {
    // Check if the roomCode exists in the database
    const room = await Quiz.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: "Room code not found" });
    }

    // Return the questions for the room
    res.status(200).json({ questions: room.questions });
  } catch (error) {
    console.error("Error validating room code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
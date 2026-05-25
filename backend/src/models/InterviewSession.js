import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id:           { type: Number, required: true },
  type:         { type: String, enum: ['coding', 'mcq', 'bugfix', 'output', 'conceptual'], default: 'coding' },
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  category:     { type: String, default: 'General' },
  difficulty:   { type: String, default: 'medium' },
  hint:         { type: String, default: '' },
  starterCode:  { type: String, default: '' },
  sampleInput:  { type: String, default: '' },
  sampleOutput: { type: String, default: '' },
  constraints:  { type: [String], default: [] },
  options:      { type: [String], default: [] },       // MCQ options
  correctOption:{ type: Number, default: -1 },         // MCQ correct index
  solution:     { type: String, default: '' },
  timeComplexity:  { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
  explanation:  { type: String, default: '' },
  concepts:     { type: [String], default: [] },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  questionId:    { type: Number, required: true },
  userAnswer:    { type: String, default: '' },
  skipped:       { type: Boolean, default: false },
  timeTaken:     { type: Number, default: 0 },         // seconds
  score:         { type: Number, default: 0 },
  verdict:       { type: String, default: 'SKIP' },
  feedback:      { type: String, default: '' },
  strengths:     { type: [String], default: [] },
  weaknesses:    { type: [String], default: [] },
  mistakes:      { type: [String], default: [] },
  correctedCode: { type: String, default: '' },
  timeComplexity:  { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:       { type: String, default: 'generic' },
  domain:     { type: String, default: 'DSA' },
  language:   { type: String, default: 'javascript' },
  difficulty: { type: String, default: 'medium' },
  totalTime:  { type: Number, default: 900 },          // seconds
  questions:  { type: [questionSchema], default: [] },
  answers:    { type: [answerSchema],   default: [] },
  status:     { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  // Final results
  totalScore:    { type: Number, default: 0 },
  percentage:    { type: Number, default: 0 },
  grade:         { type: String, default: '' },
  correct:       { type: Number, default: 0 },
  wrong:         { type: Number, default: 0 },
  skipped:       { type: Number, default: 0 },
  strengths:     { type: [String], default: [] },
  weaknesses:    { type: [String], default: [] },
  aiFeedback:    { type: String, default: '' },
  improvements:  { type: [String], default: [] },
  weakTopics:    { type: [String], default: [] },
  completedAt:   { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('InterviewSession', interviewSessionSchema);

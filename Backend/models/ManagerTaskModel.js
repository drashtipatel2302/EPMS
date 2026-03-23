const mongoose = require("mongoose");

const taskNoteSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role:      { type: String },  // MANAGER / EMPLOYEE
  message:   { type: String, required: true },
}, { timestamps: true });

const managerTaskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project:     { type: String, default: "" },
    priority:    { type: String, enum: ["LOW","MEDIUM","HIGH"], default: "MEDIUM" },
    status:      { type: String, enum: ["PENDING","IN_PROGRESS","COMPLETED"], default: "PENDING" },
    dueDate:     { type: Date },
    estimatedHours:  { type: Number },
    actualHours:     { type: Number },        // filled by employee on completion
    completionNote:  { type: String, default: "" }, // employee's final note
    // thread of notes between manager & employee
    notes: [taskNoteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ManagerTask", managerTaskSchema);

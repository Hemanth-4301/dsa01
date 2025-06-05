import mongoose from "mongoose"

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["solved", "unsolved", "attempted"],
    default: "unsolved",
  },
  starred: {
    type: Boolean,
    default: false,
  },
  lastAttempted: {
    type: Date,
    default: Date.now,
  },
  attempts: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["solved", "attempted"],
      },
    },
  ],
})

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true })

export default mongoose.model("UserProgress", userProgressSchema)

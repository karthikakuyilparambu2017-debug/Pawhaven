import mongoose from "mongoose";

const careLogSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    careDate: {
      type: Date,
      required: true,
    },

    feeding: {
      type: String,
      trim: true,
      default: "",
    },

    walking: {
      type: String,
      trim: true,
      default: "",
    },

    grooming: {
      type: String,
      trim: true,
      default: "",
    },

    medication: {
      type: String,
      trim: true,
      default: "",
    },

    activityNotes: {
      type: String,
      trim: true,
      default: "",
    },

    mood: {
      type: String,
      enum: ["HAPPY", "CALM", "ACTIVE", "ANXIOUS", "SICK", "UNKNOWN"],
      default: "UNKNOWN",
    },

    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CareLog = mongoose.model("CareLog", careLogSchema);

export default CareLog;
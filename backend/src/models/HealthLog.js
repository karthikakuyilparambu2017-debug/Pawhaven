import mongoose from "mongoose";

const healthLogSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    veterinarian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    visitDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    diagnosis: {
      type: String,
      trim: true,
      required: true,
    },

    symptoms: {
      type: String,
      trim: true,
      default: "",
    },

    treatment: {
      type: String,
      trim: true,
      default: "",
    },

    medicines: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        dosage: {
          type: String,
          trim: true,
          default: "",
        },

        duration: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

    vaccinationGiven: {
      type: Boolean,
      default: false,
    },

    vaccinationName: {
      type: String,
      trim: true,
      default: "",
    },

    nextVisitDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const HealthLog = mongoose.model("HealthLog", healthLogSchema);

export default HealthLog;
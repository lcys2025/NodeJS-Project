import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    // Reference to the user making the booking
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Reference to the trainer being booked
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Date of the booking (YYYY-MM-DD format)
    bookingDate: {
      type: Date,
      required: true,
      validate: {
        validator: (date) => {
          return date >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'Booking date must be today or in the future'
      }
    },
    // Type of session
    sessionType: {
      type: String,
      enum: ['personal', 'group', 'couple', 'rehabilitation', 'other'],
      required: true
    },
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending'
    },
    // Additional notes
    notes: {
      type: String,
      maxlength: 500
    }
  },
  {
    collection: "bookings",
    timestamps: true,
  }
);

// Update the updatedAt field before saving
bookingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Booking", bookingSchema);
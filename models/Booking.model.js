import mongoose from "mongoose";

const bookingSchema = new Schema(
	{
		// Reference to the user making the booking
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'gymer',
			required: true
		},

		// Reference to the trainer being booked
		trainerId: {
			type: Schema.Types.ObjectId,
			ref: 'trainer',
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

		// Time slot for the booking
		timeSlot: {
			startTime: {
				type: String,
				required: true,
				match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
			},
			endTime: {
				type: String,
				required: true,
				match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
			}
		},

		// Type of session (personal training, group session, etc.)
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

		// Additional notes from the user
		notes: {
			type: String,
			maxlength: 500
		},

		// Payment information
		payment: {
			amount: {
				type: Number,
				required: true,
				min: 0
			},
			currency: {
				type: String,
				default: 'USD'
			},
			status: {
				type: String,
				enum: ['pending', 'paid', 'refunded', 'failed'],
				default: 'pending'
			},
			method: String
		},

		// Timestamps
		createdAt: {
			type: Date,
			default: Date.now
		},
		updatedAt: {
			type: Date,
			default: Date.now
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
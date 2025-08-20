import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 30,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate: {
				validator: (v) => validator.isEmail(v),
				message: "Please enter a valid email",
			},
		},
		plan: {
			type: String,
			required: true,
			lowercase: true,
			enum: ['basic', 'premium', 'vip'],
		},
		role: {
			type: String,
			required: false,
			lowercase: true,
			enum: ['gymer', 'trainer'],
			default: 'gymer',
		},
		remainingTrainerDays: {
			type: Number,
			required: true,
			default: 0,
		},
		payment: {
			amount: {
				type: Number,
				required: true,
				min: 0,
				default: 0
			},
			currency: {
				type: String,
				default: 'USD'
			},
			status: {
				type: String,
				enum: ['pending', 'paid', 'refunded', 'failed'],
				default: 'paid'
			},
			method: String
		},
	},
	{
		collection: "users",
		timestamps: true,
	}
);

export default mongoose.model("User", userSchema);
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, trim: true, maxlength: 30 },
		username: {
			type: String,
			required: true,
			unique: true,
			minlength: 3,
			maxlength: 30,
			trim: true,
		},
		password: {
			type: String,
			minlength: 8,
			required: true,
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
	},
	{
		collection: "users",
		timestamps: true,
	}
);

export default mongoose.model("User", userSchema);

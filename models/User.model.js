import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			maxlength: 30,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			minlength: 3,
			maxlength: 30,
		},
		password: {
			type: String,
			minlength: 6,
		},
		email: {
			type: String,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
		},
	},
	{
		collection: "users",
		timestamps: true,
	}
);

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: String,
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: String,
		email: String,
	},
	{
		collection: "users",
		timestamps: true,
	}
);

export default mongoose.model("User", userSchema);

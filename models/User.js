import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id: Number,
  name: String,
  username: String,
  password: String,
});

export default mongoose.model("User", UserSchema);

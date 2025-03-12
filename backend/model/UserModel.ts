import mongoose from "mongoose"

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
  _id: String,
  username: String,
  firebaseToken: [String],
});

export const UserModel = mongoose.model("User", UserModelSchema);

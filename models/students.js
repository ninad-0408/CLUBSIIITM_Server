import mongoose from "mongoose";

export const studentSchema = mongoose.Schema({
    name: {
        type: String,
        default: "",
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phoneno: Number,
    linkedin: String,
    bio: String,
    branch: String,
    batch: String,
    rollNo: String,
    googleId: String

});

const studentModel = mongoose.model("studentModel", studentSchema);

export default studentModel;
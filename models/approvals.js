import mongoose from "mongoose";

const Schema = mongoose.Schema;

const approvalSchema = mongoose.Schema({
    studentid: {
        type: Schema.Types.ObjectId,
        ref: "studentModel"
    },
    clubid: {
        type: Schema.Types.ObjectId,
        ref: "clubModel"
    },
    approved: {
        type: Boolean,
        default: false
    },
    declined: {
        type: Boolean,
        default: false
    }
});

const approvalModel = mongoose.model("approvalModel", approvalSchema);

export default approvalModel;
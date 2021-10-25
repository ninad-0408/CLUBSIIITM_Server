import mongoose from "mongoose";

const Schema = mongoose.Schema;

const clubSchema = mongoose.Schema({
    
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: String,
    achievements: [String],
    eventids: [{
        type: Schema.Types.ObjectId,
        ref: "eventModel"
    }],
    memberids:  [{
        type: Schema.Types.ObjectId,
        ref: "studentModel"
    }],
    presidentid: {
        type: Schema.Types.ObjectId,
        ref: "studentModel"
    },
    typeofclub: {
        type: String,
        required: true
    },
    image: String
});

const clubModel = mongoose.model("clubModel", clubSchema);

export default clubModel;
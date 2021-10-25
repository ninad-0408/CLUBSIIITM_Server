import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    date: {
        type: Date,
    },
    meetlink: {
        type: String,
        unique: true
    },
    description: String,
    image: String
});

const eventModel = mongoose.model("eventModel", eventSchema);

export default eventModel;
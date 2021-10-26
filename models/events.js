import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
    },
    meetlink: {
        type: String,
    },
    description: String,
    image: String
});

const eventModel = mongoose.model("eventModel", eventSchema);

export default eventModel;
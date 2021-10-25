import mongoose from "mongoose";
import clubModel from "../models/clubs.js";
import studentModel from "../models/students.js";

export const getClub = async (req, res) => {

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
        var err = new Error("Club not found.");
        err.status = 406;
        return err;
    }
    var club0;

    try {
        club0 = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;

    }

    if(club0 != null)
    {
        try {
            const club = await clubModel.findOne({ _id: clubId })
                                        .populate("memberids", "name")
                                        .populate("presidentid", "name")
                                        .populate("eventids", ["name", "image"]);
            return club;

        } catch (error) {
            error.message = "Unable to connect with database.";
            return error;
        }
    }
    else {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }

};

export const getTechClubs = async (req, res) => {

    try {
        const clubs = await clubModel.find({ typeofclub: "Technical" }, ["name", "image"]);
        return clubs;

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;
    }

};

export const getCultClubs = async (req, res) => {

    try {
        const clubs = await clubModel.find({ typeofclub: "Cultural" }, ["name", "image"]);
        return clubs;

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;
    }

};

export const putClub = async (req, res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { clubId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    {
        var err = new Error("The Club doesn't exist.");
        err.status = 406;
        return err;
    }

    var body = req.body;
    var club;

    try {
        club = await clubModel.findById(clubId);

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;

    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }

        try {
            if(!(req.file === undefined))
            {
                if(!(club.image === undefined))
                {
                    var gfs;
                    const conn = mongoose.connection;
                    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });

                    await gfs.delete(new mongoose.Types.ObjectId(club.image));
                }

                body.image = req.file.id;
            }

            await clubModel.updateOne({ _id: clubId }, body);
            return (await clubModel.findOne(body));

        } catch (error) {
            error.status = 400;
            error.message = "The club name already exist.";
            return error;
        }
    }
    else {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }
};

export const delClub = async (req, res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { clubId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }

    const body = req.body;
    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;

    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }

        try {
            if(club.image != undefined)
            {
                var gfs;
                const conn = mongoose.connection;
                gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "Images" });

                await gfs.delete(new mongoose.Types.ObjectId(club.image));
            }
            await clubModel.deleteOne({ _id: clubId });
            return body;

        } catch (error) {
            error.message = "Unable to connect with database.";
            return error;
        }
    }
    else {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }
};

export const removeMember = async (req,res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { clubId, studentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }

    if(!mongoose.Types.ObjectId.isValid(studentId))
    {
        var err = new Error("The Student doesn't exsist.");
        err.status = 406;
        return err;
    }

    var student;

    try {
        student = await studentModel.findById(studentId);        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;           
    }

    if(student === null)
    {
        var err = new Error("The Student doesn't exsist.");
        err.status = 406;
        return err;
    }

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;

    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        {
            var err = new Error("You are not president of club.");
            err.status = 400;
            return err;
        }

        if(club.memberids.indexOf(student._id) === -1)
        {
            var err = new Error("The Student is not member of this club.")
            err.status = 400;
            return err;
        }

        try {
            await clubModel.updateOne({ _id: clubId }, { $pull: { memberids: studentId }});
            return  { student, club };

        } catch (error) {
            error.message = "Unable to connect with database.";
            return error;
        }
    }
    else {
        var err = new Error("The Club doesn't exsist.");
        err.status = 406;
        return err;
    }
};

export const getJoinButton = async (req,res) => {

    if(req.session.passport === undefined)
    {
        return false;
    }

    const { clubId } = req.params;

    var memcheck;

    try {
        memcheck = await clubModel.find({ _id: clubId, memberids: { $elemMatch: { $eq: req.session.passport.user } } });
        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;        
    }

    if(memcheck.length === 0)
    {
        return true;
    }

    return false;

};

export const getVerifyPresident = async (req,res) => {

    if(req.session.passport === undefined)
    {
        return false;
    }

    const { clubId } = req.params;

    var prescheck;

    try {
        prescheck = await clubModel.find({ _id: clubId, presidentid: req.session.passport.user });
        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;        
    }

    if(prescheck.length >= 1)
    {
        return true;
    }

    return false;

};
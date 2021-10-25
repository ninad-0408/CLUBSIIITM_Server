import mongoose from "mongoose";
import clubModel from "../models/clubs.js";
import studentModel from "../models/students.js";
import { notValid, notAuthorized, notFound, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

export const getClub = async (req, res) => {

    const { clubId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    var club0;

    try {
        club0 = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);
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
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Club");

};

export const getTechClubs = async (req, res) => {

    try {
        const clubs = await clubModel.find({ typeofclub: "Technical" }, ["name", "image"]);
        return clubs;

    } catch (error) {
        return dataUnaccesable(res);
    }

};

export const getCultClubs = async (req, res) => {

    try {
        const clubs = await clubModel.find({ typeofclub: "Cultural" }, ["name", "image"]);
        return clubs;

    } catch (error) {
        return dataUnaccesable(res);
    }

};

export const putClub = async (req, res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    var body = req.body;
    var club;

    try {
        club = await clubModel.findById(clubId);

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        return notAuthorized(res);

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
            error.status = 406;
            error.message = "The club name already exist.";
            return error;
        }
    }
    else  
    return notFound(res,"Club");
};

export const delClub = async (req, res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    const body = req.body;
    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        return notAuthorized(res);

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
            return dataUnaccesable(res);
        }
    }
    else  
    return notFound(res,"Club");
};

export const removeMember = async (req,res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { clubId, studentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);

    if(!mongoose.Types.ObjectId.isValid(studentId))
    return notValid(res);

    var student;

    try {
        student = await studentModel.findById(studentId);        
    } catch (error) {
        return dataUnaccesable(res);           
    }

    if(student === null)  
    return notFound(res,"Student");

    var club;

    try {
        club = await clubModel.findOne({ _id: clubId });

    } catch (error) {
        return dataUnaccesable(res);
    }

    if (club != null) 
    {
        if(req.session.passport.user != club.presidentid )
        return notAuthorized(res);

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
            return dataUnaccesable(res);
        }
    }
    else   
    return notFound(res,"Club");
};

export const getJoinButton = async (req,res) => {

    if(req.session.passport === undefined)
    return false;

    const { clubId } = req.params;

    var memcheck;

    try {
        memcheck = await clubModel.find({ _id: clubId, memberids: { $elemMatch: { $eq: req.session.passport.user } } });
        
    } catch (error) {
        return dataUnaccesable(res);       
    }

    if(memcheck.length === 0)
    return true;

    return false;

};

export const getVerifyPresident = async (req,res) => {

    if(req.session.passport === undefined)
    return false;

    const { clubId } = req.params;

    var prescheck;

    try {
        prescheck = await clubModel.find({ _id: clubId, presidentid: req.session.passport.user });
        
    } catch (error) {
        return dataUnaccesable(res);       
    }

    if(prescheck.length >= 1)
    return true;

    return false;

};
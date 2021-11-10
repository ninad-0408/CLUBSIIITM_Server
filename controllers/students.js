import studentModel from '../models/students.js';
import mongoose from "mongoose";
import clubModel from '../models/clubs.js';
import { notValid, notAuthorized, notFound, dataUnaccesable, notLoggedIn } from "../alerts/errors.js";

export const getStudent = async (req, res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { studentId } = req.params;

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

    return res.status(200).json({ student })
};

export const patchStudent = async (req, res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { studentId } = req.params;
    const body = req.body;

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

    if(req.session.passport.user != studentId)
    return notAuthorized(res);

    try {
        await studentModel.findByIdAndUpdate(studentId, { bio: body.bio, linkedin: body.linkedin, phoneno: body.phoneno});        
    } catch (error) {
        return dataUnaccesable(res);          
    }

    return res.status(200).json({ student, message: "The profile is updated successfully." });
};

export const delStudent = async (req, res) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);

    const { studentId } = req.params;

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

    if(req.session.passport.user != studentId)
    return notAuthorized(res);

    try {
        await clubModel.updateMany({ memberids: { $elemMatch: { $eq: student._id } } }, { $pull: { memberids: student._id } });
        await studentModel.findByIdAndDelete(studentId); 
    } catch (error) {
        return dataUnaccesable(res);          
    }

    return res.status(200).json({ studentId, message: "The profile is deleted successfully." });
};

import studentModel from '../models/students.js';
import mongoose from "mongoose";
import clubModel from '../models/clubs.js';

export const getStudent = async (req, res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { studentId } = req.params;

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

    return student;
};

export const putStudent = async (req, res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { studentId } = req.params;
    const body = req.body;

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

    if(req.session.passport.user != studentId)
    {
        var err = new Error("You are not authorized to edit this detail.");
        err.status = 406;
        return err;
    }

    try {
        await studentModel.findByIdAndUpdate(studentId, { bio: body.bio, linkedin: body.linkedin, phoneno: body.phoneno});        
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;           
    }

    return { message: "The profile is updated successfully." };
};

export const delStudent = async (req, res) => {

    if(req.session.passport === undefined)
    {
        var err = new Error("You are not logged in.");
        err.status = 400;
        return err;
    }

    const { studentId } = req.params;

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

    if(req.session.passport.user != studentId)
    {
        var err = new Error("You are not authorized to delete user.");
        err.status = 406;
        return err;
    }

    try {
        await clubModel.updateMany({ memberids: { $elemMatch: { $eq: student._id } } }, { $pull: { memberids: student._id } });
        await studentModel.findByIdAndDelete(studentId); 
    } catch (error) {
        error.message = "Unable to connect with database.";
        return error;           
    }

    // Logging out remaining.

    return { message: "The profile is deleted successfully." };
};

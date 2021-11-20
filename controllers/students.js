import studentModel from '../models/students.js';
import clubModel from '../models/clubs.js';
import { notAuthorized, notFound, dataUnaccesable } from "../alerts/errors.js";
import approvalModel from '../models/approvals.js';

export const getStudent = async (req, res) => {

    const { studentId } = req.params;

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

    const { studentId } = req.params;
    const body = req.body;

    var student;

    try {
        student = await studentModel.findById(studentId);        
    } catch (error) {
        return dataUnaccesable(res);          
    }

    if(student === null)  
    return notFound(res,"Student");

    if(req.user._id != studentId)
    return notAuthorized(res);

    try {
        await studentModel.findByIdAndUpdate(studentId, { bio: body.bio, linkedin: body.linkedin, phoneno: body.phoneno});        
    } catch (error) {
        return dataUnaccesable(res);          
    }

    return res.status(200).json({ student, message: "The profile is updated successfully." });
};

export const delStudent = async (req, res) => {

    const { studentId } = req.params;

    var student;

    try {
        student = await studentModel.findById(studentId);        
    } catch (error) {
        return dataUnaccesable(res);          
    }

    if(student === null)  
    return notFound(res,"Student");

    if(req.user._id != studentId)
    return notAuthorized(res);

    try {
        await clubModel.updateMany({ memberids: { $elemMatch: { $eq: student._id } } }, { $pull: { memberids: student._id } });
        await approvalModel.deleteMany({ studentid: studentId });
        await studentModel.findByIdAndDelete(studentId);
    } catch (error) {
        return dataUnaccesable(res);          
    }

    return res.status(200).json({ studentId, message: "The profile is deleted successfully." });
};

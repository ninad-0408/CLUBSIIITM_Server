import mongoose from 'mongoose';
import { notValid, notLoggedIn } from '../alerts/errors.js';

export const isLoggedIn = (req,res,next) => {

    if(req.session.passport === undefined)
    return notLoggedIn(res);
    else
    next();
}

export const checkClub = (req,res,next) => {
    
    const { clubId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(clubId))
    return notValid(res);
    else
    next();

};

export const checkStudent = (req,res,next) => {
    
    const { studentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(studentId))
    return notValid(res);
    else
    next();
    
};

export const checkEvent = (req,res,next) => {
    
    const { eventId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(eventId))
    return notValid(res);
    else
    next();
    
};

export const checkApproval = (req,res,next) => {
    
    const { approvalId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(approvalId))
    return notValid(res);
    else
    next();
    
};
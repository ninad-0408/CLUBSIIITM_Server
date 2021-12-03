import studentModel from "../models/students.js";
import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {

    try {
        const token = req.headers.authorization?.split(' ')[1];
        const googleId = jwt.decode(token)?.sub;

        const user = await studentModel.findOne({ googleId: googleId });

        req.user = user;

    } catch (error) {
        console.log(error);
    }
    
    next();
};

export default auth;
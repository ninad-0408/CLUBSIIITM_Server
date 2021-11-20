import studentModel from '../models/students.js';
import { dataUnaccesable, notAuthorized } from '../alerts/errors.js';

export const getAuth = async (req, res) => {

    const { profile } = req.body;

    try {
        var user = await studentModel.findById(profile._id);

        if(!user)
        {
            if(!profile.email.value.substring(11, 23)==="@iiitm.ac.in")
            return notAuthorized(res);

            var branch=profile.email.value.substring(0, 3).toUpperCase();
            var rollno=profile.email.value.substring(4, 8)+branch+profile.emails[0].value.substring(8, 11);
            var batch=profile.email.value.substring(4, 8);
            user = await studentModel.create({ name: profile.name, googleId: profile.googleId, email: profile.email, branch, rollno, batch });

            return res.status(200).json({ profile: user });
        }
        
    } catch (error) {
        return dataUnaccesable(res);
    }
}

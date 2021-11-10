import { mailing } from "./mail"
import dotenv from "dotenv";
dotenv.config();

var mailOptions =
        {
            from: process.env.EMAIL,
            to: "jayraykhere@gmail.com",
            subject: `WELCOME to abc Club`,
            text: `Congratulations boss, your approval for joining the CLUB Club is approved.`
        };

mailing(mailOptions);
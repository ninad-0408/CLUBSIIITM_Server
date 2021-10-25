import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";
dotenv.config();

const storage = GridFsStorage({
    url: process.env.CONNECTION_URL,
    options: { useUnifiedTopology: true, useNewUrlParser: true },
    file: (req,file) => {

        const match = ["image/png", "image/jpg", "image/jpeg"];

        if(match.indexOf(file.mimetype) === -1)
        {
            return ;
        }

        return {
            bucketName: "Images",
            filename: `${Date.now()}`
        };
    }
});

const imageUpload = multer({ storage });

export default imageUpload;
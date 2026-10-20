
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(__dirname, "../profileUpload");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

module.exports = multer({
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDirectory);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const uniqueName =
                Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;

            cb(null, uniqueName);
        }
    }),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (![".jpg", ".jpeg", ".png"].includes(ext)) {
            return cb(new Error("Unsupported file type!"));
        }

        cb(null, true);
    }
});

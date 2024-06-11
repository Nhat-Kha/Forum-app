import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import { checkFileExec } from "./checkFileExec";

const storage = (dest, name) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  return multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "..", "public", dest),
    filename: (req, file, callback) => {
      callback(null, name + "_" + Date.now() + path.extname(file.originalname));
    },
  });
};

const upload = multer({
  storage: storage("forum", "attach"),
  fileFilter: (req, file, callback) => checkFileExec(file, callback),
  limits: { fields: 10, fileSize: 1048576 * 20 },
}).array("attach", 4);

const singleUpload = multer({
  storage: storage("uploads", "file"),
  fileFilter: (req, file, callback) => checkFileExec(file, callback),
  limits: { fields: 10, fileSize: 1048576 * 80 },
}).single("file");

const messageUpload = multer({
  storage: storage("message", "file"),
  fileFilter: (req, file, callback) => checkFileExec(file, callback),
  limits: { fields: 10, fileSize: 1048576 * 80 },
}).array("file", 4);

export { storage, upload, singleUpload, messageUpload };

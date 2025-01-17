const checkFileExec = (file, callback) => {
  if (
    file.mimetype === "text/javascript" ||
    file.mimetype === "text/html" ||
    file.mimetype === "text/css" ||
    file.mimetype === "application/json" ||
    file.mimetype === "application/ld+json" ||
    file.mimetype === "application/php"
  ) {
    callback("file format is not allowed", false);
  } else callback(null, true);
};

const videoTypes = [
  "video/mp4",
  "video/webm",
  "video/avi",
  "video/msvideo",
  "video/x-msvideo",
  "video/mpeg",
  "video/3gpp",
  "video/quicktime",
];

export { checkFileExec, videoTypes };

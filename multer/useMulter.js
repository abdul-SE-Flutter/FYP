const multer = require("multer");
module.exports = {
  getStorage: (filePath) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, filePath);
      },
      filename: function (req, file, cb) {
        const uniqueName =
          new Date().toISOString().replace(/:/g, "_") + file.originalname;
        cb(null, uniqueName);
      },
    });
    return storage;
  },
};

// Admins control on users
const { User } = require("../../models/user");
const { deleteAccount } = require("../auth");
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users || users.length == 0) {
      const err = new Error("No user found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.removeUser = deleteAccount;

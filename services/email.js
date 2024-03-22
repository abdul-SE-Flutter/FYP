const nodemailer = require("nodemailer");
const email_existence = require("./test");

module.exports = {
  checkEmail: (email) => {
    return new Promise((resolve, reject) => {
      email_existence.check(
        email,
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        },
        4000,
        "20011598-076@uog.edu.pk"
      );
    });
  },
};

exports.sendEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "20011598-076@uog.edu.pk",
      pass: "gtui ccjg shld vuha",
    },
  });
  const mailOptions = {
    from: "20011598-076@uog.edu.pk",
    to: email,
    subject: "Sending Email to verify",
    text: "Verification code is : 4266262@",
  };
  await transporter.sendMail(mailOptions);
};

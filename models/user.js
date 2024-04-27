const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    imageUrl: String,
    username: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    hasOtherScholarship: {
      type: Boolean,
      required: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    hasHiredEpert: String,
    hasFirstDivisionThroughtAcademicia: Boolean,
  },
  { timestamps: true }
);

const collegeStudentSchema = new mongoose.Schema({
  SSC_prcntg: {
    type: Number,
    required: true,
  },
});

const universityStudentSchema = new mongoose.Schema({
  HSC_prcntg: {
    type: Number,
    required: true,
  },
  cgpa: {
    type: Number,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  SSC_prcntg: {
    type: Number,
    required: true,
  },
});

const postGradeStudentSchema = new mongoose.Schema({
  cgpa: {
    type: Number,
    required: true,
  },
  hasCompletedMS: {
    type: Boolean,
    required: true,
  },
  isEmployeeOfPublicSector: Boolean,
});

const discriminator = "role";
const options = {
  discriminatorKey: discriminator,
};

const User = mongoose.model("User", userSchema);
const CollegeStudent = User.discriminator(
  "CollegeStudent",
  collegeStudentSchema,
  options
);
const UniversityStudent = User.discriminator(
  "UniversityStudent",
  universityStudentSchema,
  options
);
const PostGraduateStudent = User.discriminator(
  "PostGraduateStudent",
  postGradeStudentSchema,
  options
);

module.exports = {
  User,
  CollegeStudent,
  UniversityStudent,
  PostGraduateStudent,
};

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    imageUrl: String,
    username: {
      type: String,
      required: function(){
        return this.role !== "Admin" && this.role !== "Agent"
      },

    },
    age: {
      type: Number,
      required: function(){
        return this.role !== "Admin"  && this.role !== "Agent"
      },
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
      required: function(){
        return this.role !== "Admin"  && this.role !== "Agent"
      },
    },
    hasOtherScholarship: {
      type: Boolean,
      required: function(){
        return this.role !== "Admin"  && this.role !== "Agent"
      },
    },
    monthlyIncome: {
      type: Number,
      required: function(){
        return this.role !== "Admin"  && this.role !== "Agent"
      },
    },
    role: {
      type: String,
      required: true,
      enum : ['CollegeStudent', 'UniversityStudent', 'PostGraduateStudent' , 'Admin' , 'Agent']
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

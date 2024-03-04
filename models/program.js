const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Base schema for the scholarship program
const scholarshipProgramSchema = new Schema(
  {
    // Common fields
    imageUrl: String,
    targetedRegions: {
      type: [String],
      required: true,
    },
    lastDateToApply: { type: String, required: true },
    maxAge: { type: Number, required: true },
    onlyForPublicUnis: Boolean,
    maxIncomeLimit: Number,
    amountOfScholarship: Number,
    minQualification: { type: String, required: true },
    description: { type: String, required: true },
    title: { type: String, required: true },
    durationOfProgram: String,
  },
  {
    timestamps: true,
  }
);

// Discriminator key
const discriminatorKey = "minQualification";

// College student schema
const collegeStudentProgramSchema = new Schema({
  minSHCPrcntg: Number,
});

// University student schema (assumed to be the same as college student for this example)
const universityStudentProgramSchema = new Schema({
  minCGPA: { type: Number, required: true },
  minSHCPrcntg: { type: Number, required: true },
  minSSCPrcntg: { type: Number },
  minSemester: Number,
});

// MS student schema
const msStudentProgramSchema = new Schema({
  minCGPA: { type: Number, required: true },
  requiredEmployeeOfPublicSector: Boolean,
});

// PhD student schema
const phdStudentProgramSchema = new Schema({
  requiredEmployeeOfPublicSector: Boolean,
  minCGPA: Number,
  firstDivisionThroughtAcademicia: Boolean,
});

// Discriminator options
const options = {
  discriminatorKey: discriminatorKey,
};

// Create discriminators
const Program = mongoose.model("Program", scholarshipProgramSchema);
const CollegeStudentProgram = Program.discriminator(
  "CollegeStudentProgram",
  collegeStudentProgramSchema,
  options
);
const UniversityStudentProgram = Program.discriminator(
  "UniversityStudentProgram",
  universityStudentProgramSchema,
  options
);
const MSStudentProgram = Program.discriminator(
  "MSStudentProgram",
  msStudentProgramSchema,
  options
);
const PhdStudentProgram = Program.discriminator(
  "PhdStudentProgram",
  phdStudentProgramSchema,
  options
);

module.exports = {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  MSStudentProgram,
  PhdStudentProgram,
};

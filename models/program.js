const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Base schema for the scholarship program
const scholarshipProgramSchema = new Schema(
  {
    // Common fields

    programLink: String,
    imageUrl: String,
    lastDateToApply: String,
    maxAge: Number,
    maxIncomeLimit: Number,
    amountOfScholarship: String,
    durationOfProgram: String,

    targetedRegions: {
      type: [String],
      required: true,
    },
    minQualification: { type: String, required: true },
    description: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    FAQs: [{ qs: String, ans: String }],
    eligibilityCriteria: [String],
    termsAndConditions: [String],
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
  onlyForPublicUnis: Boolean,
  requiresUniversityRank: Boolean,
  requiresFirstDivison: Boolean,
  minSHCPrcntg: Number,
  minSSCPrcntg: Number,
  maxSemester: Number,
  minCGPA: Number,
  targetedDisciplines: [String],
  mustHoldInternationalUniversityAcceptance: Boolean,
  onlyForSpecificDisciplines: Boolean,
});

// MS student schema and PhD student schema
const postGraduateStudentProgramSchema = new Schema({
  requiresFirstDivison: Boolean,
  minCGPA: { type: Number, required: true },
  targetedDisciplines: [String],
  mustHoldInternationalUniversityAcceptance: Boolean,
  requiresEmployeeOfPublicSector: Boolean,
  isPHD_program: Boolean,
  onlyForSpecificDisciplines: Boolean,
  onlyForPublicUnis: Boolean,
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
const PostGraduateStudentProgram = Program.discriminator(
  "PostGraduateStudentProgram",
  postGraduateStudentProgramSchema,
  options
);

module.exports = {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  PostGraduateStudentProgram,
};

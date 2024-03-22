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
  minSHCPrcntg: Number,
  minSSCPrcntg: Number,
  minSemester: Number,
  minCGPA: { type: Number, required: true },
  targetedDisciplines: {
    type: [String],
    required: function () {
      return this.category === "international";
    },
  },
  mustHoldInternationalUniversityAcceptance: Boolean,
});

// MS student schema
const msStudentProgramSchema = new Schema({
  requiresFirstDivison: Boolean,
  minCGPA: { type: Number, required: true },
  targetedDisciplines: {
    type: [String],
    required: function () {
      return this.category === "international";
    },
  },
  mustHoldInternationalUniversityAcceptance: Boolean,
  requiresEmployeeOfPublicSector: Boolean,
});

// PhD student schema
const phdStudentProgramSchema = new Schema({
  requiredEmployeeOfPublicSector: Boolean,
  mustHoldInternationalUniversityAcceptance: Boolean,
  minCGPA: Number,
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

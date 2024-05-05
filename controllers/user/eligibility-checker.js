const { User, PostGraduateStudent } = require("../../models/user");
const {
  Program,
  UniversityStudentProgram,
  CollegeStudentProgram,
  PostGraduateStudentProgram,
} = require("../../models/program");
exports.checkEligibility = async (req, res, next) => {
  try {

    const category = req.body.category;



    const userExists = await User.findById(req.userId);
    if (!userExists) {
        return res.status(400).json({message : "No such user exists."});
    }



    let allPrograms, partialyMatchingPrograms, matchedPrograms, query;
    switch (userExists.role) {
      case "CollegeStudent":
        allPrograms = await CollegeStudentProgram.find({});
        partialyMatchingPrograms = await CollegeStudentProgram.find({
          category: category,
          $or: [
            { targetedRegions: userExists.province },
            { targetedRegions: "Pakistan" },
          ],
          maxAge: { $lte: userExists.age },
        });
        matchedPrograms = await CollegeStudentProgram.find({
          category: programType,
          $or: [
            { targetedRegions: userExists.province },
            { targetedRegions: "Pakistan" },
          ],
          $and: [
            {
              $or: [
                { maxAge: { $exists: false } },
                { maxAge: { $gte: userExists.age } },
              ],
            },
            {
              $or: [
                { minSSCPrcntg: { $exists: false } },
                { minSSCPrcntg: { $lte: userExists.SSC_prcntg } },
              ],
            },
            {
              $or: [
                { maxIncomeLimit: { $exists: false } },
                { maxIncomeLimit: { $gte: userExists.monthlyIncome } },
              ],
            },
          ],
        });
        break;

      case "UniversityStudent":
        if (userExists.cgpa === 0) {
          allPrograms = await UniversityStudentProgram.find({
            minCGPA: { $exists: false },
          }).select("_id title description date lastDateToApply noOfReviews");

          query = {
            minCGPA: { $exists: false },
            $or: [
              { maxAge: { $exists: false } },
              { maxAge: { $gte: userExists.age } },
            ],
            $and: [
              {
                $or: [
                  { minSSCPrcntg: { $exists: false } },
                  { minSSCPrcntg: { $lte: userExists.SSC_prcntg } },
                ],
              },
              {
                $or: [
                  { minSHCPrcntg: { $exists: false } },
                  { minSHCPrcntg: { $lte: userExists.HSC_prcntg } },
                ],
              },
              {
                $or: [
                  { requiresFirstDivison: { $exists: false } },
                  { requiresFirstDivison: { $eq: userExists.hasFirstDivisionThroughtAcademicia } },
                ],
              },
            ],
            category: category,
          };

          partialyMatchingPrograms = await UniversityStudentProgram.find(
            query
          ).select("_id title description date lastDateToApply noOfReviews");
          query.$and = [
            {
              $or: [
                { targetedRegions: userExists.province },
                { targetedRegions: "Pakistan" },
              ],
            },
            {
              $or: [
                { maxIncomeLimit: { $exists: false } },
                { maxIncomeLimit: { $gte: userExists.monthlyIncome } },
              ],
            },
          ];
          matchedPrograms = await UniversityStudentProgram.find(query);
        } else {
          allPrograms = await UniversityStudentProgram.find({
            minCGPA: { $exists: true },
          });
          query = {
            $or: [
              { maxAge: { $exists: false } },
              { maxAge: { $gte: userExists.age } },
            ],
            $and: [
              {
                $or: [
                  { minSSCPrcntg: { $exists: false } },
                  { minSSCPrcntg: { $lte: userExists.SSC_prcntg } },
                ],
              },
              {
                $or: [
                  { minSHCPrcntg: { $exists: false } },
                  { minSHCPrcntg: { $lte: userExists.HSC_prcntg } },
                ],
              },
              {
                $or: [
                  { requiresFirstDivison: { $exists: false } },
                  { requiresFirstDivison: { $eq:  userExists.hasFirstDivisionThroughtAcademicia } },
                ],
              },
            ],
            minCGPA: { $lte: userExists.cgpa  },
            category: category,
          };
          partialyMatchingPrograms = await UniversityStudentProgram.find(query);

          query.$and.push(
            {
              $or: [
                { maxIncomeLimit: { $exists: false } },
                { maxIncomeLimit: { $gte: userExists.monthlyIncome } },
              ],
            },
            {
              $or: [
                {
                  mustHoldInternationalUniversityAcceptance: { $exists: false },
                },
                {
                  mustHoldInternationalUniversityAcceptance: {
                    $eq: req.body.hasAdmissionLetter,
                  },
                },
              ],
            }
          );
          matchedPrograms = await UniversityStudentProgram.find(query);
        }
        break;

      case "PostGraduateStudent":
        query = {
          minCGPA: { $lte: userExists.cgpa  },
          maxAge: { $gte: userExists.age },
          $and: [
            {
              $or: [
                {
                  mustHoldInternationalUniversityAcceptance: { $exists: false },
                },
                {
                  mustHoldInternationalUniversityAcceptance: {
                    $eq: req.body.hasAdmissionLetter,
                  },
                },
              ],
            },
            {
              $or: [
                { requiresFirstDivison: { $exists: false } },
                { requiresFirstDivison: { $eq:  userExists.hasFirstDivisionThroughtAcademicia } },
              ],
            },
            {
              $or: [
                {
                  requiresEmployeeOfPublicSector: { $exists: false },
                },
                {
                  requiresEmployeeOfPublicSector: {
                    $eq: userExists.isEmployeeOfPublicSector,
                  },
                },
              ],
            },
            {
              $or: [
                { targetedRegions: userExists.province },
                { targetedRegions: "Pakistan" },
              ],
            },
          ],
          category: category,
        };

        if (userExists.hasCompletedMS) {
          allPrograms = await PostGraduateStudentProgram.find({
            isPHD_program: true,
          });
          matchedPrograms = await PostGraduateStudentProgram.find(query);
          partialyMatchingPrograms = [];
        } else {
          allPrograms = await PostGraduateStudentProgram.find({
            isPHD_program: false,
          });
          matchedPrograms = await PostGraduateStudentProgram.find(query);
          partialyMatchingPrograms = [];
        }
        break;
    }

    res.status(200).json({
      success: true,
      allPrograms: { count: allPrograms.length, programs: allPrograms },
      partialyMatchingPrograms: {
        count: partialyMatchingPrograms.length,
        programs: partialyMatchingPrograms,
      },
      matchedPrograms: {
        count: matchedPrograms.length,
        programs: matchedPrograms,
      },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    err.success = false;
    next(err);
  }
};

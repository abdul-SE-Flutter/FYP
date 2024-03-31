const { User, PostGraduateStudent } = require("../../models/user");
const {
  Program,
  UniversityStudentProgram,
  CollegeStudentProgram,
  PostGraduateStudentProgram,
} = require("../../models/program");
exports.checkEligibility = async (req, res, next) => {
  try {
    const userRole = req.body.user.role;

    const category = req.body.category;

    const {
      province: userRegion,
      age: userAge,
      monthlyIcome: userIncome,
      SSC_prcntg: userSSC_prcntg,
      SHC_prcntg: userSHC_prcntg,
      cgpa: userCGPA,
      hasFirstDivisionThroughtAcademicia: division,
      semester: currentSemester,
      hasCompletedMS,
      isEmployeeOfPublicSector,
    } = req.body.user;

    let allPrograms, partialyMatchingPrograms, matchedPrograms, query;
    switch (userRole) {
      case "CollegeStudent":
        allPrograms = await CollegeStudentProgram.find({});
        partialyMatchingPrograms = await CollegeStudentProgram.find({
          category: category,
          $or: [
            { targetedRegions: userRegion },
            { targetedRegions: "Pakistan" },
          ],
          maxAge: { $lte: userAge },
        });
        matchedPrograms = await CollegeStudentProgram.find({
          category: programType,
          $or: [
            { targetedRegions: userRegion },
            { targetedRegions: "Pakistan" },
          ],
          $and: [
            {
              $or: [
                { maxAge: { $exists: false } },
                { maxAge: { $gte: userAge } },
              ],
            },
            {
              $or: [
                { minSSCPrcntg: { $exists: false } },
                { minSSCPrcntg: { $lte: userSSC_prcntg } },
              ],
            },
            {
              $or: [
                { maxIncomeLimit: { $exists: false } },
                { maxIncomeLimit: { $gte: userIncome } },
              ],
            },
          ],
        });
        break;

      case "UniversityStudent":
        if (userCGPA === 0) {
          allPrograms = await UniversityStudentProgram.find({
            minCGPA: { $exists: false },
          }).select("_id -__t");

          query = {
            minCGPA: { $exists: false },
            $or: [
              { maxAge: { $exists: false } },
              { maxAge: { $gte: userAge } },
            ],
            $and: [
              {
                $or: [
                  { minSSCPrcntg: { $exists: false } },
                  { minSSCPrcntg: { $lte: userSSC_prcntg } },
                ],
              },
              {
                $or: [
                  { minSHCPrcntg: { $exists: false } },
                  { minSHCPrcntg: { $lte: userSHC_prcntg } },
                ],
              },
              {
                $or: [
                  { requiresFirstDivison: { $exists: false } },
                  { requiresFirstDivison: { $eq: division } },
                ],
              },
            ],
            category: category,
          };

          partialyMatchingPrograms = await UniversityStudentProgram.find(
            query
          ).select("_id -__t targetedRegions");
          query.$and = [
            {
              $or: [
                { targetedRegions: userRegion },
                { targetedRegions: "Pakistan" },
              ],
            },
            {
              $or: [
                { maxIncomeLimit: { $exists: false } },
                { maxIncomeLimit: { $gte: userIncome } },
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
              { maxAge: { $gte: userAge } },
            ],
            $and: [
              {
                $or: [
                  { minSSCPrcntg: { $exists: false } },
                  { minSSCPrcntg: { $lte: userSSC_prcntg } },
                ],
              },
              {
                $or: [
                  { minSHCPrcntg: { $exists: false } },
                  { minSHCPrcntg: { $lte: userSHC_prcntg } },
                ],
              },
              {
                $or: [
                  { requiresFirstDivison: { $exists: false } },
                  { requiresFirstDivison: { $eq: division } },
                ],
              },
            ],
            minCGPA: { $lte: userCGPA },
            category: category,
          };
          partialyMatchingPrograms = await UniversityStudentProgram.find(query);

          query.$and.push(
            {
              $or: [
                { maxIncomeLimit: { $exists: false } },
                { maxIncomeLimit: { $gte: userIncome } },
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
          minCGPA: { $lte: userCGPA },
          maxAge: { $gte: userAge },
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
                { requiresFirstDivison: { $eq: division } },
              ],
            },
            {
              $or: [
                {
                  requiresEmployeeOfPublicSector: { $exists: false },
                },
                {
                  requiresEmployeeOfPublicSector: {
                    $eq: isEmployeeOfPublicSector,
                  },
                },
              ],
            },
            {
              $or: [
                { targetedRegions: userRegion },
                { targetedRegions: "Pakistan" },
              ],
            },
          ],
          category: category,
        };

        if (hasCompletedMS) {
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

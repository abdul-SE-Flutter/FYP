const {User} = require("../../models/user.js");
const review_model = require("../../models/review");
const {Program} = require("../../models/program.js");

const giveReview=async(req ,res)=>{
       const {rating , description , programId} = req.body;
      try {
           const userId = req.userId;

           const user = await User.findById(userId);
           if(!user){
             return res.status(400).json({message : "No such user exists"});
           }

           if(!['CollegeStudent', 'UniversityStudent', 'PostGraduateStudent'].includes(user.role)){
            return res.status(400).json({message : "Only students can add review , not admin or agent(expert)"});
          }

           const program = await Program.findById(programId);
           if(!program){
             return res.status(400).json({message : "No such program exists"});
           }

           const review = new review_model({rating, description , creator : userId, program : programId });
           review.save();
           program.noOfReviews = program.noOfReviews + 1;
           await program.save();
           return res.status(201).json({message : "Review added successfully" , review});


      } catch (error) {
        return res.status(500).json({message: error.message});
      }
};

// const getAllReviews=async(req ,res)=>{
//     try {
//           const reviews = await review_model.find({}).populate({path : "creator" , select : "id username"});
//           return res.status(200).json({reviews});
//     } catch (error) {
//         return res.status(500).json({message: error.message});
//     }
// };

module.exports = {giveReview };
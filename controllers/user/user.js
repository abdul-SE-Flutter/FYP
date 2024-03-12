const { getPrograms, getSingleProgram } = require("../utils/shared");
const id_validator = require("../../controllers/utils/IdValidator");
require("dotenv").config();
const Agent = require("../../models/agent");
const { Stripe } = require("stripe");
exports.getPrograms = getPrograms;

exports.getSingleProgram = getSingleProgram;

exports.hireExpert = async (req, res, next) => {
  try {
    const { email, userId } = req.body;
    const id = id_validator.validateID(userId);
    const agent = await Agent.findOne();

    const stripe = new Stripe(process.env.PRIVATE_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "http://localhost:8080/stripe/test",
      cancel_url: "http://localhost:8080/stripe/test",
      client_reference_id: agent._id.toString(),
      customer_email: "honeyhannan65@gmail.com",
      line_items: [
        {
          price_data: {
            currency: "PKR",
            unit_amount: 1000 * 100,
            product_data: {
              name: "Abdul Hannan",
              description: "Expert on scholarship programs",
            },
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({ session: session.url });

    if (agent.candidates.includes(id)) {
      const err = new Error("Already hired the expert");
      err.statusCode = 409;
      throw err;
    }
    agent.candidates.push(id);
    await agent.save();
    // res.status(200).json(true);
  } catch (err) {
    if (!err.satusCode) err.satusCode = 500;
    next(err);
  }
};

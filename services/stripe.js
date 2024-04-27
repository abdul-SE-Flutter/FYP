const stripe = require("stripe");

require("dotenv").config();

const Stripe = stripe(process.env.STRIPE_SK, {
  apiVersion: "2023-10-16",
});



const createConfirmedPaymentIntent=async(amount , userId , paymentMethodId)=>{
  let paymentIntent; 
  try {
     paymentIntent = await Stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId : userId
      }
    });
  } catch (er) {
    const error = new Error(er);
    error.code =500;
    return {
      error : error
    }
  }

  return {paymentIntent};
};



module.exports = {
  createConfirmedPaymentIntent
};
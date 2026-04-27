const Stripe = require("stripe");

module.exports = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: "https://bubles.com.br/success",
      cancel_url: "https://bubles.com.br/cancel",
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

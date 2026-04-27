import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET);

export default async function handler(req, res) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: "https://seusite.com",
    cancel_url: "https://seusite.com",
  });

  res.json({ url: session.url });
}

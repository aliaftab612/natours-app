const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const stripe = require('stripe')(
  'sk_test_51KfmWSSDvfdEC5RZcDtUg50zsJAwCflwq4vhmhsua72g4JSPOSzYW8a3WEwDqQN2Q28sTO7gcAxwBveIrpENB4mL00JVnUuJWP'
);

const endpointSecret = 'whsec_JGKHuLLE9VOeRwoSXXG8biZsszY57cAk';

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.id}`,
    customer_email: req.user.email,
    client_reference_id: tour.id,
  });

  res.redirect(303, session.url);
});

const createBooking = async (session, res) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  res.status(500).send(`Webhook Error: ${tour},${user},${price}`);
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await createBooking(event.data.object, res);
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err}`);
    }
  }

  res.json({ received: true });
};

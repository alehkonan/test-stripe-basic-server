import 'dotenv/config';
import Stripe from 'stripe';
import express from 'express';
import cors from 'cors';
import { myProducts } from './store/products.js';

const PORT = process.env.PORT || 6001;
const API_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(API_KEY);
const app = express();
app.use(express.json());
app.use(cors());

app.get('/my-products', (req, res) => {
  res.status(200).json(myProducts);
});

app.get('/products', async (req, res) => {
  try {
    const { data: products } = await stripe.products.list({
      active: true,
    });
    const { data: prices } = await stripe.prices.list({
      active: true,
    });
    const result = products.map(({ id, name, description, images }) => ({
      id,
      name,
      description,
      image: images[0],
      price: prices.find((price) => price.product === id)?.unit_amount,
      currency: prices.find((price) => price.product === id)?.currency,
    }));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/checkout', async (req, res) => {
  const { protocol, hostname } = req;
  const { items = [] } = req.body;
  try {
    const line_items = items.map(({ product, unit_amount, currency }) => ({
      price_data: { product, unit_amount, currency },
      quantity: 1,
    }));
    const session = await stripe.checkout.sessions.create({
      line_items,
      success_url: `${protocol}://${hostname}:3000/success`,
      cancel_url: `${protocol}://${hostname}:3000/cancel`,
      mode: 'payment',
    });
    res.status(201).json({ url: session.url });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/payment-intent', async (req, res) => {
  try {
    const { body: paymentIntentParams } = req;
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );
    res.status(200).json(paymentIntent);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));

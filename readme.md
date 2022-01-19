### How stripe works

![stripe process](./assets/stripe-process.png)

Documentation is on [official stripe API docs](https://stripe.com/docs/api)

- create account on [stripe.com](https://stripe.com/)
- add secret key as .env variable on the server
- add post route to handle pay request from client that creates paymentIntents

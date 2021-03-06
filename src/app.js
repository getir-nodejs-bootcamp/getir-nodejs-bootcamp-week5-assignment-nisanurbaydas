const path = require('path');

const config = require('./config');
const loaders = require('./loaders');
const { UserRoutes, ProductRoutes } = require('./routes');
const events = require('./scripts/events');
const errorHandler = require("./middlewares/errorHandler");

const express = require('express');
const fileUpload = require('express-fileupload');

//environment işleri
config();
loaders();
events();

const app = express();
app.use(
  '/product-images',
  express.static(path.join(__dirname, './', 'uploads/products'))
);
app.use(express.json());
app.use(fileUpload());

app.listen(process.env.APP_PORT, () => {
  console.log('Server is up!');
  app.use('/users', UserRoutes);
  app.use('/products', ProductRoutes);

  app.use((req, res, next) => {
    const error = new Error("No such EP");
    error.status = 404;
    next(error);
  });

  app.use(errorHandler);
});

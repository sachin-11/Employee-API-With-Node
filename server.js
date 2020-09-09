const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const errorHandler = require('./middleware/error');

const morgan = require('morgan');
const connectDB = require('./config/db');

//load env vars

dotenv.config({ path: './config/config.env' });

//Connect to database

connectDB();

//mount routes
const auth = require('./routes/auth');
const patient = require('./routes/employee');

const app = express();

app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;


//mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/employee', patient );

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

//Handle unhandle promise rejection

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server
  server.close(() => process.exit(1));
});

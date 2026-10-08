require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log(`=================================================`);
  console.log(` AI Operations Optimization Command Center API`);
  console.log(` Running on port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);

  await connectDB();

  app.listen(PORT, () => {
    // Server running on port
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
});

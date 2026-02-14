const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = path.resolve(process.cwd(), process.env.DB_PATH || './data/app.sqlite');

module.exports = {
  PORT,
  DB_PATH,
};

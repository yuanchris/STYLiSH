// First to do in terminal:
// npm init
// npm install -g nodemon    // to start nodemon: npx nodemon
// npm install express --save
// npm install mysql
// npm install mysqldump
// npm install express-session
// npm install ejs //for render html
// npm install dotenv

// ======= env ========
require('dotenv').config('./');

// =======================

const express = require('express');

const app = express();
const port = process.env.PORT;

app.use(express.static(`${__dirname}/public`));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// =======    home page =====
app.use('/', express.static('public'));


// ============ get product ==================================

const productRoute = require('./routes/productRoute.js');

app.use('/api/1.0/products', productRoute);

// ===================== create product ====================================
const createProductRoute = require('./routes/createProductRoute.js');

app.use('/', createProductRoute);

// ===================== create product ====================================
const userRoute = require('./routes/userRoute.js');

app.use('/user', userRoute);

// =========  order =======================
const orderRoute = require('./routes/orderRoute.js');

app.use('/order', orderRoute);

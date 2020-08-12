require('dotenv').config('../');
const express = require('express');
const { promisify } = require('util');
const router = express.Router();
const secretKey = process.env.SECRET;
const mysql = require('../modules/mysql_con.js');
const db = mysql.db;
const dbquery = promisify(db.query).bind(db);
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // npm i jsonwebtoken
const fetch = require('node-fetch'); // npm install node-fetch --save
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
// =======================

function getDate() {
  const NowDate = new Date();
  const yy = String(NowDate.getFullYear());
  const mm = NowDate.getMonth() + 1 <= 9 ? `0${String(NowDate.getMonth() + 1)}` : String(NowDate.getMonth() + 1);
  const dd = String(NowDate.getDate());
  const name = String(NowDate.getTime());
  const today = name;
  return today;
}


router.post('/checkout', (req, res) => {
  if (req.headers['content-type'] !== 'application/json' || !req.body) {
    return res.status(400).send('please send the correct content type');
  }
  const partnerKey = 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG';
  const merchantId = 'AppWorksSchool_CTBC';
  // try {
  const orderId = getDate();
  const { prime } = req.body;
  const { shipping } = req.body.order;
  const { payment } = req.body.order;
  const { total } = req.body.order; // amount
  const { recipient } = req.body.order;
  const { list } = req.body.order;
  const status = 'unpaid';

  const post = {
    orderId,
    prime,
    shipping,
    payment,
    total,
    recipient: JSON.stringify(recipient),
    list: JSON.stringify(list),
    status,
  };
  db.query('INSERT INTO checkout SET ?', post, (error, results, fields) => {
    if (error) throw error;
  });
  const toPay = {
    prime,
    partner_key: partnerKey,
    merchant_id: merchantId,
    details: 'TapPat Test',
    amount: total,
    cardholder: {
      name: recipient.name,
      phone_number: recipient.phone,
      email: recipient.email,
      address: recipient.address,
    },
    remember: false,
  };

  fetch('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
    method: 'POST',
    body: JSON.stringify(toPay),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': partnerKey,
    },
  }).then((res) => res.json())
    .then((tapReturn) => {
      if (tapReturn.status !== 0) {
        res.status(500).send('payment failed');
      } else {
        db.query('UPDATE checkout SET ? WHERE prime = ?',
          [{ status: 'paid', rec_trade_id: tapReturn.rec_trade_id }, prime], (error, result, fields) => {
            if (error) throw (error);
            res.send({
              data: {
                number: orderId,
              },
            });
          });
      }
    })
    .catch((error) => console.error('Error:', error));


  // } catch (error) {
  //   error.status = 500;
  //   error.error = 'Something wrong in server...';
  //   res.send(error);
  // }
});

router.get('/dashboard', async (req, res) => {
  let data = await dbquery('SELECT total, list FROM checkout');
  for (let i = 0; i < data.length; i++) {
    data[i].list = JSON.parse(data[i].list);
  }
  res.send(data);
});


module.exports = router;

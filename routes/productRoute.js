require('dotenv').config('../');
const express = require('express');

const router = express.Router();

const mysql = require('../modules/mysql_con.js');
const db = mysql.db;

function getJsonData(req, res, category, keyword) { // select 7 itmes and return <= 6 items
  let { paging } = req.query;
  if (typeof (paging) === 'undefined') {
    paging = 0;
  } else {
    paging = parseInt(paging);
  }
  let next_paging;
  let sql;

  if (keyword) {
    sql = `SELECT * FROM product WHERE title LIKE '%${keyword}%' ORDER BY id LIMIT ${paging * 6}, 7 `;
  } else if (category === 'all') {
    sql = `SELECT * FROM product ORDER BY id LIMIT ${paging * 6}, 7 `;
  } else {
    sql = `SELECT * FROM product WHERE category = "${category}" ORDER BY id LIMIT ${paging * 6}, 7 `;
  }


  const post = {};
  const query = db.query(sql, (err, results) => {
    if (err) throw err;
    for (let i = 0; i < results.length; i++) {
      results[i].colors = JSON.parse(results[i].colors);
      results[i].variants = JSON.parse(results[i].variants);
      for (let j = 0; j < results[i].variants.length; j++) // change stock from str to int
      {
        results[i].variants[j].stock = parseInt(results[i].variants[j].stock);
      }
      results[i].sizes = JSON.parse(results[i].sizes);
      results[i].images = JSON.parse(results[i].images);
    }
    if (results.length > 6) {
      next_paging = paging + 1;
      post.next_paging = next_paging;
      post.data = results.slice(0, 6);
      res.send(post);
    } else {
      post.data = results;
      res.send(post);
    }
  });
}

router.get('/all', (req, res) => {
  getJsonData(req, res, 'all');
});
router.get('/men', (req, res) => {
  getJsonData(req, res, 'men');
});
router.get('/women', (req, res) => {
  getJsonData(req, res, 'women');
});
router.get('/accessories', (req, res) => {
  getJsonData(req, res, 'accessories');
});

router.get('/search', (req, res) => {
  const { keyword } = req.query;
  getJsonData(req, res, undefined, keyword);
});

router.get('/details', (req, res) => {
  const { id } = req.query;
  let { paging } = req.query;
  if (typeof (paging) === 'undefined') {
    paging = 0;
  } else {
    paging = parseInt(paging);
  }
  let sql;
  if (id) {
    sql = `SELECT * FROM product WHERE id = ${id}`;
  }
  const post = {};
  const query = db.query(sql, (err, results) => {
    if (err) throw err;
    results[0].colors = JSON.parse(results[0].colors);
    results[0].variants = JSON.parse(results[0].variants);
    for (j = 0; j < results[0].variants.length; j++) // change stock from str to int
    {
      results[0].variants[j].stock = parseInt(results[0].variants[j].stock);
    }
    results[0].sizes = JSON.parse(results[0].sizes);
    results[0].images = JSON.parse(results[0].images);

    post.data = results[0];
    res.send(post);
  });
});

module.exports = router;

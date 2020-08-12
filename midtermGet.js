require('dotenv').config('../');
const express = require('express');
const { promisify } = require('util');

const mysql = require('./modules/mysql_con.js');

const { db } = mysql;
const dbquery = promisify(db.query).bind(db);
const fetch = require('node-fetch'); // npm install node-fetch --save

fetch('http://arthurstylish.com:1234/api/1.0/order/data', {
  method: 'get',
  // headers: {
  //   'Content-Type': 'application/json',
  // },
}).then((res) => res.json())
  .then(async (results) => {
    let data = results;

    if (data.length !== 0) {
      for (let i = 0; i < data.length; i++) {
        data[i].list = JSON.stringify(data[i].list);
        const sql = 'INSERT INTO checkout SET ?';  // set could only increase one rows 
        const insert = dbquery(sql, data[i]);
      }
      


    }
  })
  .catch((error) => console.error('Error:', error));

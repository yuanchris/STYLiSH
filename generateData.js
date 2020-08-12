
require('dotenv').config('/');
const express = require('express');

const { IP } = process.env;
const host = 'database-1.ch9atonstmqx.ap-northeast-1.rds.amazonaws.com';
const user = process.env.MYUSER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;
const {promisify} = require('util');
// =======================


const mysql = require('mysql');

// connect to sql
const db = mysql.createPool({
  connectionLimit: 100,
  host,
  user,
  password,
  database,
});

// ========== create product ===============

// total: random integer (100 ~ 1000)
// user_id: random integer (1 ~ 5)
const dbquery = promisify(db.query).bind(db);
async function main(total) {
  let post = [];
  await dbquery('DELETE FROM test');
  const sql = 'INSERT INTO  test (user_id, total) VALUES ?';
  for (let i = 0; i < total; i++) {
    // Math.floor(Math.random() * 5) + 1; //回傳1~5
    post[i] = [
      Math.floor(Math.random() * 5) + 1,
      Math.floor(Math.random() * 901) + 100,
    ];
  }
  await dbquery(sql, [post]);
  console.log('finished');
}
main(40000);

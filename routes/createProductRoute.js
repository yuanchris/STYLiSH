/* eslint-disable prefer-arrow-callback */
/* eslint-disable default-case */

require('dotenv').config('../');
const express = require('express');
const router = express.Router();
const {promisify} = require('util');

// Get createArray functions
const fn = require('../modules/fn');

const mysql = require('../modules/mysql_con.js');
const db = mysql.db;
const dbquery = promisify(db.query).bind(db);
const multer = require('multer');
// redis
const redis = require('redis'); //npm install redis --save
const redisClient = redis.createClient({host : 'localhost', port : 6379});

redisClient.on('error', function (err) {
  console.log('Error ' + err);
});

redisClient.on('ready',function() {
  console.log('Redis is ready');
});



// upload to s3
const aws = require('aws-sdk'); // npm install aws-sdk
aws.config.update({
  secretAccessKey: process.env.SECRETACCESSKEY,
  accessKeyId: process.env.ACCESSKEYID,
  region: 'ap-northeast-1',
});


const s3 = new aws.S3();
const multerS3 = require('multer-s3');


let upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: process.env.S3_Bucket,
    metadata: (req, file, callBack) => {
      callBack(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null,  `stylish/${req.body.id}/${file.originalname}`); 
    }
  }),
});

const awsPath = `${process.env.AWSPATH}/stylish`;
// for upload files: body parser cannot parse "multipart/form-data" so use "multer"
// const storage = multer.diskStorage({ // notice you are calling the multer.diskStorage() method here, not multer()
//   destination(req, file, cb) {
//     const dir = `./uploads/assets/${req.body.id}`;
//     // Creates /uploads, regardless of whether /uploads exist
//     fs.mkdir(dir, { recursive: true }, (err) => {
//       if (err) {
//         throw err;
//       } else {
//         cb(null, dir);
//       }
//     });
//   },
//   filename(req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// const upload = multer({ storage });
const fileUpload = upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'images' }]);

// ========== create product ===============

router.get('/admin/product.html', (req, res) => {
  res.render('product.html');
});
router.post('/api/1.0/admin/product', fileUpload, (req, res) => {
  db.getConnection(function(error, connection) {
    if (error) throw error; // not connected!
    connection.query('SELECT * FROM product where id = ?', req.body.id, (err, result) => {
      if (err) throw err;
      if (result.length !== 0) {
        res.send('Product already exist.'); // If data exist, not allow to insert
      } else {
        // =====create Array =======
        const colorsArray = fn.createColorsArray(req.body.color_codes, req.body.color_names);
        let sizeArray;
        if (typeof (req.body.sizes) === 'string') {
          sizeArray = fn.createArray(req.body.sizes);
        } else {
          sizeArray = req.body.sizes;
          sizeArray = JSON.stringify([...new Set(sizeArray)]);
        }
        const varArray = fn.createVariantsArray(req.body.color_codes, req.body.sizes, req.body.stock);
        let mainImageUrl;
        if (req.files.main_image !== undefined) {
          mainImageUrl = `${awsPath}/${req.body.id}/${req.files.main_image[0].originalname}`;
        }
        let imageUrl;
        if (req.files.images !== undefined) {
          imageUrl = fn.createImageUrl(awsPath, req.body.id, req.files.images);
          // console.log(req.files.images);
        }
        const sql = 'INSERT INTO product SET ?';
        const post = {
          id: req.body.id,
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          texture: req.body.texture,
          wash: req.body.wash,
          place: req.body.place,
          note: req.body.note,
          story: req.body.story,
          colors: colorsArray,
          sizes: sizeArray,
          variants: varArray,
          main_image: mainImageUrl,
          images: imageUrl,
          category: req.body.category,
        };
        connection.query(sql, post, (err, result) => {
          if (err) throw err;
          res.render('product.html', { data: post });
        });
      }
    });
    // When done with the connection, release it.
    connection.release();

    // Handle error after the release.
    if (error) throw error;
  });
});


// ========== create  Campaign ===========================
router.get('/admin/campaign.html', (req, res) => {
  db.getConnection(function (error, connection) {
    const sql = 'SELECT id FROM product';
    connection.query(sql, (err, results) => {
      if (err) throw err;
      res.render('campaign.html', { data: results });
    });
    // When done with the connection, release it.
    connection.release();

    // Handle error after the release.
    if (error) throw error;
  });
});

router.post('/api/1.0/marketing/campaigns', upload.single('picture'), (req, res) => {
  db.getConnection(function (error, connection) {
    connection.query('SELECT * FROM campaign where product_id = ?', req.body.id, (err, result) => {
      if (err) throw err;
      if (result.length !== 0) {
        res.send('Product already exist.'); // If data exist, not allow to insert
      } else {
        // =====create Campaign obj =======
        // let campaignArray = [];
        const campaignObj = {};
        campaignObj.product_id = req.body.id;
        if (req.file !== undefined) {
          campaignObj.picture = `${awsPath}/${req.body.id}/${req.file.originalname}`;
        }
        campaignObj.story = req.body.story;
        const sql = 'INSERT INTO campaign SET ?';
        db.query(sql, campaignObj, (err, result) => {
          if (err) throw err;
          res.send(`add product_id = ${campaignObj.product_id} to campaign successfully`);
          if (redisClient.ready) {
            redisClient.del('cacheCampaigns');
          }
        });


      }
    });
    // When done with the connection, release it.
    connection.release();

    // Handle error after the release.
    if (error) throw error;
  });


});



const redisGet = promisify(redisClient.get).bind(redisClient);
// ==================  marketing ===============
router.get('/api/1.0/marketing/campaigns', async (req, res) => {
  //test delete
  // if (redisClient.ready) {
  //   redisClient.del('cacheCampaigns');
  //   console.log('delete redis succedd')
  // }
  //
  let cacheCampaigns;
  try {
    if (redisClient.ready) {
      cacheCampaigns = await redisGet('cacheCampaigns');
    }

  } catch (e) {
    console.error(`Get campaign cache error: ${e}`);
  }

  if (cacheCampaigns) {
    console.log('Get campaign from cache');
    res.status(200).json({data: JSON.parse(cacheCampaigns)});
    return;
  }

  let sql = 'SELECT * FROM campaign';
  
  let campaigns = {};
  campaigns = await dbquery(sql);
  try {
    if (redisClient.ready) {
      redisClient.set('cacheCampaigns', JSON.stringify(campaigns));
    }
  } catch (e) {
    console.error(`Set campaign cache error: ${e}`);
  }

  res.status(200).json({ data: campaigns });


});

// ================ loading test =========
router.get('/api/1.0/order/payments', async (req, res) => {
  const sql = 'SELECT user_id, total FROM test';
  // reduce method
  const data = await dbquery(sql);
  // Function to calculate sum of id
  const sumOfId = (id) => data.filter((dat) => dat.user_id === id).reduce((a, b) => a + b.total, 0);
  // create array of order according to user_id 1-5
  let result = {};
  result.data = [];
  for (let i = 1; i <= 5; i++) {
    result.data.push({ user_id: i, total_payment: sumOfId(i) });
  }
  res.send(result);
});


module.exports = router;
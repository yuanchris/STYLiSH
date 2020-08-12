require('dotenv').config('../');

const { IP } = process.env;

// Create Array for String
function createArray(...params) {
  return JSON.stringify(params);
}

function createColorsArray(code, name) {
  const colorsArray = [];
  if (typeof (code) === 'string') {
    const colorsObj = {};
    colorsObj.code = code;
    colorsObj.name = name;
    colorsArray.push(colorsObj);
  } else {
    for (let i = 0; i < code.length; i += 1) {
      const colorsObj = {};
      colorsObj.code = code[i];
      colorsObj.name = name[i];
      colorsArray.push(colorsObj);
    }
  }
  const set = new Set();
  const result = colorsArray.filter((item) => (!set.has(item.code) ? set.add(item.code) : false));
  return JSON.stringify(result);
}

function createVariantsArray(code, size, stock) {
  const varArray = [];
  if (typeof (code) === 'string') {
    const varObj = {};
    varObj.color_code = code;
    varObj.size = size;
    varObj.stock = stock;
    varArray.push(varObj);
  } else {
    for (let i = 0; i < code.length; i += 1) {
      const varObj = {};
      varObj.color_code = code[i];
      varObj.size = size[i];
      varObj.stock = stock[i];
      varArray.push(varObj);
    }
  }

  return JSON.stringify(varArray);
}

function createImageUrl(awsPath, id, images) {
  const imageArr = [];
  let imageUrl;
  for (let i = 0; i < images.length; i += 1) {
    imageUrl = `${awsPath}/${id}/${images[i].originalname}`;
    imageArr.push(imageUrl);
  }
  return JSON.stringify(imageArr);
}


module.exports = {
  createArray, createColorsArray, createVariantsArray, createImageUrl,
};

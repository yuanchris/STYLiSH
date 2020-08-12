// create campaign
fetch('/api/1.0/marketing/campaigns', {
  method: 'GET',
}).then((res) => (res.json())).then((value) => {
  const keyvisual = document.querySelector('.keyvisual');
  const step = document.querySelector('.step');
  for (let i = 0; i < value.data.length; i++) {
    const a1 = document.createElement('a');
    a1.setAttribute('class', 'visual');
    a1.setAttribute('href', './');
    a1.setAttribute('style', `background-image: url(${value.data[i].picture}`);
    const story = document.createElement('div');
    story.setAttribute('class', 'story');
    story.innerHTML = value.data[i].story.replace(/\r\n/g, '<br/>');
    a1.appendChild(story);
    keyvisual.insertBefore(a1, step);

    const a2 = document.createElement('a');
    a2.setAttribute('class', 'circle');
    // a2.setAttribute('onclick', 'click()');
    a2.addEventListener('click', () => {
      circleClick();
    });
    step.appendChild(a2);
  }
  const visualArr = document.body.querySelectorAll('.visual');
  const circleArr = document.body.querySelectorAll('.circle');
  const index = { num: 0 };
  // console.log(visualArr);
  // init
  visualArr[0].setAttribute('class', 'visual current');
  circleArr[0].setAttribute('class', 'circle current');
  let show = setInterval(() => {
    next(index, visualArr, circleArr);
  }, 5000);

  function circleClick() {
    const circleArr2 = [...circleArr]; // because circleArr is a nodelist, cannot use indexof
    const target = event.currentTarget;
    const target_index = circleArr2.indexOf(target);
    for (let i = 0; i < circleArr.length; i++) {
      if (i == target_index) {
        circleArr[i].setAttribute('class', 'circle current');
        visualArr[i].setAttribute('class', 'visual current');
      } else {
        circleArr[i].setAttribute('class', 'circle');
        visualArr[i].setAttribute('class', 'visual');
      }
    }
    index.num = target_index;
    clearInterval(show);
    show = setInterval(() => {
      next(index, visualArr, circleArr);
    }, 5000);
  }
});

function next(obj, visualArr, circleArr) {
  (obj.num == visualArr.length - 1) ? obj.num = 0 : obj.num += 1;
  change(visualArr, 'visual current', 'visual', obj.num);
  change(circleArr, 'circle current', 'circle', obj.num);
}

function change(arr, clsCur, cls, num) {
  for (let i = 0; i < arr.length; i++) {
    if (i == num) {
      arr[i].setAttribute('class', clsCur);
    } else {
      arr[i].setAttribute('class', cls);
    }
  }
}


// create products
fetch('/api/1.0/products/all', {
  method: 'GET',
}).then((res) => (res.json())).then((res) => {
  const products = document.querySelector('.products');

  for (let i = 0; i < res.data.length; i++) {
    const product = document.createElement('a');
    product.setAttribute('class', 'product');
    product.setAttribute('href', `product.html?id=${res.data[i].id}`);
    // img
    const img = document.createElement('img');
    img.setAttribute('src', res.data[i].main_image);
    product.appendChild(img);
    // colors Div
    const colorsDiv = document.createElement('div');
    colorsDiv.setAttribute('class', 'colors');
    for (let j = 0; j < res.data[i].colors.length; j++) {
      const colorDiv = document.createElement('div');
      colorDiv.setAttribute('class', 'color');
      colorDiv.setAttribute('style', `background-color: #${res.data[i].colors[j].code}`);
      colorsDiv.appendChild(colorDiv);
    }
    product.appendChild(colorsDiv);
    // title
    const name = document.createElement('div');
    name.setAttribute('class', 'name');
    name.innerHTML = res.data[i].title;
    product.appendChild(name);
    // price
    const price = document.createElement('div');
    price.setAttribute('class', 'price');
    price.innerHTML = `TWD: ${res.data[i].price}`;
    product.appendChild(price);

    products.appendChild(product);
  }
});

function sign() {
  let token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'profile.html';
  } else {
    window.location.href = 'sign.html';
  }
}


function showCart() {
  const qty = document.querySelector('.qty');
  const cart = JSON.parse(localStorage.getItem('cart'));
  if (!cart || cart.length == 0) {
    qty.innerHTML = 0;
  } else {
    qty.innerHTML = cart.length;
  }
}
showCart();
const id = window.location.search; // return url after and include "?"
if (!id) {
  window.location = '/';
} else {
  show_product();
}
// select html


let product = {};
// import data to product
function show_product() {
  fetch(`/api/1.0/products/details${id}`, {
    method: 'GET',
  }).then((res) => (res.json()))
    .then((res) => {
      showCart();
      const product_img = document.querySelector('.main-image');
      const name = document.querySelector('.name');
      const product_id = document.querySelector('.id');
      const price = document.querySelector('.price');
      const colors = document.querySelector('.colors');
      const sizes = document.querySelector('.sizes');
      const value = document.querySelector('.value');
      const summary = document.querySelector('.summary');
      const story = document.querySelector('.story');
      const images = document.querySelector('.images');
      product = res.data;

      const main_img = document.createElement('img');
      main_img.setAttribute('src', product.main_image);
      product_img.appendChild(main_img);

      name.innerHTML = product.title;
      product_id.innerHTML = product.id;
      price.innerHTML = `TWD: ${product.price}`;

      // color
      for (let i = 0; i < res.data.colors.length; i++) {
        const color = document.createElement('a');
        if (i === 0) {
          color.setAttribute('class', 'color current');
          color.setAttribute('colorname', product.colors[i].name);
        } else { color.setAttribute('class', 'color'); }
        color.setAttribute('style', `background-color: #${product.colors[i].code}`);
        color.setAttribute('colorname', product.colors[i].name);
        color.addEventListener('click', () => {
          colorClick();
        });
        colors.appendChild(color);
      }
      // size
      for (let i = 0; i < product.sizes.length; i++) {
        const size = document.createElement('a');
        if (i === 0) {
          size.setAttribute('class', 'size current');
        } else { size.setAttribute('class', 'size'); }
        size.innerHTML = res.data.sizes[i];
        size.addEventListener('click', () => {
          sizeClick();
        });
        sizes.appendChild(size);
      }
      sizeCheck(product.variants);
      value.innerHTML = 1;
      // other information
      summary.innerHTML = `${product.note}<br> <br>${product.texture}<br>${
        product.description.split(' ')[0]}<br>${product.description.split(' ')[1]}<br> <br>`
      + `清洗：${product.wash}<br>` + `產地：${product.place}`;

      story.innerHTML = product.story;
      for (let i = 0; i < product.images.length; i += 1) {
        const image = document.createElement('img');
        image.setAttribute('src', product.images[i]);
        images.appendChild(image);
      }
    });
}

function colorClick() {
  const value = document.querySelector('.value');
  const old_color = document.querySelector('.color.current');
  if (old_color) { old_color.classList.remove('current'); }
  const target = event.currentTarget;
  target.classList.add('current');
  sizeCheck(product.variants);
  value.innerHTML = 1;
}
function sizeClick() {
  const value = document.querySelector('.value');
  const target = event.currentTarget;
  if (target.getAttribute('class') !== 'size disabled') {
    const old_size = document.querySelector('.size.current');
    if (old_size) { old_size.classList.remove('current'); }
    target.classList.add('current');
    value.innerHTML = 1;
  }
}
function sizeCheck(variants) {
  const now_color = document.querySelector('.color.current').getAttribute('style').split('#')[1];
  const sizeAll = document.querySelectorAll('.size');
  let disabledSize;
  for (let i = 0; i < sizeAll.length; i++) {
    if (!getStock(variants, now_color, sizeAll[i].innerHTML)
      || getStock(variants, now_color, sizeAll[i].innerHTML).stock == 0) {
      sizeAll[i].setAttribute('class', 'size disabled');
    } else {
      sizeAll[i].classList.remove('disabled');
    }
  }
}

function getStock(variants, color_code, size) {
  for (let i = 0; i < variants.length; i++) {
    if (variants[i].color_code == color_code && variants[i].size == size) {
      return variants[i];
    }
  }
}

function up() {
  const value = document.querySelector('.value');
  const color_current = document.querySelector('.color.current').getAttribute('style').split('#')[1];
  const size = document.querySelector('.size.current').innerHTML;
  const { variants } = product;
  const max = parseInt(getStock(variants, color_current, size).stock);
  let value1 = parseInt(value.innerHTML);
  if (value1 < max) {
    value1 += 1;
    value.innerHTML = value1;
  }
}

function down() {
  const value = document.querySelector('.value');
  if (value.innerHTML > 1) {
    value.innerHTML -= 1;
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

function sign() {
  let token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'profile.html';
  } else {
    window.location.href = 'sign.html';
  }
}

function addCart() {
  let cart = JSON.parse(localStorage.getItem('cart'));
  if (!cart) { cart = []; }
  const product_img = document.querySelector('.main-image img').getAttribute('src');
  const name = document.querySelector('.name').innerHTML;
  const product_id = document.querySelector('.id').innerHTML;
  const price = parseInt(document.querySelector('.price').innerHTML.split(' ')[1]);
  const color = document.querySelector('.color.current').getAttribute('colorname');
  const color_code = document.querySelector('.color.current').getAttribute('style').split('#')[1];
  const size = document.querySelector('.size.current').innerHTML;
  const qty = parseInt(document.querySelector('.value').innerHTML); // qty
  const stock = getStock(product.variants, color_code, size).stock;
  const duplicate = cart.find((item) => {
    if (item.id == product_id && item.color == color && item.size == size) {
      return item;
    } return false;
  });
  if (duplicate) {
    duplicate.qty += qty;
    if (duplicate.qty > stock) { duplicate.qty = stock; }
  } else {
    cart.push({
      product_img, name, 'id': product_id, price, color, size, qty, stock,
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('已加入購物車');
  showCart();
}

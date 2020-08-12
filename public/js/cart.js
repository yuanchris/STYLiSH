let cart = JSON.parse(localStorage.getItem('cart'));
const list = document.querySelector('.list');
showCart();

if (cart) {
  for (let i = 0; i < cart.length; i++) {
    const row = document.createElement('div');
    row.setAttribute('class', 'row');
    row.setAttribute('product_id', cart[i].id);
    row.setAttribute('color', cart[i].color);
    row.setAttribute('size', cart[i].size);
    const variant = document.createElement('div');
    variant.setAttribute('class', 'variant');

    const picture = document.createElement('div');
    picture.setAttribute('class', 'picture');
    const img = document.createElement('img');
    img.setAttribute('src', cart[i].product_img);
    picture.appendChild(img);
    variant.appendChild(picture);

    const details = document.createElement('div');
    details.setAttribute('class', 'details');
    details.innerHTML = `${cart[i].name}<br>${cart[i].id}<br> <br>顏色：${cart[i].color}
    <br>尺寸：${cart[i].size}`;
    variant.appendChild(details);
    row.appendChild(variant);

    const qty = document.createElement('div');
    qty.setAttribute('class', 'qty');
    const select = document.createElement('select');
    select.setAttribute('onchange', 'changeQty()');
    for (let j = 1; j <= cart[i].stock; j++) {
      const opQty = document.createElement('option');
      opQty.setAttribute('value', j);
      opQty.innerHTML = j;
      select.appendChild(opQty);
    }
    select.selectedIndex = cart[i].qty - 1;
    qty.appendChild(select);
    row.appendChild(qty);

    const price = document.createElement('div');
    price.setAttribute('class', 'price');
    price.innerHTML = `NT. ${cart[i].price}`;
    row.appendChild(price);

    const subtotal = document.createElement('div');
    subtotal.setAttribute('class', 'subtotal');
    subtotal.innerHTML = `NT. ${cart[i].price * cart[i].qty}`;
    row.appendChild(subtotal);
    list.appendChild(row);

    const remove = document.createElement('div');
    remove.setAttribute('class', 'remove');
    remove.addEventListener('click', () => {
      removeClick();
    });
    remove_img = document.createElement('img');
    remove_img.setAttribute('src', 'imgs/cart-remove.png');
    remove.appendChild(remove_img);
    row.appendChild(remove);
  }
  updateTotal();
  checkoutButton();
}

function changeQty() {
  let selector = event.currentTarget;
  let qty = selector.options[selector.selectedIndex].value;
  let price = selector.parentElement.parentElement.querySelector('.price').innerHTML.substr(4);
  selector.parentElement.parentElement.querySelector('.subtotal').innerHTML = `NT. ${price * qty}`;

  const row = selector.parentElement.parentElement;
  const itemChange = cart.find((item) => {
    if (item.id == row.getAttribute('product_id')
      && item.color == row.getAttribute('color') && item.size == row.getAttribute('size')) {
      return item;
    } return false;
  });
  itemChange.qty = parseInt(qty);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateTotal();
}

function removeClick() {
  const row = event.currentTarget.parentElement;
  const itemRemove = cart.findIndex((item) => {
    if (item.id == row.getAttribute('product_id')
      && item.color == row.getAttribute('color') && item.size == row.getAttribute('size')) {
      return item;
    } return false;
  });
  cart.splice(itemRemove, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  row.remove();
  updateTotal();
  showCart();
  checkoutButton();
}

function updateTotal() {
  const row_subtotals = document.querySelectorAll('.subtotal');
  let sum = 0;
  for (let i = 1; i < row_subtotals.length; i++) {
    sum += parseInt(row_subtotals[i].innerHTML.substr(4));
  }
  const subtotal = document.querySelector('#subtotal');
  subtotal.innerHTML = sum;
  const freight = document.querySelector('#freight');
  let freight_value = 60;
  if (sum == 0) { freight_value = 0; }
  freight.innerHTML = freight_value;
  const total = document.querySelector('#total');
  total.innerHTML = sum + freight_value;
}


function showCart() {
  const qty = document.querySelector('#cart-qty');
  const cart = JSON.parse(localStorage.getItem('cart'));
  if (!cart || cart.length == 0) {
    qty.innerHTML = 0;
  } else {
    qty.innerHTML = cart.length;
  }
}


function checkoutButton() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const checkout_btn = document.querySelector('#checkout');
  if (!cart || cart.length == 0) {
    checkout_btn.setAttribute('disabled', '');
    checkout_btn.removeAttribute('onclick');
    checkout_btn.addEventListener('click', () => {
      alert('請選購商品');
    });
  } else {
    checkout_btn.removeAttribute('disabled');
    checkout_btn.removeAttribute('onclick');
    checkout_btn.setAttribute('onclick', 'payment()');
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

function payment() {
  let order = {};
  order.recipient = {};
  order.recipient.name = document.querySelector('#recipient-name').value.trim();
  if (!order.recipient.name) { alert('請輸入收件人姓名'); return; }
  order.recipient.email = document.querySelector('#recipient-email').value.trim();
  if (!order.recipient.name) { alert('請輸入Email'); return; }
  order.recipient.phone = document.querySelector('#recipient-phone').value.trim();
  if (!order.recipient.name) { alert('請輸入手機號碼'); return; }
  order.recipient.address = document.querySelector('#recipient-address').value.trim();
  if (!order.recipient.name) { alert('請輸入收件地址'); return; }
  let times = document.querySelectorAll('[name="recipient-time"]');
  for (let i = 0; i < times.length; i++) {
    if (times[i].checked) {
      order.recipient.time = times[i].value;
      break;
    }
  }
  order.list = cart;
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
  if (tappayStatus.canGetPrime === false) {
    alert('can not get prime')
    return
  }
  // Get prime
  TPDirect.card.getPrime(function (result) {
    if (result.status !== 0) {
        alert('get prime error ' + result.msg)
        return
    }
    alert('get prime 成功，prime: ' + result.card.prime)
    let prime = result.card.prime;
    order.shipping = 'delivery';
    order.payment = 'credit_card';
    order.subtotal = parseInt(document.getElementById('subtotal').innerHTML);
    order.freight = parseInt(document.getElementById('freight').innerHTML);
    order.total = parseInt(document.getElementById('total').innerHTML);
    fetch('order/checkout',{
      method: 'POST',
      body: JSON.stringify({
        prime, order}),
      headers:{
        'Content-Type': 'application/json',
        'authorization': 'Bearer x48aDD534da8ADSD1XC4SD5S'
      } 
    }).then(res => res.json())
        .then(resJson => {  
          if (resJson.error) {
          alert(`Transaction Failed: ${JSON.stringify(resJson.error)}`);
        } else {
          localStorage.removeItem('cart');
          window.location.href = `./thankyou.html?number=${resJson.data.number}`;
        }})
    // .catch(error => console.log(error))
    });
}


// TAPPAY
TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');
TPDirect.card.setup({
  fields: {
    number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****'
    },
    expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY'
    },
    ccv: {
      element: '#card-ccv',
      placeholder: '後三碼'
    },
  },
})

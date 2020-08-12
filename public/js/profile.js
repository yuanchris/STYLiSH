if (!localStorage.getItem('token')) {
  alert('please sign up or sign in!');
  window.location.href = './sign.html';
} else {
  const bearer = `Bearer ${localStorage.getItem('token')}`;
  console.log(bearer);
  fetch('user/profile', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: bearer,
    },
    method: 'GET',
  }).then((res) => res.json())
    .then(result => {
      console.log(result);
      if (result.status === 403) {
        alert('Invalid acess, please sign up or sign in!');
        localStorage.removeItem('token');
        //window.location.href = './sign.html';
      } else {
        const hello = document.createElement('h1');
        hello.innerHTML = `Hello, ${result.data.name}`;
        const name = document.querySelector('.name');
        name.appendChild(hello);
        const userEmail = document.createElement('h1');
        userEmail.innerHTML = `Your Email: ${result.data.email}`;
        const email = document.querySelector('.email');
        email.appendChild(userEmail);
      }
    });
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
showCart();



function logOut() {
  localStorage.removeItem('token');
  window.location.href = './';
}
function sign() {
  let token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'profile.html';
  } else {
    window.location.href = 'sign.html';
  }
}
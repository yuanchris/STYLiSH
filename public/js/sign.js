// fb
window.fbAsyncInit = function () {
  FB.init({
    appId: '3331717820217584',
    cookie: true,
    xfbml: true,
    version: 'v7.0',
  });
  FB.AppEvents.logPageView();
};

(function (d, s, id) {
  let js; const
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function checkLoginState() {
  FB.getLoginStatus((response) => {
    statusChangeCallback(response);
  });
}
// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    fbSignIn(response.authResponse.accessToken);
    testAPI();
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log '
          + 'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log '
          + 'into Facebook.';
  }
}
// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', 'GET', { fields: 'email,name,picture' }, (response) => {
    console.log(response);
    console.log(`Successful login for: ${response.name}`);
    document.getElementById('status').innerHTML = `Thanks for logging in, ${response.name}!`;
  });
}
function fbSignIn(accessToken) {
  const data = {};
  data.provider = 'facebook';
  data.access_token = accessToken;
  fetch('/user/signin', {
    method: 'POST',
    body: JSON.stringify(data), // data can be `string` or {object}
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => (res.json())).then((value) => {
    console.log(value);
    if (value.status !== 403) {
      const token = value.data.access_token;
      localStorage.setItem('token', token);
      // document.getElementById('ajaxIn').innerHTML = JSON.stringify(value);
      window.location.href = './profile.html';
    } else {
      document.getElementById('ajaxIn').innerHTML = JSON.stringify(value);
    }
  }).catch((error) => {
    // console.error('Error:', error);
    document.getElementById('ajaxIn').innerHTML = error;
  });
}


//  native
function signUp() {
  const data = {};
  data.provider = 'native';
  data.name = document.querySelector('[name="nameUp"]').value;
  data.email = document.querySelector('[name="emailUp"]').value;
  data.password = document.querySelector('[name="passwordUp"]').value;
  data.picture = '111';
  fetch('/user/signup', {
    method: 'POST',
    body: JSON.stringify(data), // data can be `string` or {object}
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => (res.json())).then((value) => {
    if (value.status !== 403) {
      const token = value.data.access_token;
      localStorage.setItem('token', token);
      // document.getElementById('ajaxUp').innerHTML = JSON.stringify(value);
      window.location.href = './profile.html';
    } else {
      document.getElementById('ajaxUp').innerHTML = JSON.stringify(value);
    }
  }).catch((error) => {
    // console.error('Error:', error);
    // document.getElementById('ajaxUp').innerHTML = error;
  });
}

function signIn() {
  const data = {};

  data.provider = 'native';

  // data.name = document.querySelector('[name="nameIn"]').value;
  data.email = document.querySelector('[name="emailIn"]').value;
  data.password = document.querySelector('[name="passwordIn"]').value;
  fetch('/user/signin', {
    method: 'POST',
    body: JSON.stringify(data), // data can be `string` or {object}
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => (res.json())).then((value) => {
    if (value.status !== 403) {
      const token = value.data.access_token;
      localStorage.setItem('token', token);
      // document.getElementById('ajaxIn').innerHTML = JSON.stringify(value);
      window.location.href = './profile.html';
    } else {
      document.getElementById('ajaxIn').innerHTML = JSON.stringify(value);
    }
  }).catch((error) => {
    // console.error('Error:', error);
    document.getElementById('ajaxIn').innerHTML = error;
  });
}

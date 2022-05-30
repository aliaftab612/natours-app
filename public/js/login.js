const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'https://natours-app123.herokuapp.com/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Successfully LogedIn!!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const SaveAccountDetails = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'https://natours-app123.herokuapp.com/api/v1/users/updateMe',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Successfully Saved!!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const UpdatePassword = async (currentPass, newPass, confirmNewPass) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'https://natours-app123.herokuapp.com/api/v1/users/updatePassword',
      data: {
        password: currentPass,
        newPassword: newPass,
        confirmPassword: confirmNewPass,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password Successfully Updated!!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'https://natours-app123.herokuapp.com/api/v1/users/logout',
      });

      if (res.data.status === 'success') {
        location.assign('/login');
      }
    } catch (err) {
      alert(err.response.data.message);
    }
  });
}

const saveAccountDetailsBtn = document.querySelector('.form-user-data');
const changePasswordBtn = document.querySelector('.form-user-settings');
const tourBookBtn = document.getElementById('book-tour');

if (saveAccountDetailsBtn) {
  saveAccountDetailsBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('image', document.getElementById('userImage').files[0]);

    SaveAccountDetails(form);
  });

  changePasswordBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPass = document.getElementById('password-current').value;
    const newPass = document.getElementById('password').value;
    const confirmNewPass = document.getElementById('password-confirm').value;
    await UpdatePassword(currentPass, newPass, confirmNewPass);

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
} else {
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const showAlert = function (type, msg) {
  hideAlert();
  const alertHtml = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', alertHtml);
  window.setTimeout(() => {
    hideAlert();
  }, 1500);
};

const hideAlert = function () {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

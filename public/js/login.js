const alert = document.querySelector('body').dataset.alert;

const showAlert = function (type, msg, time = 3) {
  hideAlert();
  const alertHtml = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', alertHtml);
  window.setTimeout(() => {
    hideAlert();
  }, time * 1000);
};

const hideAlert = function () {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

if (alert) showAlert('success', alert, 15);

const resendVerificationCode = async (email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/resendEmailVerificationCode',
      data: {
        email: email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Verification Email Sent Successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Successfully LogedIn!!');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    if (err.response.data.message === 'SignUp process not completed') {
      window.setTimeout(() => {
        location.assign(`/signup?email=${email}`);
      });
    } else {
      showAlert('error', err.response.data.message);
    }
  }
};

const verifyEmailVerificationCode = async (email, code) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/verifyEmail',
      data: {
        email,
        emailVerificationCode: code,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Successfully Signed Up!!');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const signUp = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });

    if (res.data.status === 'success') {
      const signUpForm = document.getElementById('form-signUp');
      const verifyEmailForm = document.getElementById('form-verifyEmail');
      const verificationEmailField =
        document.getElementById('verificationEmail');

      verificationEmailField.innerText = email;

      signUpForm.style.display = 'none';
      verifyEmailForm.style.display = 'block';
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const SaveAccountDetails = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Successfully Saved!!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const UpdatePassword = async (currentPass, newPass, confirmNewPass) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
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
        url: '/api/v1/users/logout',
      });

      if (res.data.status === 'success') {
        location.assign('/login');
      }
    } catch (err) {
      alert(err.response.data.message);
    }
  });
}

const signUpBtn = document.getElementById('signUpBtn');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

function validatePasswords() {
  if (
    confirmPasswordInput.value.length != 0 &&
    passwordInput.value.length != 0
  ) {
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.setCustomValidity("Passwords Don't Match");
      confirmPasswordInput.reportValidity();
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  } else {
    confirmPasswordInput.setCustomValidity('');
  }
}

if (signUpBtn) {
  passwordInput.onchange = validatePasswords;
  confirmPasswordInput.onkeyup = validatePasswords;

  document.querySelector('.form-signup').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    signUp(name, email, password, confirmPassword);
  });
}

const emailVerifyBtn = document.getElementById('verifyEmailBtn');

if (emailVerifyBtn) {
  document
    .querySelector('.form-verifyemail')
    .addEventListener('submit', (e) => {
      e.preventDefault();

      const verificationEmail =
        document.getElementById('verificationEmail').innerText;
      const verificationCode = Number(
        document.getElementById('verificationCode').value
      );

      verifyEmailVerificationCode(verificationEmail, verificationCode);
    });
}

const resendCodeBtn = document.getElementById('resendCode');

if (resendCodeBtn) {
  resendCodeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const verificationEmail =
      document.getElementById('verificationEmail').innerText;

    resendVerificationCode(verificationEmail);
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
  document.querySelector('.form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

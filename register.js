const API = `${window.API_BASE}/auth/register/`;
const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');

registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  registerError.textContent = '';
  const data = Object.fromEntries(new FormData(registerForm).entries());
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      let msg = 'Помилка реєстрації';
      if (result) {
        if (typeof result === "string") msg = result;
        if (result.message) msg = result.message;
        if (result.detail) msg = result.detail;
        if (result.username) msg = result.username.join(' ');
        if (result.email) msg = result.email.join(' ');
        if (result.password) msg = result.password.join(' ');
        if (result.password_check) msg = result.password_check.join(' ');
      }
      registerError.textContent = msg;
      return;
    }
    sessionStorage.setItem('token', result.tokens.access);
    sessionStorage.setItem('username', result.user.username);
    window.location.href = 'index.html';
  } catch {
    registerError.textContent = 'Сервер недоступний';
  }
});

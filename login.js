const API = `${window.API_BASE}/token/`;
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';
  const data = Object.fromEntries(new FormData(loginForm).entries());
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        password: data.password
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      loginError.textContent = err.detail || 'Помилка логіну';
      return;
    }
    const result = await res.json();
    sessionStorage.setItem('token', result.access);
    sessionStorage.setItem('username', data.username);
    window.location.href = 'index.html';
  } catch {
    loginError.textContent = 'Сервер недоступний';
  }
});

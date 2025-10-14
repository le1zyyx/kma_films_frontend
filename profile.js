window.API_BASE = "http://127.0.0.1:8000";

async function getProfile() {
  const token = sessionStorage.getItem('token');
  const res = await fetch(`${window.API_BASE}/profile/`, {
    credentials: "include",
    headers: { Authorization: "Bearer " + token }
  });
  if (!res.ok) {
    document.body.innerHTML = '<div style="text-align:center;color:#e55;font-size:1.2em;margin-top:50px">Не вдалося завантажити профіль.</div>';
    return;
  }
  const prof = await res.json();
  document.getElementById("profile-username").textContent = prof.username;
  document.getElementById("profile-email").textContent = prof.email;
}

async function getFavorites() {
  const token = sessionStorage.getItem('token');
  const el = document.getElementById("favorites-list");
  el.innerHTML = '<h3>Улюблені фільми:</h3><div class="favorites-cards"></div>';
  const listEl = el.querySelector('.favorites-cards');
  const res = await fetch(`${window.API_BASE}/favorites/`, {
    credentials: "include",
    headers: { Authorization: "Bearer " + token }
  });
  if (!res.ok) {
    el.innerHTML += '<div style="color:#f66">Не вдалося завантажити улюблені.</div>';
    return;
  }
  const favs = await res.json();
  if (!favs.length) {
    listEl.innerHTML = "<div>Немає жодного улюбленого фільму.</div>";
    return;
  }
  for (let i = 0; i < favs.length; i++) {
    const fav = favs[i];
    const resp = await fetch(`${window.API_BASE}/movies/${fav.movie}/`, { credentials: "include" });
    if (!resp.ok) continue;
    const movie = await resp.json();
    listEl.innerHTML += `
      <div class="favorite-card">
        <span class="fav-ico">❤️</span>
        <span class="favorite-title">${movie.title}</span>
        <span class="favorite-meta">${movie.year || ""} ${movie.director || ""}</span>
      </div>
    `;
  }
}

document.getElementById("logout").onclick = function() {
  sessionStorage.clear();
  location.href = "login.html";
};

getProfile();
getFavorites();

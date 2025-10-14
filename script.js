window.API_BASE = "http://127.0.0.1:8000";

function getCookie(name) {
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? m.pop() : "";
}

function getToken() {
  return sessionStorage.getItem("token");
}

function authHeader() {
  const t = getToken();
  return t ? { Authorization: "Bearer " + t } : {};
}

async function ensureCSRF() {
  await fetch(`${window.API_BASE}/csrf/`, { credentials: "include" });
}

let globalMovies = [];

async function fetchMovies() {
  const r = await fetch(`${window.API_BASE}/movies/`, {
    credentials: "include",
    headers: authHeader()
  });
  if (!r.ok) throw new Error();
  return r.json();
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function renderTags(g) {
  if (!g) return "";
  const a = String(g).split(",").map(e => e.trim()).filter(Boolean).slice(0, 4);
  return a.length
    ? `<div class="tags">${a.map(e => `<span class="tag">${escapeHtml(e)}</span>`).join("")}</div>`
    : "";
}

function animateBtn(btn) {
  btn.classList.remove("btn-animate");
  void btn.offsetWidth;
  btn.classList.add("btn-animate");
}

function createCard(m) {
  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <img class="poster" src="images/default-poster.jpg" alt="${escapeHtml(m.title)}"/>
    <div class="info">
      <h4 class="title">${escapeHtml(m.title)}</h4>
      <div class="meta">
        <span>${m.year || "—"}</span>
        <span>${escapeHtml(m.director) || "—"}</span>
        <span>⭐ ${m.rating ?? "—"}</span>
      </div>
      ${renderTags(m.genre)}
      <div class="actions-mini">
        <button type="button" class="btn ghost small like-btn">👍</button>
        <button type="button" class="btn ghost small dislike-btn">👎</button>
        <button type="button" class="btn ghost small fav-btn">❤️</button>
      </div>
      <button class="delete-btn" type="button">Видалити</button>
    </div>`;
  d.querySelector(".like-btn").onclick = e => { vote(m.id, 1); animateBtn(e.target); };
  d.querySelector(".dislike-btn").onclick = e => { vote(m.id, -1); animateBtn(e.target); };
  d.querySelector(".fav-btn").onclick = e => { toggleFavorite(m.id); animateBtn(e.target); };
  d.querySelector(".delete-btn").onclick = () => deleteMovie(m.id);
  d.querySelector(".title").addEventListener("click", () => showDetail(m));
  return d;
}

async function vote(id, val) {
  await ensureCSRF();
  await fetch(`${window.API_BASE}/votes/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...authHeader(), "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify({ movie: id, value: val })
  });
}

async function toggleFavorite(id) {
  await ensureCSRF();
  const r = await fetch(`${window.API_BASE}/favorites/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...authHeader(), "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify({ movie: id })
  });
  if (!r.ok) {
    const e = await r.json().catch(() => null);
    alert((e && (e.detail || e.error)) || "Вже улюблений або помилка.");
  }
}

async function deleteMovie(id) {
  if (!confirm("Видалити фільм?")) return;
  await ensureCSRF();
  const r = await fetch(`${window.API_BASE}/movies/${id}/`, {
    method: "DELETE",
    credentials: "include",
    headers: { ...authHeader(), "X-CSRFToken": getCookie("csrftoken") }
  });
  if (!r.ok) return alert("Не вдалося видалити");
  globalMovies = globalMovies.filter(e => e.id !== id);
  drawMovies(globalMovies);
}

function drawMovies(l) {
  const g = document.getElementById("grid");
  g.innerHTML = "";
  l.forEach(m => g.appendChild(createCard(m)));
}

function filterMovies(q, g) {
  const Q = q.trim().toLowerCase();
  return globalMovies.filter(m => {
    const t = [m.title, m.director].join(" ").toLowerCase();
    return (!Q||t.includes(Q))&&(!g||(m.genre||"").toLowerCase().includes(g.toLowerCase()));
  });
}

function showDetail(m) {
  alert(`${m.title}\n\n${m.description||"Без опису"}`);
}

async function setup() {
  try {
    await ensureCSRF();
    globalMovies = await fetchMovies();
    drawMovies(globalMovies);
    document.getElementById("search").oninput = () =>
      drawMovies(filterMovies(document.getElementById("search").value, document.getElementById("genre").value));
    document.getElementById("genre").onchange = () =>
      drawMovies(filterMovies(document.getElementById("search").value, document.getElementById("genre").value));
    document.getElementById("reload").onclick = async () => {
      globalMovies = await fetchMovies();
      drawMovies(globalMovies);
    };
    document.getElementById("open-add").onclick = () =>
      document.getElementById("modal").classList.remove("hidden");
    document.getElementById("close-modal").onclick = () =>
      document.getElementById("modal").classList.add("hidden");
    document.getElementById("add-form").onsubmit = async e => {
      e.preventDefault();
      await ensureCSRF();
      const d = Object.fromEntries(new FormData(e.target).entries());
      d.year = d.year?+d.year:0;
      d.rating = d.rating?+d.rating:0;
      const r = await fetch(`${window.API_BASE}/movies/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type":"application/json", ...authHeader(), "X-CSRFToken": getCookie("csrftoken") },
        body: JSON.stringify(d)
      });
      if (r.ok) {
        globalMovies.unshift(await r.json());
        document.getElementById("modal").classList.add("hidden");
        e.target.reset();
        drawMovies(globalMovies);
      } else alert("Помилка");
    };
  } catch {
    document.getElementById("grid").innerHTML =
      '<div style="color:#f66;padding:20px">Не вдалося завантажити дані.</div>';
  }
}

setup();

async function showFavorites() {
    const res = await fetch("http://127.0.0.1:8000/favorites/", {
        credentials: "include",
        headers: { "Authorization": "Bearer " + sessionStorage.getItem("token") }
    });
    const data = await res.json();
    const el = document.querySelector(".fav-list");
    el.innerHTML = "";
    data.forEach(fav => {
        el.innerHTML += `<div>id: ${fav.id}, movie: ${fav.movie}</div>`;
    });
}
showFavorites();

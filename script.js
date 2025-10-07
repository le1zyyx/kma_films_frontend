const API = `${window.API_BASE}/movies/`;
const DEFAULT_POSTER = 'images/default-poster.jpg';
let globalMovies = [];

const els = {
  grid: document.getElementById('grid'),
  search: document.getElementById('search'),
  genre: document.getElementById('genre'),
  reload: document.getElementById('reload'),
  openAdd: document.getElementById('open-add'),
  modal: document.getElementById('modal'),
  closeModal: document.getElementById('close-modal'),
  addForm: document.getElementById('add-form'),
};

async function fetchMovies() {
  const res = await fetch(API);
  if (!res.ok) throw new Error('API error');
  return await res.json();
}

function createCard(m) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <img class="poster" src="${DEFAULT_POSTER}" alt="${escapeHtml(m.title)}" />
    <div class="info">
      <h4 class="title">${escapeHtml(m.title)}</h4>
      <div class="meta">
        <span>${m.year || '—'}</span>
        <span>${m.director || '—'}</span>
        <span>⭐ ${m.rating ?? '—'}</span>
      </div>
      ${renderTags(m.genre)}
      <button class="delete-btn" onclick="deleteMovie(${m.id})">Видалити</button>
    </div>
  `;
  return div;
}

function renderTags(genreStr) {
  if (!genreStr) return '';
  const genres = String(genreStr).split(',').map(g => g.trim()).filter(Boolean).slice(0,4);
  if (!genres.length) return '';
  return `<div class="tags">${genres.map(g=>`<span class="tag">${escapeHtml(g)}</span>`).join('')}</div>`;
}

function drawMovies(list) {
  els.grid.innerHTML = '';
  list.forEach(m => els.grid.appendChild(createCard(m)));
}

function filterMovies(list,q,g) {
  const query = q.trim().toLowerCase();
  const genre = g.trim().toLowerCase();
  return list.filter(m=>{
    const inText = [m.title,m.director].map(x=>(x||'').toLowerCase()).join(' ');
    const inGenre = (m.genre||'').toLowerCase();
    const okQ = !query||inText.includes(query);
    const okG = !genre||inGenre.includes(genre);
    return okQ&&okG;
  });
}

async function deleteMovie(id) {
  if(!confirm('Видалити фільм?')) return;
  try {
    const res = await fetch(`${API}${id}/`,{ method:'DELETE' });
    if(!res.ok) {
      const errorData = await res.json();
      alert(`Помилка: ${errorData.error||'Не вдалося видалити фільм'}`);
      return;
    }
    globalMovies = globalMovies.filter(m=>m.id!==id);
    drawMovies(filterMovies(globalMovies, els.search.value, els.genre.value));
  } catch {
    alert('Помилка мережі при видаленні фільму');
  }
}

function setupUI(movies) {
  globalMovies = movies;
  const apply = ()=>{
    drawMovies(filterMovies(globalMovies, els.search.value, els.genre.value));
  };
  els.search.addEventListener('input',apply);
  els.genre.addEventListener('change',apply);
  els.reload.addEventListener('click',async()=>{
    globalMovies = await fetchMovies();
    apply();
  });
  els.openAdd.addEventListener('click',()=>els.modal.classList.remove('hidden'));
  els.closeModal.addEventListener('click',()=>els.modal.classList.add('hidden'));
  els.addForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const form = new FormData(els.addForm);
    const payload = Object.fromEntries(form.entries());
    payload.creator = 1;
    if(payload.year) payload.year = parseInt(payload.year,10);
    if(payload.rating) payload.rating = parseFloat(payload.rating);
    const res = await fetch(API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
    });
    if(!res.ok) {
      alert('Помилка збереження. Перевір поля або CORS.');
      return;
    }
    globalMovies.unshift(await res.json());
    els.modal.classList.add('hidden');
    els.addForm.reset();
    apply();
  });
}

function escapeHtml(s) {
  return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

(async function init(){
  try {
    const movies = await fetchMovies();
    drawMovies(movies);
    setupUI(movies);
  } catch {
    els.grid.innerHTML = `<div style="color:#f66;padding:20px">Не вдалося завантажити дані з API. Перевір адресу API_BASE і CORS.</div>`;
  }
})();

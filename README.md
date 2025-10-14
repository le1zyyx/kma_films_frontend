# KMA FILMS Frontend

Minimalistic frontend for a movie catalog project.  
Demo site for browsing, searching, adding, and deleting movies with Netflix-style UI.

---

## Features

- **Browse and search** movies, filter by genre
- **Add, view, and delete** movies (authorized users)
- **Mark favorites** — see grid in your profile
- **Registration & Login** (JWT, full validation)
- **Logout:** instant token removal, adaptive menu
- **Responsive dark UI** — easy on the eyes, works on all devices
- **Profile with favorites grid** — modern, clean, beautiful!
- **Smart redirects and access control**

---

## How to run

1. **Clone the repo:**
git clone https://github.com/le1zyyx/kma_films_frontend.git
cd kma_films_frontend

text

2. **Start a web server:**
python3 -m http.server 5500

text

3. **Open in your browser:**  
[http://127.0.0.1:5500](http://127.0.0.1:5500)

> **Requires backend API:**  
> Backend should run at [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## Pages Overview

| Page             | Access        | Details                        |
|------------------|--------------|--------------------------------|
| `/` or `/index.html`    | All          | Movie catalog, filter, search  |
| `/login.html`     | Guests only  | Log in with JWT                |
| `/register.html`  | Guests only  | Register (all validations)     |
| `/profile.html`   | Auth only    | Profile + favorites grid       |

---

## Usage Hints

- Unauthorized users are redirected to **login** for protected pages.
- After login/registration, you are taken back to your intended page.
- **Logout** removes tokens, returns to public.
- **Login/logout/menu/your name** appear conditionally at the top.
- If logged in, accessing login/register always redirects back to main/profile.
- The **favorites grid** in your profile shows your favorites, beautifully styled.

---

## Demo Flow

- Register and log in
- Add movies, mark favorites
- Browse catalog, try search/filter
- See your personalized favorites grid in your profile

---
Enjoy!

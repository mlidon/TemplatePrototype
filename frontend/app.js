const API = "http://127.0.0.1:8000";

// -----------------------------
// LOGIN
// -----------------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!data.access_token) {
            showAlert("alertLogin", "Credenciales incorrectas");
            return;
        }
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            window.location.href = "books.html";
        } else {
            alert("Credenciales incorrectas");
        }
    });
}

// -----------------------------
// REGISTRO
// -----------------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (res.ok) {
            alert("Usuario creado");
            window.location.href = "index.html";
        } else {
            alert("Error al registrar");
        }
    });
}

// -----------------------------
// CRUD LIBROS
// -----------------------------
const bookForm = document.getElementById("bookForm");
if (bookForm) {
    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const year = parseInt(document.getElementById("year").value);
        const image_url = document.getElementById("image_url").value;

        await fetch(`${API}/books/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, author, year, image_url })
        });

        loadBooks();
    });

    loadBooks();
}

async function loadBooks() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(`${API}/books/`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        console.error("Error al cargar libros");
        return;
    }

    const books = await res.json();

    const container = document.getElementById("booksList");
    container.innerHTML = "";

    books.forEach(book => {
        container.innerHTML += `
            <div class="col-md-4">
                <div class="card h-200 shadow-sm">
                    <img src="${book.image_url || 'https://via.placeholder.com/150'}"
                        class="card-img-top"
                        style="height: 350px; width: 100%; object-fit: contain; background-color: #fff;"
                        alt="Portada del libro">

                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text flex-grow-1">
                            <strong>Autor:</strong> ${book.author}<br>
                            <strong>Año:</strong> ${book.year}
                        </p>

                        <div class="d-flex gap-2">
                            <button class="btn btn-warning w-50" onclick="editBook(${book.id})">Editar</button>
                            <button class="btn btn-danger w-50" onclick="deleteBook(${book.id})">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    window.currentBooks = books;
}


async function deleteBook(id) {
    const token = localStorage.getItem("token");

    if (!confirm("¿Seguro que quieres eliminar este libro?")) return;

    const res = await fetch(`${API}/books/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (res.ok) {
        loadBooks();
    } else {
        alert("Error al eliminar el libro");
    }
}


async function updateBook() {
    const token = localStorage.getItem("token");

    const id = document.getElementById("edit_id").value;
    const title = document.getElementById("edit_title").value;
    const author = document.getElementById("edit_author").value;
    const year = parseInt(document.getElementById("edit_year").value);
    const image_url = document.getElementById("edit_image_url").value;

    const res = await fetch(`${API}/books/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, author, year, image_url })
    });

    if (res.ok) {
        const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        modal.hide();
        loadBooks();
    } else {
        alert("Error al actualizar el libro");
    }
}

function editBook(id) {
    const book = window.currentBooks.find(b => b.id === id);

    document.getElementById("edit_id").value = book.id;
    document.getElementById("edit_title").value = book.title;
    document.getElementById("edit_author").value = book.author;
    document.getElementById("edit_year").value = book.year;
    document.getElementById("edit_image_url").value = book.image_url;

    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
}


// -----------------------------
// LOGOUT
// -----------------------------
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}



// -----------------------------
// ALERTAS VISUALES
// -----------------------------
function showAlert(containerId, message, type="danger") {
    document.getElementById(containerId).innerHTML = `
        <div class="alert alert-${type}">${message}</div>
    `;
}

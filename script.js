document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'https://movie.azurewebsites.net/api/cartelera';
    const peliculasContainer = document.getElementById('peliculas-container');
    const addModalElement = document.getElementById('addModal');
    const editModalElement = document.getElementById('editModal');
    const addModal = new bootstrap.Modal(addModalElement);
    const editModal = new bootstrap.Modal(editModalElement);

    // Campos del modal de agregar película
    const addForm = document.getElementById('addForm');
    const addImdbID = document.getElementById('addImdbID');
    const addTitle = document.getElementById('addTitle');
    const addYear = document.getElementById('addYear');
    const addType = document.getElementById('addType');
    const addPoster = document.getElementById('addPoster');
    const addDescription = document.getElementById('addDescription');
    const addUbication = document.getElementById('addUbication');
    const addEstado = document.getElementById('addEstado');

    // Campos del modal de editar película
    const editForm = document.getElementById('editForm');
    const editImdbID = document.getElementById('editImdbID');
    const editTitle = document.getElementById('editTitle');
    const editYear = document.getElementById('editYear');
    const editType = document.getElementById('editType');
    const editPoster = document.getElementById('editPoster');
    const editDescription = document.getElementById('editDescription');
    const editUbication = document.getElementById('editUbication');
    const editEstado = document.getElementById('editEstado');

    // Función para obtener películas de la API
    function obtenerPeliculas() {
        fetch(`${API_URL}?title=&ubication=`)
            .then(response => response.json())
            .then(peliculas => {
                mostrarPeliculas(peliculas.slice(1)); // Omitir el primer objeto
            })
            .catch(error => {
                console.error('Error al obtener las películas:', error);
                peliculasContainer.innerHTML = '<p class="text-danger">No se pudieron cargar las películas</p>';
            });
    }

    // Función para mostrar las películas en el HTML con botones de editar, eliminar, y redirección en la tarjeta
    function mostrarPeliculas(peliculas) {
        peliculasContainer.innerHTML = ''; // Limpiar el contenedor antes de cargar
        peliculas.forEach(pelicula => {
            const estadoTexto = pelicula.Estado ? "Disponible" : "No disponible";
            const peliculaHTML = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <a href="detalle.html?id=${pelicula.imdbID}" class="text-decoration-none text-dark">
                            <img src="${pelicula.Poster}" class="card-img-top" alt="${pelicula.Title}">
                            <div class="card-body">
                                <h5 class="card-title">${pelicula.Title}</h5>
                                <p class="card-text">Estado: ${estadoTexto}</p>
                            </div>
                        </a>
                        <div class="d-flex justify-content-between mt-2">
                            <button class="btn btn-primary" onclick="editarPelicula('${pelicula.imdbID}')">Editar</button>
                            <button class="btn btn-danger" onclick="eliminarPelicula('${pelicula.imdbID}')">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            peliculasContainer.insertAdjacentHTML('beforeend', peliculaHTML);
        });
    }

    // Función para editar película
    window.editarPelicula = function (imdbID) {
        fetch(`${API_URL}?imdbID=${imdbID}`)
            .then(response => response.json())
            .then(pelicula => {
                // Llenar los campos del modal de edición con los datos de la película
                editImdbID.value = pelicula.imdbID;
                editTitle.value = pelicula.Title;
                editYear.value = pelicula.Year;
                editType.value = pelicula.Type;
                editPoster.value = pelicula.Poster;
                editDescription.value = pelicula.description;
                editUbication.value = pelicula.Ubication;
                editEstado.value = pelicula.Estado ? "1" : "0";

                // Mostrar el modal de edición
                editModal.show();
            })
            .catch(error => console.error('Error al obtener la película:', error));
    };

    // Función para actualizar película
    editForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const updatedMovie = {
            "imdbID": editImdbID.value,
            "Title": editTitle.value,
            "Year": editYear.value,
            "Type": editType.value,
            "Poster": editPoster.value,
            "description": editDescription.value,
            "Ubication": editUbication.value,
            "Estado": editEstado.value === "1"
        };

        fetch(`${API_URL}?imdbID=${updatedMovie.imdbID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedMovie),
        })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Éxito', 'Película actualizada exitosamente', 'success');
                    editModal.hide();  // Ocultar el modal de edición
                    obtenerPeliculas(); // Refrescar la lista de películas
                } else {
                    Swal.fire('Error', 'No se pudo actualizar la película', 'error');
                }
            })
            .catch(error => console.error('Error al actualizar:', error));
    });

    // Función para agregar película
    addForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newMovie = {
            "imdbID": addImdbID.value,
            "Title": addTitle.value,
            "Year": addYear.value,
            "Type": addType.value,
            "Poster": addPoster.value,
            "description": addDescription.value,
            "Ubication": addUbication.value,
            "Estado": addEstado.value === "1"
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMovie),
        })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Éxito', 'Película agregada exitosamente', 'success');
                    addForm.reset();  // Restablecer el formulario después de agregar
                    addModal.hide();  // Ocultar el modal de forma segura
                    obtenerPeliculas(); // Refrescar la lista de películas
                } else if (response.status === 409) { // Código de estado 409 para conflicto
                    Swal.fire('Error', 'ID ya existe', 'error');
                } else {
                    Swal.fire('Error', 'No se pudo agregar la película', 'error');
                }
            })
            .catch(error => {
                console.error('Error al agregar:', error);
                Swal.fire('Error', 'Ocurrió un error al agregar la película', 'error');
            });
    });


    // Función para eliminar película
    window.eliminarPelicula = function (imdbID) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}?imdbID=${imdbID}`, {
                    method: 'DELETE'
                })
                    .then(response => {
                        if (response.ok) {
                            Swal.fire('Eliminado!', 'La película ha sido eliminada.', 'success');
                            obtenerPeliculas(); // Refrescar la lista de películas
                        } else {
                            Swal.fire('Error', 'No se pudo eliminar la película', 'error');
                        }
                    })
                    .catch(error => console.error('Error al eliminar:', error));
            }
        });
    };

    // Llamar a la función para obtener las películas al cargar la página
    obtenerPeliculas();
});

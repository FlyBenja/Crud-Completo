let peliculasDisponibles = [];
let indiceActual = 0;
const cantidadVisible = 4; // Cantidad de películas visibles al mismo tiempo

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const peliculaId = params.get('id');

    // Cargar detalles de la película seleccionada
    fetch(`https://movie.azurewebsites.net/api/cartelera?imdbID=${peliculaId}`)
        .then(response => response.json())
        .then(pelicula => {
            document.getElementById('pelicula-imagen').src = pelicula.Poster;
            const detallesHTML = `
                <h3>${pelicula.Title}</h3>
                <p>Año: ${pelicula.Year}</p>
                <p>Ubicación: ${pelicula.Ubication}</p>
                <p>Género: ${pelicula.Type}</p>
                <h4 class="sinopsis-title">Sinopsis</h4>
                <p>${pelicula.description}</p>
            `;
            document.getElementById('detalle-pelicula').innerHTML = detallesHTML;
        })
        .catch(error => console.error('Error al cargar los detalles de la película:', error));

    // Cargar las otras películas disponibles
    fetch('https://movie.azurewebsites.net/api/cartelera?title=&ubication=')
        .then(response => response.json())
        .then(peliculas => {
            // Usamos slice(1) para eliminar el primer objeto, si es innecesario
            peliculasDisponibles = peliculas.slice(1).filter(p => p.Estado === true);
            mostrarPeliculas();
        })
        .catch(error => console.error('Error al cargar las películas disponibles:', error));
});

function mostrarPeliculas() {
    const peliculasRow = document.getElementById('otras-peliculas');
    peliculasRow.innerHTML = ''; // Limpiar el contenedor

    // Mostrar solo las películas desde el índice actual hasta la cantidad visible
    const peliculasParaMostrar = peliculasDisponibles.slice(indiceActual, indiceActual + cantidadVisible);

    peliculasParaMostrar.forEach(pelicula => {
        const peliculaHTML = `
            <div class="item">
                <a href="detalle.html?id=${pelicula.imdbID}">
                    <img src="${pelicula.Poster}" alt="${pelicula.Title}">
                </a>
            </div>
        `;
        peliculasRow.insertAdjacentHTML('beforeend', peliculaHTML);
    });
}

function mostrarSiguientes() {
    if (indiceActual + cantidadVisible < peliculasDisponibles.length) {
        indiceActual += cantidadVisible;
        mostrarPeliculas();
    }
}

function mostrarAnteriores() {
    if (indiceActual > 0) {
        indiceActual -= cantidadVisible;
        mostrarPeliculas();
    }
}

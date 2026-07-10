const API_BASES = [
  'https://yts.mx/api/v2/list_movies.json',
  'https://movies-api.accel.li/api/v2/list_movies.json',
];

const edadInput = document.getElementById('edad');
const peliculaEl = document.getElementById('pelicula');
const cargandoEl = document.getElementById('cargando');
const errorEl = document.getElementById('error');
const botonesGenero = document.querySelectorAll('.btn-genero');

function obtenerEdad() {
  const edad = parseInt(edadInput.value, 10);
  return Number.isNaN(edad) || edad < 1 ? 20 : edad;
}

function activarBoton(botonActivo) {
  botonesGenero.forEach((boton) => boton.classList.remove('activo'));
  botonActivo.classList.add('activo');
}

function mostrarCargando(visible) {
  cargandoEl.hidden = !visible;
  if (visible) {
    peliculaEl.hidden = true;
    errorEl.hidden = true;
  }
}

function mostrarError(mensaje) {
  errorEl.textContent = mensaje;
  errorEl.hidden = false;
  peliculaEl.hidden = true;
  cargandoEl.hidden = true;
}

async function consultarApi(genero) {
  let ultimoError = null;

  for (const base of API_BASES) {
    try {
      const url = `${base}?genre=${encodeURIComponent(genero)}&limit=20`;
      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error('No se pudo conectar con la API de películas.');
      }

      const datos = await respuesta.json();

      if (datos.status !== 'ok' || !datos.data?.movies?.length) {
        throw new Error('No encontramos películas para ese género.');
      }

      return datos.data.movies;
    } catch (error) {
      ultimoError = error;
    }
  }

  throw ultimoError || new Error('No se pudo conectar con la API de películas.');
}

async function obtenerRecomendacion(genero) {
  mostrarCargando(true);

  try {
    const peliculas = await consultarApi(genero);
    const edad = obtenerEdad();
    const indice = edad % peliculas.length;
    const pelicula = peliculas[indice];

    peliculaEl.textContent = pelicula.title_english || pelicula.title;
    peliculaEl.hidden = false;
    errorEl.hidden = true;
  } catch (error) {
    mostrarError(error.message || 'Ocurrió un error al buscar la película.');
  } finally {
    cargandoEl.hidden = true;
  }
}

botonesGenero.forEach((boton) => {
  boton.addEventListener('click', () => {
    activarBoton(boton);
    obtenerRecomendacion(boton.dataset.genero);
  });
});

edadInput.addEventListener('change', () => {
  const botonActivo = document.querySelector('.btn-genero.activo');
  if (botonActivo) {
    obtenerRecomendacion(botonActivo.dataset.genero);
  }
});

obtenerRecomendacion('Crime');

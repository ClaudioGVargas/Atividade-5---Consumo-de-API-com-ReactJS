import React, { useState, useEffect } from "react";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const API_URL = "https://www.omdbapi.com/";

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Buscar filmes
  const searchMovies = async (pageNumber = 1) => {
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${pageNumber}`
      );
      const data = await res.json();
      if (data.Response === "True") {
        setMovies(data.Search);
        setTotalResults(parseInt(data.totalResults));
        setPage(pageNumber);
      } else {
        setError(data.Error);
        setMovies([]);
        setTotalResults(0);
      }
    } catch {
      setError("Erro ao buscar filmes.");
    } finally {
      setLoading(false);
    }
  };

  // Buscar detalhes do filme
  const fetchMovieDetails = async (imdbID) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
      );
      const data = await res.json();
      if (data.Response === "True") {
        setSelectedMovie(data);
      } else {
        setError(data.Error);
      }
    } catch {
      setError("Erro ao carregar detalhes do filme.");
    } finally {
      setLoading(false);
    }
  };

  // Favoritos
  const toggleFavorite = (movie) => {
    let updatedFavorites;
    if (favorites.find((fav) => fav.imdbID === movie.imdbID)) {
      updatedFavorites = favorites.filter((fav) => fav.imdbID !== movie.imdbID);
    } else {
      updatedFavorites = [...favorites, movie];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", background: "#f0f0f0"}}>
      <h1>🎬 Buscador de Filmes (OMDb)</h1>

      {/* Busca */}
      <input
        type="text"
        placeholder="Digite o nome do filme..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "8px", width: "60%" }}
      />
      <button onClick={() => searchMovies(1)} style={{ marginLeft: "10px" }}>
        Buscar
      </button>

      {/* Erro */}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Resultados */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "15px",
          marginTop: "20px"
        }}
      >
        {movies.map((movie) => (
          <div
            key={movie.imdbID}
            style={{ border: "1px solid #ccc", padding: "10px" }}
          >
            {movie.Poster && movie.Poster !== "N/A" ? (
              <img
                src={movie.Poster}
                alt={movie.Title}
                style={{ width: "100%" }}
              />
            ) : (
              <div style={{ height: "300px", background: "#ddd" }}>
                Sem imagem
              </div>
            )}
            <h3>{movie.Title}</h3>
            <p>{movie.Year}</p>
            <button onClick={() => fetchMovieDetails(movie.imdbID)} style={{backgroundColor: "green", color: "white"}}>
              Ver Detalhes
            </button>
            <button onClick={() => toggleFavorite(movie)} style={{backgroundColor: "red", color: "white"}}>
              {favorites.find((fav) => fav.imdbID === movie.imdbID)
                ? "★ Remover Favorito"
                : "☆ Favorito"}
            </button>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {movies.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => searchMovies(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span style={{ margin: "0 10px" }}>
            Página {page} de {Math.ceil(totalResults / 10)}
          </span>
          <button
            onClick={() => searchMovies(page + 1)}
            disabled={page >= Math.ceil(totalResults / 10)}
          >
            Próxima
          </button>
        </div>
      )}

      {/* Detalhes do filme */}
      {selectedMovie && (
        <div style={{ marginTop: "30px" }}>
          <h2>{selectedMovie.Title}</h2>
          <p><strong>Ano:</strong> {selectedMovie.Year}</p>
          <p><strong>Gênero:</strong> {selectedMovie.Genre}</p>
          <p><strong>Diretor:</strong> {selectedMovie.Director}</p>
          <p><strong>Elenco:</strong> {selectedMovie.Actors}</p>
          <p><strong>Sinopse:</strong> {selectedMovie.Plot}</p>
          <p><strong>Avaliação:</strong> {selectedMovie.imdbRating}/10</p>
          <button onClick={() => setSelectedMovie(null)}>Fechar</button>
        </div>
      )}

      {/* Lista de favoritos */}
      {favorites.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>⭐ Meus Favoritos</h2>
          <ul>
            {favorites.map((fav) => (
              <li key={fav.imdbID}>
                {fav.Title} ({fav.Year})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
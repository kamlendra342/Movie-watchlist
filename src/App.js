import { useEffect, useState } from "react";
import StarRating from "../src/StarRating";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = 44397289;


export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  // use state can receive an function but with no arguments 
  const [watched, setWatched] = useState(function () {
    const storedmovie = localStorage.getItem("watched")
    const movie = JSON.parse(storedmovie);
    if (!movie) return [];
    return movie;
  });
  const [isLoading, setisLoading] = useState(false);
  const [error, seterror] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  useEffect(function () {
    const controller = new AbortController();
    async function fetchMovie() {
      setisLoading(true);
      seterror(""); // Reset error state before making the request
      try {
        const res = await fetch(`https://omdbapi.com/?apikey=${KEY}&s=${query}`,{signal:controller.signal});
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await res.json();
        if (data.Response === "False") throw new Error("movie Not found ")
        setMovies(data.Search);
        seterror("")
      } catch (err) {
        /* console.error(err.message); */
        if (err.name !== "AbortError") {
          seterror(err.message);
        }
        
      } finally {
        setisLoading(false)
      }
    }

    if (query.length < 3) {
      setMovies([]);
      seterror("");
      return;
    }

    fetchMovie();

    return function () {
      controller.abort()
    }
  }, [query]);

  // manages local storage
  useEffect(function () {
    localStorage.setItem("watched",JSON.stringify(watched))
  },[watched])

  function handelselectedID(MovieID) {
    MovieID !== selectedID ? setSelectedID(MovieID) : setSelectedID(null);
  }
  function handleCloseselectedID(){
    setSelectedID(null);
  }


  return (
    <>
      <NavBar>
      <Logo />
      <Search query={query} setQuery={setQuery}/>
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
      </NavBar>
      <Main >
        <Box>
          {/* isLoading ? < Loading /> : <MovieList movies={movies} /> */}
          {isLoading && < Loading />}
          {!isLoading && !error && <MovieList movies={movies} handelselectedID={handelselectedID}/>}
          {error && <ErrorMessage message={error}/>}
        </Box>
        <Box>{
          selectedID ? <SelectedMovie selectedID={selectedID} CloseSelected={handleCloseselectedID} setWatched={setWatched} watched={watched} /> : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} setWatched={setWatched} />
            </>)
        }
        </Box>
      </Main> 
    </>
  );
};



function ErrorMessage({ message }) {
  return (<p className="error">
    <span>🟥</span> {message}
  </p>);
}

function Loading() {
  return (
/*   <div className="loader">
  <div className="center">
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  <div className="wave"></div>
  </div>
  </div> */
    
  <div class="loader">
  <div class="circle">
    <div class="dot"></div>
    <div class="outline"></div>
  </div>
  <div class="circle">
    <div class="dot"></div>
    <div class="outline"></div>
  </div>
  <div class="circle">
    <div class="dot"></div>
    <div class="outline"></div>
  </div>
  <div class="circle">
    <div class="dot"></div>
    <div class="outline"></div>
  </div>
</div>
  )
}

function NavBar({children}) {
  
  return<div>
    <nav className="nav-bar">{ children} </nav>
  </div>
};
function Logo() {
  return(
  <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
    </div>
  )
};
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

function Main({children}) {
  return <main className="main">
    {children}
    </main>
};

function Box({children}) {
  const [isOpen1, setIsOpen1] = useState(true);
  return <div className="box">
  <button
    className="btn-toggle"
    onClick={() => setIsOpen1((open) => !open)}
  >
    {isOpen1 ? "–" : "+"}
  </button>
    {isOpen1 && children}
</div>
};

function MovieList({movies,handelselectedID}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li key={movie.imdbID} onClick={()=> handelselectedID(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);
  return <div className="box">
  <button
    className="btn-toggle"
    onClick={() => setIsOpen2((open) => !open)}
  >
    {isOpen2 ? "–" : "+"}
  </button>
  {isOpen2 && (
    <>
      <WatchedSummary watched={watched} />
      <WatchedMoviesList watched={watched} />
    </>
  )}
</div>
}; */


function SelectedMovie({ selectedID, CloseSelected ,setWatched,watched}) {
  const [movie, setMovie] = useState({});
  const [addingbtn, setaddingbtn] = useState(false);
  const [loading, setloading] = useState(false);
  const [userRating, setuserRating] = useState("");
  let myrating = 0;
  

  
  function handleaddingbtn() {
    setaddingbtn(!addingbtn)
  }

  function handlewatchedlist(moviedata,userRating) {
    const newmovie={
      imdbID: moviedata.imdbID,
      Title: moviedata.Title,
      Year: moviedata.Year,
      Poster:moviedata.Poster,
      runtime: moviedata.Runtime.split(" ")[0],
      imdbRating: moviedata.imdbRating,
      userRating,
    };
    setWatched(watched => [...watched, newmovie]);

    (() => {
      CloseSelected();
    })();
  }

  const { Title: title,
/*     Year: year, */
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre:genre,
  } = movie;

  useEffect(() => {
    const Moviedetail = async function () {
      setloading(true);
      try {
        const res = await fetch(`https://omdbapi.com/?apikey=${KEY}&i=${selectedID}`);
        if (!res.ok) {
          throw new Error("Cannot fetch data")
        }
        const data = await res.json();
        setMovie(data);
      } catch(err){
        console.error(err.message)
      } finally {
        setloading(false);
      }
    }
    Moviedetail();

    
  }, [selectedID])
  
  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function () {
      document.title = "Pop corn";
    };
  },[title])

  return <>
    <div className="details">
      {
        loading ? <Loading /> : (<><header>
          <button className="btn-back" onClick={CloseSelected}>&larr;</button> 
          <img src={poster} alt={`Poster of ${movie} movie`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p>
              <span>⭐</span>
              {imdbRating} IMDb rating
            </p>
          </div>
        </header>
          <section>
            {watched.some(el => el.imdbID === movie.imdbID && (myrating = el.userRating)) ? <div className="rating">
              <h3>{`You have alredy added with ${myrating} ⭐ `}</h3>
            </div> :
            (<div className="rating" onClick={handleaddingbtn} >
              <StarRating maxRating={10} color="#fcc419" size={25} onSetRating={setuserRating}/>
              {
                addingbtn ? <button className="btn-add" onClick={()=>{handlewatchedlist(movie,userRating)}}>Add item + </button> : <></>
              }
            </div>)}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section></>
        )}
    </div>
    </>
}



function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return <div className="summary">
  <h2>Movies you watched</h2>
  <div>
    <p>
      <span>#️⃣</span>
      <span>{watched.length} movies</span>
    </p>
    <p>
      <span>⭐️</span>
      <span>{avgImdbRating}</span>
    </p>
    <p>
      <span>🌟</span>
      <span>{avgUserRating}</span>
    </p>
    <p>
      <span>⏳</span>
      <span>{avgRuntime} min</span>
    </p>
  </div>
</div>
};

function WatchedMoviesList({ watched ,setWatched}) {

  function handeldelbtn(moviedata) {
    const updatedWatched = watched.filter((movie) => movie.imdbID !== moviedata.imdbID);
    setWatched(updatedWatched);
    
  }
  return <ul className="list">
    {watched.map((movie) => (
      <li key={movie.imdbID}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button className="btn-delete" onClick={()=>handeldelbtn(movie)}>X</button>
        </div>
      </li>
    ))}
  </ul>
};

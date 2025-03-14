import './SearchResultPage.css'
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchBooks } from "../services/googleBooksApi";


const SearchResultPage = () => {

  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);

  useEffect(() => {
      const fetchBooks = async () => {
          if (!query) return;
          const books = await searchBooks(query);
          setResults(books);
      };
      fetchBooks();
  }, [query]);
  
  return (
    <>
      <h1>Search result for: {query}</h1>
      <ul className='searchResults'>
                {results.map((book: any) => (
                    <li key={book.id}>
                        <h2>{book.volumeInfo.title}</h2>
                        <p>{book.volumeInfo.authors?.join(", ")}</p>
                        <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
                    </li>
                ))}
            </ul>
    </>
  )
}

export default SearchResultPage;
import SearchBar from '../components/SearchBar';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className='searchbar-container'>
      <h1>Welcome to Bookify</h1>
      <h2>Discover new books, read reviews, and share your thoughts!</h2>
      <p>
        Use the search bar below to find books by title or author. 
        Click on a book to see more details, including user reviews and ratings.
      </p>

      <p>
        You have to register an account if you want to write your own reviews and 
         keep track of your book reviews.
      </p>
      <SearchBar/>
      
    </div>
  );
};

export default HomePage;

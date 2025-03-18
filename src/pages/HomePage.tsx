import SearchBar from '../components/SearchBar';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className='searchbar-container'>
      <h1>Search</h1>
      <SearchBar/>
      
    </div>
  );
};

export default HomePage;

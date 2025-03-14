import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <>
      <h1>Home</h1>
      <p>
        On init there will be a list on this page with the ten most popular books according to the ratings.
        There will also be a input field to searrch for books and authors from the google books api.
      </p>
    </>
  );
};

export default HomePage;

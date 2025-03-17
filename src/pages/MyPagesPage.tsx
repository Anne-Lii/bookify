import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const MyPagesPage = () => {
  const auth = useContext(AuthContext);

  if (!auth?.isLoggedIn) {
    return <p>You need to be logged in to see this page.</p>;
  }

  return (
    <div>
      <h1>My pages</h1>
      
      <p>Here are all your reviews on books.</p>
      <ul>
        
      </ul>
    </div>
  );
};

export default MyPagesPage;

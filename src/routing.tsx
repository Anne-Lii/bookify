import { createBrowserRouter } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DetailsPage from './pages/DetailsPage';
import SearchResultPage from './pages/SearchResultPage';
import RegisterPage from './pages/RegisterPage';
import MyPagesPage from './pages/MyPagesPage';


const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        children: [

            {path: '/', element: <HomePage/>},
            {path: '/login', element: <LoginPage/>},
            {path: '/register', element: <RegisterPage/>}, 
            {path: '/search', element: <SearchResultPage/>}, 
            {path: '/book/:id', element: <DetailsPage/>},//to show details on a book
            { path: '/my-pages', element: <MyPagesPage /> }
           

        ]
    }

]);

export default router;
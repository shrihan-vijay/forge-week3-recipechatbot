import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import CreateRecipes from './pages/CreateRecipes.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './index.css';
import App from './App.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'recipes',
        element: <Recipes />,
      },
      {
        path: 'recipes/:recipeId',
        element: <RecipeDetails />
      },
      {
        path: 'create',
        element: <CreateRecipes />
      },
      {
        path: 'myrecipes',
        element: <MyRecipes />
      },
      {
        path: 'admin',
        element: <AdminDashboard />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

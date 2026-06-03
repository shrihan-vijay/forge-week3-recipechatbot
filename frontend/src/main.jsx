import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Router, RouterProvider, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import CreateRecipes from './pages/CreateRecipes.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useUser } from './context/UserContext.jsx';
import './index.css';
import App from './App.jsx';

function AdminRoute({ children }) {
  const { user } = useUser();
  if (!user?.admin) return <Navigate to="/home" replace />;
  return children;
}

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
        element: <AdminRoute><AdminDashboard /></AdminRoute>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)

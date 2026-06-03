import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import { RecipeProvider } from "./context/RecipeContext"
import { UserProvider } from './context/UserContext.jsx';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <UserProvider>
      <RecipeProvider>
        {!isLandingPage && <Navbar />}
        <Outlet />
      </RecipeProvider>
    </UserProvider>
  )
}

export default App

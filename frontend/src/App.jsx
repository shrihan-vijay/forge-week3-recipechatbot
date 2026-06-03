import { NavLink, Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { RecipeProvider } from "./context/RecipeContext"

function App() {
  return (
    <RecipeProvider>
      <Navbar />
      <Outlet />
    </RecipeProvider>
  )
}

export default App

import { NavLink, Outlet } from "react-router-dom"

function App() {
  return (
    <>
      <nav style={{ display: 'flex', justifyContent: 'space-between' }}>
        <NavLink to="/">Landing</NavLink>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/recipes">Recipes</NavLink>
        <NavLink to="/detail">Recipe Details</NavLink>
        <NavLink to="/create">Create Recipe</NavLink>
        <NavLink to="/myrecipes">My Recipes</NavLink>
        <NavLink to="/admin">Admin Dashboard</NavLink>

        <Outlet />
      </nav>
    </>
  )
}

export default App

import { useUser } from "../context/UserContext"; 

export default function AdminDashboard() {
    const { user } = useUser();
    return (
        <>
            <p>admin page</p>
        </>
    )
}
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the home page of our application.</p>
            <button onClick={() => navigate("/register")}>GO</button>
        </div>
    );
}

export default Home;
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getToken, setToken } from "../App";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { use } from "react";

const Home = () => {
    const [tournaments, setTournaments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTournaments = async () => {
            const token = getToken();
            if (token) {
                try {
                    const response = await axios.get("https://localhost:7097/api/tournament/upcoming");
                    if (response.status === 200) {
                        setTournaments(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching tournaments:", error);
                }
            }
        };
        fetchTournaments();
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <Card className="home-card col-md-6 col-lg-4">
                <Card.Header className="text-center">
                    <h2>Home Page</h2>
                </Card.Header>
                <Card.Body>
                    <Form className="home-form">
                        <p>Welcome to the home page of our application.</p>
                        { !getToken() && (
                            <>
                                <Button variant="primary" onClick={() => navigate("/register")} className="w-100">
                                    Register
                                </Button>
                                <Button variant="primary" onClick={() => navigate("/login")} className="w-100">
                                    Login
                                </Button>
                            </>
                        )}
                        <Button variant="secondary" onClick={() => navigate("/create")} className="w-100 mt-2">
                            Create a Tournament
                        </Button>
                    </Form>
                    <h3 className="mt-4">Upcoming Tournaments</h3>
                    {tournaments.length > 0 ? (
                        <ul className="list-group">
                            {tournaments.map((tournament) => (
                                <li
                                    key={tournament.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {tournament.name} - {tournament.discipline}
                                    <span className="badge bg-primary rounded-pill">
                                        {new Date(tournament.eventTime).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No upcoming tournaments available.</p>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}

export default Home;
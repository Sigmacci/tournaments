import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getToken, setToken } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <Card className="home-card col-md-6 col-lg-4">
                <Card.Header className="text-center">
                    <h2>Home Page</h2>
                </Card.Header>
                <Card.Body>
                    <Form className="home-form">
                        <p>Welcome to the home page of our application.</p>
                        { getToken() || (
                            <>
                            <Button variant="primary" onClick={() => navigate("/register")} className="w-100">
                                Register
                            </Button>
                            <Button variant="primary" onClick={() => navigate("/login")} className="w-100">
                                Login
                            </Button>
                        </>)}
                        <Button variant="secondary" onClick={() => navigate("/create")} className="w-100 mt-2">
                            Create a Tournament
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Home;
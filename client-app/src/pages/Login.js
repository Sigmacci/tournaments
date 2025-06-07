import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getToken, setToken } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();

    if (getToken()) {
        navigate("/");
        return <div>Redirecting...</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            console.log("Form Data:", formData);
            const response = await axios.post("https://localhost:7097/api/auth/login", formData);
            if (response.status === 200) {
                setToken(response.data.token);
                navigate("/");
            } else {
                setError(response.data.message || "Login failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Card className="login-card col-md-6 col-lg-4">
                <Card.Header className="text-center">
                    <h2>Login</h2>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
                    </Form>
                    <a href="/register" className="d-block text-center mt-3 text-decoration-none">
                        Don't have an account? Register here
                    </a>
                </Card.Body>
                <Button variant="secondary" className="w-100 mt-2" onClick={() => navigate("/forgot-password")}>
                    Forgot Password?
                </Button>
            </Card>
        </div>
    );
}

export default Login;
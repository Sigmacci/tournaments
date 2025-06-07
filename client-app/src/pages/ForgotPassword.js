import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getToken } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    if (getToken()) {
        navigate("/");
        return <div>Redirecting...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            console.log("Form Data:", email);
            const response = await axios.post(`https://localhost:7097/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
            if (response.status === 200) {
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
                    <h2>Forgot Password</h2>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Send request
                        </Button>
                    </Form>
                    <a href="/login" className="d-block text-center mt-3 text-decoration-none">
                        Login
                    </a>
                </Card.Body>
            </Card>
        </div>
    );
}

export default ForgotPassword;
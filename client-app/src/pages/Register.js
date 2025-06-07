import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getToken } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();
    if (getToken()) {
        navigate("/");
        // return <div>Redirecting...</div>;
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            console.log("Form Data:", formData);
            const { confirmPassword, ...dataToSend } = formData;
            const response = await axios.post("https://localhost:7097/api/auth/register", dataToSend);
            if (response.status === 200) {
                navigate("/");
            } else {
                setError(response.data.message || "Registration failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Card className="register-card col-md-6 col-lg-4">
                <Card.Header className="text-center">
                    <h2>Register</h2>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="register-form">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <Form.Group controlId="formFirstName" className="mb-3"> 
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                placeholder="First Name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formUsername" className="mb-3">
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                placeholder="Last Name"
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Email"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Password"
                            />
                        </Form.Group>
                        <Form.Group controlId="formConfirmPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Confirm Password"
                            />
                        </Form.Group>
                        <Button className="mx-auto col-md-12" variant="primary" type="submit">
                            Register
                        </Button>
                    </Form>
                    <a href="/login" className="d-block text-center mt-3 text-decoration-none">
                        Already have an account? Login here
                    </a>
                </Card.Body>
            </Card>
        </div>
    )
}

export default Register;
import axios from "axios";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import { getToken } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";

const ResetPassword = () => {
     const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const token = queryParams.get('token');

    const [formData, setFormData] = useState({
        email: email,
        token: token,
        newPassword: "",
        confirmPassword: ""
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
            if (formData.newPassword !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const { confirmPassword, ...dataToSend } = formData;
            const response = await axios.post("https://localhost:7097/api/auth/reset-password", dataToSend);
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
                    <h2>Login</h2>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="New Password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formConfirmPassword" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Reset
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default ResetPassword;
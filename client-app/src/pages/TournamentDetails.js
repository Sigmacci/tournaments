import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, Button, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { getToken } from '../App';

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [canSignUp, setCanSignUp] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [rank, setRank] = useState('');
    const [loading, setLoading] = useState(false);
    // const token = getToken();

    useEffect(() => {
        const token = getToken();
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`https://localhost:7097/api/tournament/${id}`);
                setTournament(response.data);
            } catch (error) {
                console.error("Error fetching tournament details:", error);
            }
            try {
                const userResponse = await axios.get("https://localhost:7097/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userResponse.status === 200) {
                    setCurrentUser(userResponse.data);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchTournament();
    }, []);

    const handleRegister = () => {
        if (!currentUser) {
            alert("You must be logged in to register for a tournament.");
            navigate('/login');
            return;
        }
        setCanSignUp(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = getToken();
        try {
            const response = await axios.post(
                `https://localhost:7097/api/tournament/signup/${id}`,
                { licenseNumber, rank },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Successfully signed up!");
            setCanSignUp(false);
        } catch (error) {
            alert(error.response?.data || "Error signing up.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
                <Card style={{ width: '400px', padding: '2rem', margin: '2rem' }}>
                    <Card.Body style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Card.Title>Tournament Details</Card.Title>
                        <div><strong>Name:</strong> {tournament.name}</div>
                        <div><strong>Discipline:</strong> {tournament.discipline}</div>
                        <div><strong>Event Time:</strong> {tournament.eventTime}</div>
                        <div><strong>Participation Deadline:</strong> {tournament.participationDeadline}</div>
                        <div><strong>Location:</strong> {tournament.locationName}</div>
                        <div><strong>Max Participants:</strong> {tournament.maxParticipants}</div>
                        <div><strong>Sponsor Logos:</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                {Array.isArray(tournament.sponsorLogos) && tournament.sponsorLogos.map((logo, idx) => (
                                    <img key={idx} src={logo.logoUrl} alt={`Sponsor ${idx + 1}`} style={{ maxWidth: 100, maxHeight: 100 }} />
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: "auto" }}>
                            <Button variant="secondary" onClick={() => navigate('/')} className="w-100 mb-2">
                                Back to Home
                            </Button>
                            <Button variant="primary" onClick={handleRegister} className="w-100">
                                Register for Tournament
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
                <div style={{ flex: 1 }}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{
                            lat: tournament.latitude || 52.406374,
                            lng: tournament.longitude || 16.9251681
                        }}
                        zoom={18}
                        options={{
                            gestureHandling: 'greedy',
                            disableDefaultUI: true
                        }}
                    >
                        {(tournament.latitude && tournament.longitude) && (
                            <Marker position={{ lat: tournament.latitude, lng: tournament.longitude }} />
                        )}
                    </GoogleMap>
                </div>
            </div>

            {/* Signup Modal */}
            <Modal show={canSignUp} onHide={() => setCanSignUp(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Sign Up for Tournament</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formLicenseNumber">
                            <Form.Label>License Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={licenseNumber}
                                onChange={e => setLicenseNumber(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formRank">
                            <Form.Label>Rank</Form.Label>
                            <Form.Control
                                type="text"
                                value={rank}
                                onChange={e => setRank(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? "Signing up..." : "Sign Up"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default TournamentDetails;
import axios from 'axios';
import { useState, useEffect, useRef, use } from 'react';
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, Marker, Autocomplete, LoadScript } from '@react-google-maps/api';

const TournamentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState({});

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`https://localhost:7097/api/tournament/${id}`);
                setTournament(response.data);
            } catch (error) {
                console.error("Error fetching tournament details:", error);
            }
        };

        fetchTournament();
    }, []);

    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
            <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
                <Card style={{ width: '400px', padding: '2rem', margin: '2rem' }}>
                    <Card.Body>
                        <Card.Title>Tournament Details</Card.Title>
                        <div>
                            <strong>Name:</strong> {tournament.name}
                        </div>
                        <div>
                            <strong>Discipline:</strong> {tournament.discipline}
                        </div>
                        <div>
                            <strong>Event Time:</strong> {tournament.eventTime}
                        </div>
                        <div>
                            <strong>Participation Deadline:</strong> {tournament.participationDeadline}
                        </div>
                        <div>
                            <strong>Location:</strong> {tournament.locationName}
                        </div>
                        <div>
                            <strong>Max Participants:</strong> {tournament.maxParticipants}
                        </div>
                        <div>
                            <strong>Sponsor Logos:</strong>
                            <ul>
                                {Array.isArray(tournament.sponsorLogos) && tournament.sponsorLogos.map((logo, idx) => (
                                    <li key={idx}>
                                        <img src={logo} alt={`Sponsor ${idx + 1}`} style={{ maxWidth: 100, maxHeight: 40 }} />
                                    </li>
                                ))}
                            </ul>
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
        </LoadScript>
    );
}

export default TournamentDetails;
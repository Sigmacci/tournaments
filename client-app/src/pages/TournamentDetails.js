import axios from 'axios';
import { useState, useEffect, use } from 'react';
import { Card, Button, Form, Modal, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { getToken } from '../App';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const TournamentDetails = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`https://localhost:7097/api/tournament/${id}`);
                setTournament(response.data);

            } catch (error) {
                setTournament(null);
            }
        };
        fetchTournament();
    }, [id]);

    if (!tournament) {
        return <div>Loading tournament details...</div>;
    }

    if (new Date(tournament.eventTime) > new Date()) {
        return (<TournamentInfo tId={id} />)
    }
    console.log(tournament.maxParticipants);

    return (
        <TournamentScoreBoard
            tId={id}
            discipline={tournament.discipline}
            participants={tournament.maxParticipants}
        />
    );
};

const TournamentInfo = ({ tId }) => {
    const navigate = useNavigate();
    const [tournament, setTournament] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [canSignUp, setCanSignUp] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [rank, setRank] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = getToken();
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`https://localhost:7097/api/tournament/${tId}`);
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
                `https://localhost:7097/api/tournament/signup/${tId}`,
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
                            <Button variant="primary" onClick={handleRegister} className="w-100 mb-2">
                                Register for Tournament
                            </Button>
                            { currentUser && currentUser.id == tournament.organizerId && (<Button variant="outline-primary" onClick={() => navigate(`/edit/${tournament.id}`)} className="w-100">
                                Edit
                            </Button>)}
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
}

const TournamentScoreBoard = ({ tId, discipline, participants }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get(`https://localhost:7097/api/tournament/${tId}/matches`);
                setMatches(response.data);
                console.log("Fetched matches:", response.data);
            } catch (error) {
                console.error("Error fetching matches", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [tId]);

    if (loading) return <div>Loading scoreboard...</div>;

    if (discipline === "chess") {
        return <ChessScoreboard matches={matches} maxParticipants={participants} />;
    } else {
        return <Ladder tId={tId} matches={matches} maxParticipants={participants} />;
    }
};

const Ladder = ({ tId, matches, maxParticipants }) => {
    const [names, setNames] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const token = getToken();
        const fetchUser = async () => {
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
        }

        fetchUser();
    }, []);

    useEffect(() => {
        const matchesWithNames = matches.map(match => ({
            ...match,
            participant1Name: match.participant1Id !== null ? `${match.participant1.firstName} ${match.participant1.lastName}` : "Waiting",
            participant2Name: match.participant2Id !== null ? `${match.participant2.firstName} ${match.participant2.lastName}` : "Waiting"
        }));

        let rounds = [];
        let matchesInRound = maxParticipants / 2;
        let matchIndex = 0;

        while (matchesInRound >= 1) {
            let round = [];
            for (let i = 0; i < matchesInRound; i++) {
                const match = matchesWithNames[matchIndex];
                if (match) {
                    round.push(match.participant1Name);
                    round.push(match.participant2Name);
                } else {
                    round.push("Waiting");
                    round.push("Waiting");
                }
                matchIndex++;
            }
            rounds.push(round);
            matchesInRound = matchesInRound / 2;
        }
        if (matches[matches.length - 1]?.result === "F") {
            const lastMatch = matchesWithNames[matches.length - 1];
            setIsEnded(true);
            rounds.push([lastMatch.participant1Name]);
        } else {
            rounds.push(["Waiting"]);
        }
        setNames(rounds);
        console.log("Rounds calculated:", rounds);
    }, [matches, maxParticipants]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const matchId = form.selectMatch.value;
        const winnerId = form.selectWinner.value;
        const token = getToken();

        if (!matchId || !winnerId) {
            alert("Please select a match and a winner.");
            return;
        }

        try {
            const response = await axios.post(
                `https://localhost:7097/api/tournament/${tId}/${matchId}/submit-result?winnerId=${winnerId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.status !== 200) {
                alert(response.error?.response?.data || "Failed to submit result.");
                return;
            }
            alert("Result submitted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error submitting result:", error);
            alert("Failed to submit result. Please try again.");
        }
    };

    return (
        <div>
            <div className='d-flex' style={{ width: '100%', height: '500px', flexDirection: 'column' }}>
                {names.map((round, index) => (
                    <Row key={index} className="w-100 align-items-center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '10px', flexDirection: 'row', borderBottom: '1px solid #ccc' }}>
                        {round.map((participant, idx) => (
                            <Col key={idx} className="d-flex align-items-center justify-content-center" style={{ height: "75px", flex: 1, padding: '5px' }}>
                                <div style={{ width: "150px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                                    {participant || "Waiting"}
                                </div>
                            </Col>
                        ))}
                    </Row>
                ))}
            </div>
            <div className='d-flex' style={{ width: '100%', height: '500px', flexDirection: 'column' }}>
                {currentUser && matches.filter(match => match.participant1?.id === currentUser.id || match.participant2?.id === currentUser.id).length > 0 && (
                    <Card className="p-3 mt-3 col-md-6 mx-auto">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="selectMatch">
                                <Form.Label>Select Your Match</Form.Label>
                                <Form.Control as="select" name="selectMatch" required>
                                    <option value="">Choose match</option>
                                    {matches
                                        .filter(match => (match.participant1?.id === currentUser.id || match.participant2?.id === currentUser.id) && match.result === "N" && match.participant1Id && match.participant2Id)
                                        .map(match => (
                                            <option key={match.id} value={match.id}>
                                                {`${match.participant1.firstName} ${match.participant1.lastName}`} vs {`${match.participant2.firstName} ${match.participant2.lastName}`}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="selectWinner" className="mt-3">
                                <Form.Label>Select Winner</Form.Label>
                                <Form.Control as="select" name="selectWinner" required>
                                    <option value="">Choose participant</option>
                                    {matches
                                        .filter(match => (match.participant1?.id === currentUser.id || match.participant2?.id === currentUser.id) && match.result === "N" && match.participant1Id && match.participant2Id)
                                        .flatMap(match => [
                                            <option key={match.participant1?.id} value={match.participant1?.id}>
                                                {`${match.participant1.firstName} ${match.participant1.lastName}`}
                                            </option>,
                                            <option key={match.participant2?.id} value={match.participant2?.id}>
                                                {`${match.participant2.firstName} ${match.participant2.lastName}`}
                                            </option>
                                        ])}
                                </Form.Control>
                            </Form.Group>
                            <Button className="mt-3" variant="primary" type="submit" disabled={isEnded}>
                                Submit Result
                            </Button>
                        </Form>
                    </Card>
                )}
            </div>
        </div>
    );
};

const ChessScoreboard = ({ matches, maxParticipants }) => {
    const [names, setNames] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const token = getToken();
        const fetchUser = async () => {
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
        }
        fetchUser();
    }, []);

    useEffect(() => {
        const matchesWithNames = matches.map(match => ({
            ...match,
            participant1Name: match.participant1Id !== null ? `${match.participant1.firstName} ${match.participant1.lastName}` : "Waiting",
            participant2Name: match.participant2Id !== null ? `${match.participant2.firstName} ${match.participant2.lastName}` : "Waiting"
        }));

        let rounds = [];
        let matchesInRound = maxParticipants / 2;
        let matchIndex = 0;

        while (matchesInRound >= 1) {
            let round = [];
            for (let i = 0; i < matchesInRound; i++) {
                const match = matchesWithNames[matchIndex];
                if (match) {
                    round.push(match.participant1Name);
                    round.push(match.participant2Name);
                } else {
                    round.push("Waiting");
                    round.push("Waiting");
                }
                matchIndex++;
            }
            rounds.push(round);
            matchesInRound = matchesInRound / 2;
        }
        if (matches[matches.length - 1]?.result === "F") {
            const lastMatch = matchesWithNames[matches.length - 1];
            setIsEnded(true);
            rounds.push([lastMatch.participant1Name]);
        } else {
            rounds.push(["Waiting"]);
        }
        setNames(rounds);
    }, [matches, maxParticipants]);

    const winMap = {};
    matches.forEach(match => {
        if (match.result === "1" || match.result === "2") {
            const winner = match.result === "1" ? match.participant1 : match.participant2;
            const id = winner.id;
            if (!winMap[id]) {
                winMap[id] = {
                    name: `${winner.firstName} ${winner.lastName}`,
                    wins: 0
                };
            }
            winMap[id].wins += 1;
        }
    });
    const data = Object.values(winMap).sort((a, b) => b.wins - a.wins);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const matchId = form.selectMatch.value;
        const winnerId = form.selectWinner.value;
        const token = getToken();

        if (!matchId || !winnerId) {
            alert("Please select a match and a winner.");
            return;
        }

        try {
            const response = await axios.post(
                `https://localhost:7097/api/tournament/${matches[0]?.tournamentId}/${matchId}/submit-result?winnerId=${winnerId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.status !== 200) {
                alert(response.error?.response?.data || "Failed to submit result.");
                return;
            }
            alert("Result submitted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error submitting result:", error);
            alert("Failed to submit result. Please try again.");
        }
    };

    return (
        <div>
            <div style={{ width: '100%', height: '500px', marginTop: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis type="number" allowDecimals={false} />
                        <XAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Bar dataKey="wins" fill="#4287f5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className='d-flex' style={{ width: '100%', height: '500px', flexDirection: 'column' }}>
                {currentUser && matches.filter(match => match.participant1?.id === currentUser.id || match.participant2?.id === currentUser.id).length > 0 && (
                    <Card className="p-3 mt-3 col-md-6 mx-auto">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="selectMatch">
                                <Form.Label>Select Your Match</Form.Label>
                                <Form.Control as="select" name="selectMatch" required>
                                    <option value="">Choose match</option>
                                    {matches
                                        .filter(match => (match.participant1?.id === currentUser.id || match.participant2?.id === currentUser.id) && match.result === "N" && match.participant1Id && match.participant2Id)
                                        .map(match => (
                                            <option key={match.id} value={match.id}>
                                                {`${match.participant1.firstName} ${match.participant1.lastName}`} vs {`${match.participant2.firstName} ${match.participant2.lastName}`}
                                            </option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="selectWinner" className="mt-3">
                                <Form.Label>Select Winner</Form.Label>
                                <Form.Control as="select" name="selectWinner" required>
                                    <option value="">Choose participant</option>
                                    {matches
                                        .filter(match => (match.participant1?.id === currentUser.id || match.participant2?.id === currentUser.id) && match.result === "N" && match.participant1Id && match.participant2Id)
                                        .flatMap(match => [
                                            <option key={match.participant1?.id} value={match.participant1?.id}>
                                                {`${match.participant1.firstName} ${match.participant1.lastName}`}
                                            </option>,
                                            <option key={match.participant2?.id} value={match.participant2?.id}>
                                                {`${match.participant2.firstName} ${match.participant2.lastName}`}
                                            </option>
                                        ])}
                                </Form.Control>
                            </Form.Group>
                            <Button className="mt-3" variant="primary" type="submit" disabled={isEnded}>
                                Submit Result
                            </Button>
                        </Form>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TournamentDetails;
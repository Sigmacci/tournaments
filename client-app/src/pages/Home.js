import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Form, Button } from "react-bootstrap";
import { getToken, removeToken } from "../App"; // Adjust the import path as necessary

const Home = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const [myTournaments, setMyTournaments] = useState([]);
    const navigate = useNavigate();

    const itemsPerPage = 5;

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await axios.get("https://localhost:7097/api/tournament/upcoming");
                if (response.status === 200) {
                    setTournaments(response.data);
                    setSearchResults(response.data);
                    setTotalPages(Math.ceil(response.data.length / itemsPerPage));
                }
            } catch (error) {
                console.error("Error fetching tournaments:", error);
            }
        };

        const fetchMyTournaments = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const response = await axios.get("https://localhost:7097/api/tournament/upcoming/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.status === 200) {
                    setMyTournaments(response.data);
                }
            } catch (error) {
                console.warn("Error fetching my tournaments:", error);
            }
        };

        fetchTournaments();
        fetchMyTournaments();
    }, []);

    useEffect(() => {
        const filtered = searchQuery.trim() === ""
            ? tournaments
            : tournaments.filter(t =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

        setSearchResults(filtered);
        setCurrentPage(1);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }, [searchQuery, tournaments]);

    useEffect(() => {
        if (filterType === "all") {
            setSearchResults(tournaments);
            setCurrentPage(1);
            setTotalPages(Math.ceil(tournaments.length / itemsPerPage));
        } else {
            setSearchResults(myTournaments);
            setCurrentPage(1);
            setTotalPages(Math.ceil(myTournaments.length / itemsPerPage));
        }
    }, [filterType]);

    const currentItems = searchResults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPageButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`btn btn-sm mx-1 ${i === currentPage ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    const handleLogout = async () => {
        try {
            const token = getToken();
            if (token) {
                await axios.post("https://localhost:7097/api/auth/logout", {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
        setMyTournaments([]);
        removeToken();
        navigate("/");
    }

    const token = getToken();

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <Card className="home-card col-md-6 col-lg-4">
                <Card.Header className="text-center">
                    <h2>Home Page</h2>
                </Card.Header>
                <Card.Body>
                    <Form className="home-form">
                        {!token && (
                            <>
                                <Button variant="primary" onClick={() => navigate("/login")} className="w-100 mb-2">
                                    Login
                                </Button>
                                <Button variant="outline-primary" onClick={() => navigate("/register")} className="w-100">
                                    Register
                                </Button>
                            </>
                        )}
                        {token && (
                            <>
                                <Button variant="outline-danger" onClick={() => handleLogout()} className="w-100 mb-2">
                                    Logout
                                </Button>
                                <Button variant="secondary" onClick={() => navigate("/create")} className="w-100">
                                    Create a Tournament
                                </Button>
                            </>
                        )}
                    </Form>
                    <h3 className="mt-4">Upcoming Tournaments</h3>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search tournaments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="d-flex justify-content-center mb-3">
                        <div className="btn-group mx-auto" role="group" aria-label="Basic radio toggle button group">
                            <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={filterType === "all"} onClick={() => setFilterType("all")} />
                            <label className="btn btn-outline-primary" htmlFor="btnradio1">All tournaments</label>

                            <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" disabled={!getToken()} checked={filterType === "my"} onClick={() => setFilterType("my")} />
                            <label className="btn btn-outline-primary" htmlFor="btnradio2">My tournaments</label>
                        </div>
                    </div>
                    {currentItems.length > 0 ? (
                        <>
                            <ul className="list-group">
                                {currentItems.map((tournament) => (
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
                            <div className="d-flex justify-content-center mt-3">
                                <button
                                    className="btn btn-sm btn-outline-secondary mx-1"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                {renderPageButtons()}
                                <button
                                    className="btn btn-sm btn-outline-secondary mx-1"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <p>No upcoming tournaments available.</p>
                    )}
                </Card.Body>
            </Card>
        </div >
    );
};

export default Home;

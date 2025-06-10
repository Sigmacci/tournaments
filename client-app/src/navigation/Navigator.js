import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import CreateTournament from "../pages/CreateTournament";
import TournamentDetails from "../pages/TournamentDetails";
import EditTournament from "../pages/EditTournament";

const Navigator = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/create" element={<CreateTournament />} />
                <Route path="/tournament/:id" element={<TournamentDetails />} />
                <Route path="/edit/:id" element={<EditTournament />} />
            </Routes>
        </Router>
    );
}

export default Navigator;
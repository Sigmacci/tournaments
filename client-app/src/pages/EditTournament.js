import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Form, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from 'react-router-dom';
import { getToken, setToken } from "../App";
import { GoogleMap, Marker, Autocomplete, LoadScript } from '@react-google-maps/api';


const EditTournament = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const autocompleteRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        discipline: '',
        organizerId: '',
        eventTime: '',
        participationDeadline: '',
        locationName: '',
        latitude: 52.40260118220251,
        longitude: 16.948277760634944,
        maxParticipants: '',
        sponsorLogos: ['']
    });
    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.error('No token found, redirecting to login');
            return navigate('/login', { replace: true });
        }
        axios.get(`https://localhost:7097/api/tournament/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                if (res.data) {
                    setForm({
                        ...form,
                        name: res.data.name,
                        discipline: res.data.discipline,
                        organizerId: res.data.organizerId,
                        eventTime: res.data.eventTime,
                        participationDeadline: res.data.participationDeadline,
                        locationName: res.data.locationName,
                        latitude: res.data.latitude,
                        longitude: res.data.longitude,
                        maxParticipants: res.data.maxParticipants,
                        sponsorLogos: res.data.sponsorLogos || ['']
                    });
                }
            })
            .catch((e) => {
                console.error('Error fetching tournament data:', e);
                return navigate('/login', { replace: true });
            });
        axios.get('https://localhost:7097/api/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                if (res.data && res.data.id) {
                    setForm(f => ({ ...f, organizerId: res.data.id }));
                }
            })
            .catch((e) => {
                console.error('Error fetching user data:', e);
                return navigate('/login', { replace: true });
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('sponsorLogos')) {
            const idx = parseInt(name.split('-')[1]);
            const newLogos = [...form.sponsorLogos];
            newLogos[idx] = value;
            setForm({ ...form, sponsorLogos: newLogos });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleAddSponsorLogo = () => {
        setForm({ ...form, sponsorLogos: [...form.sponsorLogos, ''] });
    };

    const handleRemoveSponsorLogo = (idx) => {
        const newLogos = form.sponsorLogos.filter((_, i) => i !== idx);
        setForm({ ...form, sponsorLogos: newLogos });
    };

    const handleMapClick = (e) => {
        const lat = e.detail.latLng.lat;
        const lng = e.detail.latLng.lng;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setForm(f => ({
                    ...f,
                    locationName: results[0].formatted_address,
                    latitude: lat,
                    longitude: lng
                }));
            } else {
                setForm(f => ({
                    ...f,
                    latitude: lat,
                    longitude: lng
                }));
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            axios.put(`https://localhost:7097/api/tournament/edit/${id}`, form, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                }
            })
                .then(res => {
                    if (res.status >= 200 && res.status < 300) {
                        navigate('/');
                    } else {
                        console.error('Error updating tournament:', res.data);
                        alert('Failed to create tournament: ' + res.data.message);
                    }
                })
                .catch(err => {
                    console.error('Error creating tournament:', err.response?.data || err.message);
                });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
            <Card style={{ width: '400px', padding: '2rem', margin: '2rem' }}>
                <Card.Body>
                    <Card.Title>Create Tournament</Card.Title>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Discipline</Form.Label>
                            <Form.Select
                                name="discipline"
                                value={form.discipline}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select a discipline</option>
                                <option value="tabletennis">Table Tennis</option>
                                <option value="basketball">Basketball</option>
                                <option value="chess">Chess</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Event Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="eventTime"
                                value={form.eventTime}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Participation Deadline</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="participationDeadline"
                                value={form.participationDeadline}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Autocomplete
                                onLoad={autocomplete => (autocompleteRef.current = autocomplete)}
                                onPlaceChanged={() => {
                                    if (!autocompleteRef.current || typeof autocompleteRef.current.getPlace !== 'function') return;

                                    const place = autocompleteRef.current.getPlace();
                                    if (!place) return;

                                    if (!form.locationName) {
                                        form.locationName = "plac Marii Skłodowskiej-Curie 5, 60-965 Poznań, Польша";
                                        const geocoder = new window.google.maps.Geocoder();
                                        geocoder.geocode({ address: form.locationName }, (results, status) => {
                                            if (status === 'OK' && results[0]) {
                                                const location = results[0].geometry.location;
                                                setForm(f => ({
                                                    ...f,
                                                    locationName: results[0].formatted_address,
                                                    latitude: location.lat(),
                                                    longitude: location.lng()
                                                }));
                                            } else {
                                                console.error("Geocoding failed: ", status);
                                            }
                                        });
                                    }
                                    if (place && place.geometry) {
                                        const lat = place.geometry.location.lat();
                                        const lng = place.geometry.location.lng();
                                        setForm(f => ({
                                            ...f,
                                            locationName: place.formatted_address || place.name,
                                            latitude: lat,
                                            longitude: lng
                                        }));
                                    }
                                }}
                            >
                                <Form.Control
                                    type="text"
                                    name="locationName"
                                    value={form.locationName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Search for a location"
                                />
                            </Autocomplete>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Max Participants</Form.Label>
                            <Form.Select
                                name="maxParticipants"
                                value={form.maxParticipants}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select max participants</option>
                                <option value="2">2</option>
                                <option value="4">4</option>
                                <option value="8">8</option>
                                <option value="16">16</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sponsor Logos</Form.Label>
                            {form.sponsorLogos.map((logo, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <Form.Control
                                        type="text"
                                        name={`sponsorLogos-${idx}`}
                                        value={logo}
                                        onChange={handleChange}
                                        placeholder="Sponsor Logo URL"
                                    />
                                    <Button
                                        variant="danger"
                                        type="button"
                                        onClick={() => handleRemoveSponsorLogo(idx)}
                                        disabled={form.sponsorLogos.length === 1}
                                        style={{ marginLeft: 4 }}
                                    >-</Button>
                                </div>
                            ))}
                            <Button variant="secondary" type="button" onClick={handleAddSponsorLogo} className="mt-2">
                                Add Sponsor Logo
                            </Button>
                        </Form.Group>
                        <Button variant="primary" type="submit" className='col-md-12'>Create</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div style={{ flex: 1 }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: form.latitude, lng: form.longitude }}
                    zoom={18}
                    onClick={e => {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                            if (status === 'OK' && results[0]) {
                                setForm(f => ({
                                    ...f,
                                    locationName: results[0].formatted_address,
                                    latitude: lat,
                                    longitude: lng
                                }));
                            } else {
                                setForm(f => ({
                                    ...f,
                                    latitude: lat,
                                    longitude: lng
                                }));
                            }
                        });
                    }}
                    options={{
                        gestureHandling: 'greedy',
                        disableDefaultUI: true
                    }}
                >
                    <Marker position={{ lat: form.latitude, lng: form.longitude }} />
                </GoogleMap>
            </div>
        </div>
    );
}

export default EditTournament;
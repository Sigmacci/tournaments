import axios from 'axios';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { Form, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getToken, setToken } from "../App";
import { Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';


const CreateTournament = () => {
    const navigate = useNavigate();
    const autocompleteRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        discipline: '',
        organizerId: '',
        eventTime: '',
        participationDeadline: '',
        locationName: '',
        latitude: 22.54992,
        longitude: 0,
        maxParticipants: '',
        sponsorLogos: ['']
    });
    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.error('No token found, redirecting to login');
            return navigate('/login', { replace: true });
        }
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
        // Ensure google maps API is loaded from the global window object
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    setForm(f => ({
                        ...f,
                        locationName: results[0].formatted_address,
                        latitude: e.detail.latLng.lat,
                        longitude: e.detail.latLng.lng
                    }));
                } else {
                    setForm(f => ({//
                        ...f,
                        latitude: e.detail.latLng.lat,
                        longitude: e.detail.latLng.lng
                    }));
                }
            });
        } else {
            // Fallback if google is not loaded yet
            setForm(f => ({
                ...f,
                latitude: e.detail.latLng.lat,
                longitude: e.detail.latLng.lng
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        try{
            axios.post('https://localhost:7097/api/tournament/create', form, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                }
            })
                .then(res => {
                    if (res.status === 200) {
                        navigate('/');
                    } else {
                        console.error('Error creating tournament:', res.data);
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
                            <Form.Control
                                type="text"
                                name="discipline"
                                value={form.discipline}
                                onChange={handleChange}
                                required
                            />
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
                                    if (!autocompleteRef.current) return;

                                    const place = autocompleteRef.current.getPlace();
                                    if (place && place.geometry) {
                                        const lat = place.geometry.location.lat();
                                        const lng = place.geometry.location.lng();
                                        console.log(lat, lng);
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
                            <Form.Control
                                type="number"
                                name="maxParticipants"
                                value={form.maxParticipants}
                                onChange={handleChange}
                                required
                                min={1}
                            />
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
                        <Button variant="primary" type="submit">Create</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div style={{ flex: 1 }}>
                <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}>
                    <Map
                        style={{ width: '100%', height: '100%' }}
                        center={{ lat: form.latitude, lng: form.longitude }}
                        zoom={15}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        onClick={handleMapClick}
                    >
                        <Marker position={{ lat: form.latitude, lng: form.longitude }} />
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
};

export default CreateTournament;
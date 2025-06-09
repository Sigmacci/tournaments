import './App.css';
import Navigator from './navigation/Navigator';
import { LoadScript } from '@react-google-maps/api';
import { jwtDecode } from 'jwt-decode';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
};

const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

function App() {
  if (getToken() && isTokenExpired()) {
    removeToken();
  }
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      onLoad={() => console.log("Google Maps script loaded successfully")}
      onError={(e) => {
        console.error("Error loading Google Maps script:", e);
        alert("Google Maps could not be loaded. Check your API key or network.");
      }}
    >
      <Navigator />
    </LoadScript>
  );
}

export default App;

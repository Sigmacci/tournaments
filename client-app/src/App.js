import './App.css';
import Navigator from './navigation/Navigator';

export function getToken() {
    return localStorage.getItem('token');
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
};

function App() {
  return (
    <Navigator />
  );
}

export default App;

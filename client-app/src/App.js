import './App.css';
import Navigator from './navigation/Navigator';

export const setToken = (token) => {
  localStorage.setItem('jwtToken', token);
};

export const getToken = () => {
  return localStorage.getItem('jwtToken');
};

export const removeToken = () => {
  localStorage.removeItem('jwtToken');
};

function App() {
  if (getToken()) {
    removeToken();
  }
  return (
    <Navigator />
  );
}

export default App;

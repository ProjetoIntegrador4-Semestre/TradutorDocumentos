import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Tradutor';
import GoogleCallback from './components/GoogleCallback';
import { getToken } from './auth';



function PrivateRoute({ children }) {
  const authed = !!getToken();
  return authed ? children : <Navigate to="/login" replace />;
}

function App() {
  const isAuthenticated = !!getToken();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route
          path="/tradutor"
          element={isAuthenticated ? <Tradutor /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import EditUserPage from "./pages/EditUserPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const role = localStorage.getItem("adminRole");

  return token && role === "admin" ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <div style={{ marginLeft: 200 }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                    <Route path="/edit/:id" element={<ProtectedRoute><EditUserPage /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;


// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

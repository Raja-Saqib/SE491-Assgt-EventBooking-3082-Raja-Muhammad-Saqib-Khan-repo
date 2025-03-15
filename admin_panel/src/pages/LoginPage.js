import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container } from "@mui/material";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:5000/users/login", { email, password });
            const { token, role } = response.data;

            if (role !== "admin") {
                setError("Access denied: Only admins can log in");
                return;
            }

            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminRole", role);
            navigate("/");
        } catch (error) {
            setError("Invalid email or password");
        }
    };

    return (
        <Container>
            <h2>Admin Login</h2>
            <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField fullWidth type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Button variant="contained" onClick={handleLogin} style={{ marginTop: 10 }}>Login</Button>
        </Container>
    );
};

export default LoginPage;

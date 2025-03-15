import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, MenuItem, Container } from "@mui/material";

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "", email: "", role: "" });
    const roles = ["admin", "organizer", "user"];

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(`http://localhost:5000/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const updateUser = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.put(`http://localhost:5000/users/${id}`, user, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate("/");
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <Container>
            <h2>Edit User</h2>
            <TextField fullWidth label="Name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
            <TextField fullWidth label="Email" value={user.email} disabled />
            <TextField select fullWidth label="Role" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })}>
                {roles.map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
            </TextField>
            <Button variant="contained" onClick={updateUser} style={{ marginTop: 10 }}>Save</Button>
            <Button variant="outlined" onClick={() => navigate("/")} style={{ marginLeft: 10, marginTop: 10 }}>Cancel</Button>
        </Container>
    );
};

export default EditUserPage;

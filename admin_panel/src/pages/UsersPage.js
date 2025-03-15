import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken"); // Ensure the admin token is stored
            const response = await axios.get("http://localhost:5000/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const deleteUser = async (id) => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(`http://localhost:5000/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };
    
    const updateUserRole = async (id, newRole) => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.put(`http://localhost:5000/users/${id}`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };    

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <TextField
                                    select
                                    value={user.role}
                                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="organizer">Organizer</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                </TextField>
                            </TableCell>
                            <TableCell>
                                <Button onClick={() => navigate(`/edit/${user.id}`)}>Edit</Button>
                                <Button onClick={() => deleteUser(user.id)} color="error">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Button onClick={() => {
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminRole");
                    window.location.href = "/login";
                }}>
                    Logout
            </Button>
        </TableContainer>
    );
};

export default UsersPage;

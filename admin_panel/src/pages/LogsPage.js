import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Button, Typography } from "@mui/material";

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState([]);
    const [filters, setFilters] = useState({ userId: "", action: "", startDate: "", endDate: "" });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs();
        fetchUsers();
    }, [page]);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const query = new URLSearchParams(filters).toString();
            const response = await axios.get(`http://localhost:5000/users/logs?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLogs(response.data.logs);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("http://localhost:5000/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            processUserStats(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const processUserStats = (users) => {
        const roleCounts = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});
    
        const stats = Object.keys(roleCounts).map(role => ({
            name: role,
            value: roleCounts[role]
        }));
        setUserStats(stats);
    };

    return (
        <div>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>Recent User Actions</Typography>

            {/* Filters */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField select label="User" value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} fullWidth>
                    <MenuItem value="">All Users</MenuItem>
                    {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                    ))}
                </TextField>

                <TextField select label="Action Type" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} fullWidth>
                    <MenuItem value="">All Actions</MenuItem>
                    <MenuItem value="User Registered">User Registered</MenuItem>
                    <MenuItem value="Role changed">Role Changed</MenuItem>
                    <MenuItem value="User Deleted">User Deleted</MenuItem>
                </TextField>

                <TextField type="date" label="Start Date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
                <TextField type="date" label="End Date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />

                <Button variant="contained" onClick={fetchLogs}>Apply Filters</Button>
            </div>

            {/* Logs Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                            <TableCell><strong>Timestamp</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell>{log.User ? log.User.name : "Unknown"}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span style={{ margin: "0 10px" }}> Page {page} of {totalPages} </span>
                <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>

            {/* Download Logs as CSV */}
            <Button
                variant="contained"
                sx={{ marginTop: 2 }}
                onClick={() => {
                    const token = localStorage.getItem("adminToken");
                    window.open(`http://localhost:5000/users/logs/download?token=${token}`, "_blank");
                }}
            >
                Download Logs as CSV
            </Button>
        </div>
    );
};

export default LogsPage;

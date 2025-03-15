import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    TextField, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    
    const navigate = useNavigate();

    <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/logs")}
        sx={{ marginTop: 2 }}
    >
        View Logs
    </Button>

    //const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]; // Improved colors
    <PieChart width={300} height={300}>
        <Pie
            data={userStats}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, value }) => `${name} (${value})`} // Display name & count
        >
            {userStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Tooltip />
        <Legend />
    </PieChart>

    return (
        <div>
            <h2>Recent User Actions</h2>

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
                                <TableCell>User</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Timestamp</TableCell>
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
                <div style={{ marginTop: "20px" }}>
                    <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <span> Page {page} of {totalPages} </span>
                    <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
                <Button
                    variant="contained"
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
        
export default Dashboard;
        
// const [users, setUsers] = useState([]);
// const [userStats, setUserStats] = useState([]);
// const [logs, setLogs] = useState([]);
// const [filters, setFilters] = useState({ userId: "", action: "", startDate: "", endDate: "" });
// const [page, setPage] = useState(1);
// const [totalPages, setTotalPages] = useState(1);


// useEffect(() => {
//     fetchUsers();
//     fetchLogs();
// }, []);

// const fetchUsers = async () => {
//     try {
//         const token = localStorage.getItem("adminToken");
//         const response = await axios.get("http://localhost:5000/users", {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         setUsers(response.data);
//         processUserStats(response.data);
//     } catch (error) {
//         console.error("Error fetching users:", error);
//     }
// };

// const processUserStats = (users) => {
//     const roleCounts = users.reduce((acc, user) => {
//         acc[user.role] = (acc[user.role] || 0) + 1;
//         return acc;
//     }, {});

//     const stats = Object.keys(roleCounts).map(role => ({
//         name: role,
//         value: roleCounts[role]
//     }));
//     setUserStats(stats);
// };

// const fetchLogs = async () => {
//     try {
//         const token = localStorage.getItem("adminToken");
//         //const query = new URLSearchParams(filters).toString();
        
//         const response = await axios.get(`http://localhost:5000/users/logs?page=${page}`, {
//         //const response = await axios.get("http://localhost:5000/users/logs?${query}", {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         setLogs(response.data.logs);
//         setTotalPages(response.data.totalPages);
//     } catch (error) {
//         console.error("Error fetching logs:", error);
//     }
// };

        // <Grid container spacing={3} style={{ padding: 20 }}>
        //     <Grid item xs={12} sm={6}>
        //         <Card>
        //             <CardContent>
        //                 <Typography variant="h5">Total Users</Typography>
        //                 <Typography variant="h3">{users.length}</Typography>
        //             </CardContent>
        //         </Card>
        //     </Grid>
        //     <Grid item xs={12} sm={6}>
        //         <Card>
        //             <CardContent>
        //                 <Typography variant="h5">Users by Role</Typography>
        //                 <PieChart width={300} height={300}>
        //                     <Pie data={userStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
        //                         {userStats.map((entry, index) => (
        //                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        //                         ))}
        //                     </Pie>
        //                     <Tooltip />
        //                     <Legend />
        //                 </PieChart>
        //             </CardContent>
        //         </Card>
        //     </Grid>
        //     <Grid item xs={12}>
        //         <h2>Recent User Actions</h2>
        //         <TableContainer component={Paper}>
        //             <Table>
        //                 <TableHead>
        //                     <TableRow>
        //                         <TableCell>User</TableCell>
        //                         <TableCell>Action</TableCell>
        //                         <TableCell>Timestamp</TableCell>
        //                     </TableRow>
        //                 </TableHead>
        //                 <TableBody>
        //                     {logs.map((log, index) => (
        //                         <TableRow key={index}>
        //                             <TableCell>{log.User ? log.User.name : "Unknown"}</TableCell>
        //                             <TableCell>{log.action}</TableCell>
        //                             <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
        //                         </TableRow>
        //                     ))}
        //                 </TableBody>
        //             </Table>
        //         </TableContainer>
        //     </Grid>
        //         <div>
        //         <h2>Recent User Actions</h2>

        //         {/* Filters */}
        //         <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        //             <TextField select label="User" value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} fullWidth>
        //                 <MenuItem value="">All Users</MenuItem>
        //                 {users.map((user) => (
        //                     <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
        //                 ))}
        //             </TextField>

        //             <TextField select label="Action Type" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} fullWidth>
        //                 <MenuItem value="">All Actions</MenuItem>
        //                 <MenuItem value="User Registered">User Registered</MenuItem>
        //                 <MenuItem value="Role changed">Role Changed</MenuItem>
        //                 <MenuItem value="User Deleted">User Deleted</MenuItem>
        //             </TextField>

        //             <TextField type="date" label="Start Date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
        //             <TextField type="date" label="End Date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />

        //             <Button variant="contained" onClick={fetchLogs}>Apply Filters</Button>
        //         </div>

        //             {/* Logs Table */}
        //             <TableContainer component={Paper}>
        //                 <Table>
        //                     <TableHead>
        //                         <TableRow>
        //                             <TableCell>User</TableCell>
        //                             <TableCell>Action</TableCell>
        //                             <TableCell>Timestamp</TableCell>
        //                         </TableRow>
        //                     </TableHead>
        //                     <TableBody>
        //                         {logs.map((log, index) => (
        //                             <TableRow key={index}>
        //                                 <TableCell>{log.User ? log.User.name : "Unknown"}</TableCell>
        //                                 <TableCell>{log.action}</TableCell>
        //                                 <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
        //                             </TableRow>
        //                         ))}
        //                     </TableBody>
        //                 </Table>
        //             </TableContainer>
        //         </div>
        //     <Button
        //         variant="contained"
        //         onClick={() => {
        //             const token = localStorage.getItem("adminToken");
        //             window.open(`http://localhost:5000/users/logs/download?token=${token}`, "_blank");
        //         }}
        //     >
        //         Download Logs as CSV
        //     </Button>

        // </Grid>
        
//     );
// };

// export default Dashboard;

import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { Dashboard, People, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        navigate("/login");
    };

    return (
        <Drawer variant="permanent">
            <List>
                <ListItem button onClick={() => navigate("/")}>
                    <ListItemIcon><Dashboard /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button onClick={() => navigate("/users")}>
                    <ListItemIcon><People /></ListItemIcon>
                    <ListItemText primary="Manage Users" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><Logout /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;

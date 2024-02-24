// src/App.js
import React, { useState } from 'react';
import MainApp from './components/main_app';
import { Box, Button, Alert, TextField } from '@mui/material';
function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [auth, setAuth] = useState(false);
    const [status, setStatus] = useState('');



    const handleRegister = async () => {
        if (username == "") {
            setStatus("error");
            setMessage("Username is empty!");
            return;
        }
        if (password == "") {
            setStatus("error");
            setMessage("Password is empty!");
            return;
        }
        try {
            const response = await fetch('https://kdrn74-5000.csb.app/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            setMessage(data.message);
            setStatus(data.severity);
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    const handleLogin = async () => {
        if (username == "") {
            setStatus("error");
            setMessage("Username is empty!");
            return;
        }
        if (password == "") {
            setStatus("error");
            setMessage("Password is empty!");
            return;

        }
        try {
            const response = await fetch('https://kdrn74-5000.csb.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log(data);
            if (data.severity != "error") {
                setAuth(true);
            }
            setMessage(data.message);
            setStatus(data.severity);

        } catch (error) {
            console.error('Error during login:', error);
        }

    };

    const handleLogout = () => {
        setAuth(false);
        setStatus("");
        setMessage("");
        setUsername("");
        setPassword("");
    };
    return (
        <div className="App" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} >
            {auth == false ? (
                <div style={{ width: "350px" }}>
                    <h1>Login and Register</h1>
                    <div style={{ display: "flex", flexDirection: "column", marginBottom: "2rem" }}>
                        <TextField className='text-field' sx={{ marginBottom: "2rem" }} variant="outlined" label="User Name" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField className='text-field' sx={{ marginBottom: "2rem" }} variant="outlined" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                            <Button sx={{ width: "40%" }} variant="contained" onClick={handleRegister}>Register</Button>
                            <Button sx={{ width: "40%" }} variant="contained" onClick={handleLogin}>Login</Button>
                        </div>
                    </div>

                    {message != "" ? (
                        <div>
                            <Alert severity={status}>{message}</Alert>
                        </div>
                    ) : <></>}
                </div>) : (<MainApp handleLogout={handleLogout} />)
            }
        </div >
    );
};

export default App;

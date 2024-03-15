// src/App.js
import React, { useState } from 'react';
import MainApp from './components/main_app';
import { Box, Button, Alert, TextField, CardMedia } from '@mui/material';
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
            const response = await fetch('https://sturdy-spoon-qgpxggv47rv24pvp-5000.app.github.dev/register', {
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
            const response = await fetch('https://sturdy-spoon-qgpxggv47rv24pvp-5000.app.github.dev/login', {
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
        <div className="App" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

        }} >
            {auth == false ? (
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                    justifyContent: "center",
                    width: "100%",
                    height: "100vh",
                    backgroundImage: "url(./texture/background.jpg)",
                    backgroundPosition: "center"
                    // backgroundColor: "lightblue",
                    // overflowY: "none",
                }}>
                    {/* <CardMedia component="img"
                        sx={{
                            width: "100%",
                            overflowY: "hidden",
                            borderTopLeftRadius: "10px",
                            borderBottomLeftRadius: "10px",
                            position: "absolute",
                            zIndex: 1,
                        }}
                        image=
                        alt="Sunrise aircraft window" /> */}
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "start",
                        justifyContent: "center",
                        width: "50%",
                        height: "505px",
                        marginTop: "5%",
                        borderRadius: "10px",
                        // backgroundColor: "white",
                        background: "rgba( 157, 138, 138, 0.25 );",
                        boxShadow: "0 8px 32px 0 grey",
                        backdropFilter: "blur( 4px )",
                        borderRadius: "10px",
                        WebkitBackdropFilter: "blur(4px)",
                        border: "1px solid rgba( 255, 255, 255, 0.18 )",
                        zIndex: 2
                    }}>

                        <CardMedia component="img"
                            sx={{
                                width: "40%",
                                borderTopLeftRadius: "10px",
                                borderBottomLeftRadius: "10px",
                                userSelect: "none"
                            }}
                            image="./texture/1c104cf6ebb8f8c9c2b33243556ba98e.jpg"
                            alt="Sunrise aircraft window" />
                        <div style={{
                            width: "60%",
                            height: "70vh",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>

                            <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: "2rem" }}>
                                <h1 style={{ userSelect: "none" }}>Login and Register</h1>
                                <TextField className='text-field' sx={{ marginBottom: "2rem" }} variant="outlined" label="User Name" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                                <TextField className='text-field' sx={{ marginBottom: "2rem" }} variant="outlined" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                                    <Button sx={{ width: "40%" }} variant="contained" onClick={handleRegister}>Register</Button>
                                    <Button sx={{ width: "40%" }} variant="contained" onClick={handleLogin}>Login</Button>
                                </div>
                            </div>

                            {message != "" ? (
                                <div>
                                    <Alert sx={{ width: "100%" }} severity={status}>{message}</Alert>
                                </div>
                            ) : <></>}
                        </div>
                    </Box>
                </Box>
            )
                : (<MainApp handleLogout={handleLogout} />)
            }
        </div >
    );
};

export default App;

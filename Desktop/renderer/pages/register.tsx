import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {app, database} from '../firebase/firebase';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "firebase/auth";
import Router from 'next/router';
import { collection, doc, setDoc } from 'firebase/firestore';
import { InputLabel, MenuItem, Select } from '@mui/material';
import Head from 'next/head';

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

function insertRequest(name, email, password, role){
    const userRef = doc(collection(database, "requests"));
    const userData = {
      name: name,
      email: email,
      password: password,
      role : role
    };
    setDoc(userRef, userData);
} 

export default function SignUp() {
    const [error, setError] = useState(null);

    const [selectedOption, setSelectedOption] = useState('Select Role');

    const handleSelectChange = (event) => {
      setSelectedOption(event.target.value);
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = data.get('name').toString();
        const email = data.get('email').toString();
        const password = data.get('password').toString();
        const role = data.get('role').toString();
        
        // Perform form validation
        if (!email || !password || !name || !role || role === "Select Role") {
          setError('Please fill all the fields');
          return;
        }else if(!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email.trim())){
            setError("Email must be a valid email address");
            return;
        }else if(name.trim().length <= 3){
            setError("Name length must be more than 3 characters");
            return;
        }else if(password.trim().length <= 6){
            setError("Password length must be more than 6 characters");
            return;
        }

        setError("");

        insertRequest(name, email, password, role);
        Router.push("login");
};


  return (
    <React.Fragment>
      <Head>
        <title>Register Page</title>
      </Head>
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" color="primary">
            silVoam Hospital
          </Typography>
          <Typography component="h6" variant="h6" color="secondary">
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoComplete="name"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />

          <Select
          labelId="role"
          id="role"
          name="role"
          placeholder='User Role'
          required
          value={selectedOption}
          onChange={handleSelectChange}
          label="Select Role"
          sx={{
            width: "100%",
            mt:2,
          }}
        >
          <MenuItem value="Select Role" selected>Select Role</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
          <MenuItem value="nurse">Nurse</MenuItem>
          <MenuItem value="pharmacist">Pharmacist</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="ambulancedriver">Ambulance Driver</MenuItem>
          <MenuItem value="kitchenstaff">Kitchen Staff</MenuItem>
          <MenuItem value="cleaningservice">Cleaning Service</MenuItem>
        </Select>

            {error && (
                <Typography variant="body2" color="error" align="center">
                {error}
                </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
            >
              Sign Up
            </Button>
            <Link href="/login">
                <Button
                fullWidth
                variant="contained"
                >
                Login
                </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
    </React.Fragment>
  );
}
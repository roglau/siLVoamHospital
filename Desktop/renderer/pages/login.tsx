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
import {app, auth, database} from '../firebase/firebase';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "firebase/auth";
import Router from 'next/router';
import { useAuth } from '../utils/AuthContext';
import { UserUtils } from '../utils/user_manager';
import Head from 'next/head';

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignIn() {
    const [error, setError] = useState(null);
    const {login } = useAuth();
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email').toString();
        const password = data.get('password').toString();
    
        // Perform form validation
        if (!email || !password) {
          setError('Please enter both email and password.');
          return;
        }

        setError("")

        signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // console.log(auth.currentUser.uid);
            const u = await UserUtils.getUser(auth.currentUser.uid);
            // const user: User = userCredential.user;
            const user = {id : u.uid, email : u.email, password : u.password, name : u.name, role: u.role, shiftId : u.shiftId}
            // console.log(user);
            login(user);
            localStorage.setItem('role', user.role);
            localStorage.setItem('id', user.id);
            Router.push('/home');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            setError(errorMessage);
        });
    
};


  return (
    <React.Fragment>
      <Head>
        <title>Login Page</title>
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
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
              Sign in
            </Button>
            <Link href="/register">
                <Button
                fullWidth
                variant="contained"
                >
                Register
                </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  </React.Fragment>
  );
}
//Registration

import { Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material'
import React, { useState, useContext } from 'react'
import { AuthContext } from '../hooks/useAuth';
import { LoginType } from '../types';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export const Login = () => {
    const { Login } = useContext(AuthContext);
    const [email, setEmail] = useState<string>('');
    const [pw, setPw] = useState<string>('');
    const emailValidationList = ['@', '.org'];
    const arrayTest = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];
    const [validationMessage, setValidationMessage] = useState<string>('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleValidation = async () => {
        let isEmailValid = false;
        let isPwValid = false;
        let point = 0;

        setValidationMessage('');
        //npm i check-password-strength
        if (email !== '' && emailValidationList.every(value => email.includes(value.toLowerCase())))
            isEmailValid = true;

        if (pw.length >= 8) {
            arrayTest.forEach((item) => {
                if (item.test(pw)) {
                    point += 1;
                }
            });
        }
        isPwValid = point === 4 ? true : false;
        if (!isEmailValid)
            setValidationMessage("Enter a valid email");
        else if (!isPwValid)
            setValidationMessage("Password needs to be a combination: \n one uppecase & lowercase letters, one number, length of 8 or more");

        console.log(`Email valid:${isEmailValid} Password valid:${isPwValid} Point strength:${point}`)

        if (isEmailValid && isPwValid) {
            let credentials: LoginType = {
                email: email,
                password: pw,
                remember_me: false
            }
            console.log("calling useAuth.login");
            const routeToNav = await Login(credentials);
            console.log(`navigating to: ${routeToNav}`);
            routeToNav ? navigate(`../${routeToNav}`) : setValidationMessage('Invalid Credentials');
        }
    }

    const doValidation = (_event: React.MouseEvent<HTMLElement>) => {
        handleValidation();
    }

    const doKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleValidation();
        }
    }

    return (
        <>
            <Stack direction={'column'} spacing={2} width={'250px'} margin={5}>
                <TextField label='Email' onChange={(e) => setEmail(e.target.value)} error={!email}
                    helperText={''} />

                <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={
                                        showPassword ? 'hide the password' : 'display the password'
                                    }
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        onChange={(e) => setPw(e.target.value)}
                        onKeyDown={doKeyPress}

                        label="Password"
                    />
                </FormControl>

                <Button
                    variant='contained'
                    color='primary'
                    onClick={doValidation}
                >
                    Login
                </Button>
            </Stack>
            {/* TODO: put line break */}
            <Typography variant="subtitle1" color='error' margin={5}>{validationMessage}</Typography>
        </>

    )
}

export default Login
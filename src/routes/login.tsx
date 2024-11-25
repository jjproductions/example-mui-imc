//Registration

import { Button, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import React, { useState, useContext } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../hooks/useAuth';
import { LoginType } from '../types';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const { Login } = useContext(AuthContext);
    const [pwVisible, setPwVisible] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [pw, setPw] = useState<string>('');
    const emailValidationList = ['@', '.org'];
    const arrayTest = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];
    const [validationMessage, setValidationMessage] = useState<string>('');
    const navigate = useNavigate();

    const handlePwIcon = () => {
        setPwVisible(!pwVisible);
    }
    const doValidation = async (_event: React.MouseEvent<HTMLElement>) => {
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
            const test = await Login(credentials);
            console.log({test});
            test ? navigate(`../${test}`) : setValidationMessage('Invalid Credentials');
        }
    }

    return (
        <>
            <Stack direction={'column'} spacing={2} width={'250px'} margin={5}>
                <TextField label='Email' onChange={(e) => setEmail(e.target.value)} error={!email}
                    helperText={''} />
                <TextField label='Password' type='password' required helperText='Do not share your password'
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position='end'>
                                {pwVisible ? <VisibilityIcon fontSize='small' onClick={handlePwIcon} /> : <VisibilityOffIcon fontSize='small' onClick={handlePwIcon} />}
                            </InputAdornment>
                        }
                    }}
                    onChange={(e) => setPw(e.target.value)} />
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
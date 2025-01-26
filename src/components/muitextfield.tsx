import { Stack, TextField, InputAdornment } from "@mui/material"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from "react";

export const MuiTextField = () => {
    const [value, setValue] = useState<string>("");
    const handlePwIcon = () => {
        //do some stuff
    }
    return (
        <Stack spacing={4}>
            <Stack direction={'row'} spacing={2}>
                <TextField label='Name' variant='outlined' />
                <TextField label='Name' variant='filled' />
                <TextField label='Name' variant='standard' />
            </Stack>
            <Stack direction={'row'} spacing={2}>
                <TextField label='Small Secondary' size='small' color='secondary' />
            </Stack>
            <Stack direction={'row'} spacing={2}>
                <TextField label='Form Input' value={value} onChange={(e) => setValue(e.target.value)} error={!value}
                    helperText={!value ? 'Required' : 'Enter a value'} />
                <TextField label='Password' type='password' required helperText='Do not share your password'
                    slotProps={{
                        input: { endAdornment: <InputAdornment position='end'><VisibilityIcon fontSize='small' onClick={handlePwIcon} /></InputAdornment> }
                    }} />
                <TextField
                    label=' '
                    //InputProps={{ readOnly: true }}
                    variant="standard"
                    slotProps={{
                        input: {
                            disableUnderline: true,
                        },
                    }}
                />
                <TextField label='Disabled' disabled />
            </Stack>
            <Stack direction={'row'} spacing={2}>
                <TextField label='Amount' InputProps={{
                    startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }} />
                <TextField label='Weight' InputProps={{
                    endAdornment: <InputAdornment position='end'>lbs</InputAdornment>
                }} />
            </Stack>
        </Stack>
    )
}
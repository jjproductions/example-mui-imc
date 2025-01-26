import React from 'react';
import TextField from '@mui/material/TextField';

const MuiTextField: React.FC = () => {
    return (
        <div>
            <TextField
                label="Example TextField"
                variant="outlined"
                fullWidth
            />
        </div>
    );
};

export default MuiTextField;
import { Box, TextField, MenuItem, SelectChangeEvent, OutlinedInput, Theme, useTheme, Select } from "@mui/material"
import { count } from "console";
import { useState } from "react"
import Chip from '@mui/material/Chip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const names = [
    'US',
    'IN',
    'FR'
  ];

  function getStyles(name: string, country: readonly string[], theme: Theme) {
    return {
      fontWeight: country.includes(name)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
  }
  
export const MuiSelect = () => {
    const [country, setCountry] = useState<string>("");
    const [countries, setCountries] = useState<string[]>([]);
    const theme = useTheme();


    const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCountry(event.target.value as string)
        const value = event.target.value
        console.log({ value })
    }
    // const handleCountriesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const values = event.target.value
    //     setCountries(typeof values === 'string' ? values.split(',') : values)
    //     console.log({values})
    // }

    const handleCountriesChange = (event: SelectChangeEvent<typeof countries>) => {
        const {
            target: { value },
        } = event;
        setCountries(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <>
            <Box width={'50'}>
                <TextField label='Select Country' select value={country} onChange={handleCountryChange} 
                    fullWidth
                    size='small'
                    color='secondary'
                    helperText='Please select a country'    
                >
                    <MenuItem value='US'>USA</MenuItem>
                    <MenuItem value='IN'>India</MenuItem>
                    <MenuItem value='FR'>France</MenuItem>
                </TextField>
            </Box>

            <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={countries}
                onChange={handleCountriesChange}
                input={<OutlinedInput id="select-multiple-chip" label="Countries" />}
                fullWidth
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                            <Chip key={value} label={value} />
                        ))}
                    </Box>
                )}
                MenuProps={MenuProps}
            >
                {names.map((name) => (
                    <MenuItem
                        key={name}
                        value={name}
                        style={getStyles(name, countries, theme)}
                    >
                        {name}
                    </MenuItem>
                ))}
            </Select>
        </>
    )
}
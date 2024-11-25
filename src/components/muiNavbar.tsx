import { AppBar, Toolbar, IconButton, Typography, Stack, Button } from "@mui/material"
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon'

export const MuiNavBar = () => {
    return (
    <AppBar position='static'>
        <Toolbar>
            <IconButton size='large' edge='start' color='inherit' aria-label='logo'>
                <CatchingPokemonIcon />
            </IconButton>
            <Typography variant='h6' component={'div'} 
                sx={{
                    flexGrow: 1,
                    fontWeight: '800'
                }}
                >
                IMC
            </Typography>
            <Stack direction={'row'} spacing={2}>
                <Button color='inherit'>Statement</Button>
                <Button color='inherit'>Expenses</Button>
                <Button color='inherit'>Reports</Button>
                <Button color='inherit'>Login</Button>
            </Stack>
        </Toolbar>
    </AppBar>
    )
}
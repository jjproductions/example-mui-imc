import { Box, Drawer, Typography, IconButton, Menu, Stack, Button, AppBar, Toolbar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon'
import { useContext, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AuthContext } from '../hooks/useAuth'


export const MuiDrawer = () => {
    const { Logout, userInfo } = useContext(AuthContext);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    //const [showAdmin, setShowAdmin] = useState<boolean>(false);
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('isAdmin') === 'true' ? true : false;
    const token = localStorage.getItem('token');
    

    const goTo = (page: string) => {
        setIsDrawerOpen(false);
        if (page === 'logout')
            Logout();
        else
            navigate(page);
    }

    console.log(`Drawer: admin: ${isAdmin} :: token: ${token}`);
    console.log(`userinfo: ${JSON.stringify(userInfo)}`);

    return (
        <>
            <AppBar position='static'>
                <Toolbar>
                    {/* <IconButton size='large' edge='start' color='inherit' aria-label='logo'>
                    <CatchingPokemonIcon />
                </IconButton> */}
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        aria-label='logo'
                        onClick={() => setIsDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' component={'div'}
                        sx={{
                            flexGrow: 1,
                            fontWeight: '800'
                        }}
                    >
                        IMC
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer anchor='left' open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <Box p={2} width={'150px'} textAlign={'center'} role={'presentation'}>
                    <Typography variant='h6' component={'div'}>
                        <Stack direction={'column'} spacing={2}>
                            {token ? (
                                <>
                                    {isAdmin &&
                                        (<Button color='inherit' onClick={() => goTo('statements')}>Statement</Button>)
                                    }
                                    <Button color='inherit' onClick={() => goTo('expenses')}>Expenses</Button>
                                    <Button color='inherit' onClick={() => goTo('reports')}>Reports</Button>
                                    <Button color='inherit' onClick={() => goTo('logout')}>Logout</Button>
                                </>
                            ) : (
                                <Button color='inherit' onClick={() => goTo('login')}>Login</Button>
                            )}
                        </Stack>
                    </Typography>
                </Box>
            </Drawer>
            <div id='detail'>
                <Outlet />
            </div>
        </>

    )
}
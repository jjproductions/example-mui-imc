import { Stack, Button, IconButton, ButtonGroup, ToggleButton, ToggleButtonGroup } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import FormatBoldIcon from "@mui/icons-material/FormatBold"
import FormatItalicIcon from "@mui/icons-material/FormatItalic"
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined"
import { useState } from "react"
import { format } from "path"

export const MuiButton = () => {
    const [formats, setFormats] = useState<string[]>([]);
    const [format, setFormat] = useState<string | null>(null);
    
    const handleFormatChange = (_event: React.MouseEvent<HTMLElement>, updatedFormat: string | null) => {
        setFormat(updatedFormat);
        console.log({updatedFormat});
    }
    const handleMultiFormatChange = (_event: React.MouseEvent<HTMLElement>, updatedFormats: string[]) => {
        setFormats(updatedFormats);
        console.log({updatedFormats});
    }
    return (
        <Stack spacing={4}>
            <Stack spacing={2} direction={"row"}>
                <Button variant="text" href="https://www.google.com">
                    Text
                </Button>
                <Button variant="contained">Contained</Button>
                <Button variant="outlined">Outlined</Button>
            </Stack>
            <Stack spacing={2} direction={"row"}>
                <Button variant="contained" color="primary">
                    Primary
                </Button>
                <Button variant="contained" color="secondary">
                    Secondary
                </Button>
                <Button variant="contained" color="error">
                    Error
                </Button>
                <Button variant="contained" color="warning">
                    Warning
                </Button>
                <Button variant="contained" color="info">
                    Info
                </Button>
                <Button variant="contained" color="success">
                    Success
                </Button>
            </Stack>
            <Stack display={"block"} spacing={2} direction={"row"}>
                <Button variant="contained" size="small">
                    Small
                </Button>
                <Button variant="contained" size="medium">
                    Medium
                </Button>
                <Button variant="contained" size="large">
                    Large
                </Button>
            </Stack>
            <Stack spacing={2} direction={"row"}>
                <Button variant="contained" startIcon={<SendIcon />} disableRipple onClick={() => alert('Clicked')}>
                    Send
                </Button>
                <Button variant="contained" endIcon={<SendIcon />} disableElevation>
                    Send
                </Button>
                <IconButton aria-label='send' color='success' size='small'>
                    <SendIcon />
                </IconButton>
            </Stack>
            <Stack direction={'row'}>
                <ButtonGroup variant='contained' orientation='vertical' size='small' color='secondary' aria-label='alignment button group'>
                    <Button onClick={() => alert('Left Clicked')}>Left</Button>
                    <Button>Center</Button>
                    <Button>Right</Button>
                </ButtonGroup>
            </Stack>
            <Stack direction={'row'}>
                <ToggleButtonGroup aria-label='Text formatting' value={format} onChange={handleFormatChange} size='small' color='success' orientation='vertical'
                        exclusive>
                    <ToggleButton value={'bold'} aria-label='bold'><FormatBoldIcon /></ToggleButton>
                    <ToggleButton value={'italic'} aria-label="italic"><FormatItalicIcon /></ToggleButton>
                    <ToggleButton value={'underline'} aria-label="underline"><FormatUnderlinedIcon /></ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            <Stack direction={'row'}>
                <ToggleButtonGroup aria-label='Multi text selection formatting' value={formats} onChange={handleMultiFormatChange} size='small' color='success' orientation='horizontal'>
                    <ToggleButton value={'bold'} aria-label='bold'><FormatBoldIcon /></ToggleButton>
                    <ToggleButton value={'italic'} aria-label="italic"><FormatItalicIcon /></ToggleButton>
                    <ToggleButton value={'underline'} aria-label="underline"><FormatUnderlinedIcon /></ToggleButton>
                </ToggleButtonGroup>
            </Stack>
        </Stack>
    );
};

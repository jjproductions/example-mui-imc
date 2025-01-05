import { Box, Button, ButtonGroup, Divider, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from "react-router-dom";

const ReportHeader = () => {
    const { reportItems, setActiveReportItem, ReportSetUp } = useAppContext();
    const [reportAmount, setReportAmount] = useState<number>(0);
    const [reportCardNum, setReportCardNum] = useState<number>(0);
    const navigate = useNavigate();
    let tempAmount: number = 0;
    const myDate = new Date;

    useEffect(() => {
        tempAmount = 0;
        reportItems?.map((item) => {
            tempAmount += item.amount;
        })
        console.log(`tempAmount: ${tempAmount}`);
        setReportAmount(tempAmount);
        reportItems ? setReportCardNum(reportItems[0]?.cardNumber) : setReportCardNum(0);

    }, [reportItems])


    const handleCancel = () => {
        ReportSetUp(undefined);
        setActiveReportItem(undefined);
        navigate(`../expenses`)
    }

    return (
        <>
            <Stack direction={'row'} >
                <Typography variant='subtitle1' marginLeft={15}>{myDate.toDateString()}</Typography>
                <Typography
                    variant='subtitle1'
                    marginLeft={5}
                    textAlign={'center'}
                >
                    Report Name</Typography>
                <Typography variant='subtitle1' marginLeft={15}>${reportAmount}</Typography>
                <Box sx={{
                    marginLeft: "100px"
                }}>
                    <Stack display={"block"} spacing={2} direction={"row"}>
                        <Button variant="contained">Save</Button>
                        <Button variant="outlined">Delete</Button>
                        <Button
                            variant='text'
                            size='small'
                            onClick={handleCancel}
                        >
                            Cancel</Button>
                    </Stack>
                </Box>
            </Stack>
            <Stack direction={'row'} marginTop={0} marginBottom={1}>
                <Typography variant='subtitle1' marginLeft={20}>xxx{reportCardNum}</Typography>
            </Stack>
        </>
    )
}

export default ReportHeader
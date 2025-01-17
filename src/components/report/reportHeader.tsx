import { Box, Button, ButtonGroup, Divider, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { api_domain } from '../../utilities';
import axios from 'axios';
import { Expense, ReportHeaderInfo, ReportInfo } from '../../types';
import { report } from 'process';

const ReportHeader = () => {
    const { reportItems, setReportExpenses, reportExpenses, editInProgress, setEditInProgress } = useAppContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [reportInfo, setReportInfo] = useState<ReportInfo[] | undefined>();
    const [selectedValue, setSelectedValue] = useState<string | undefined>("-1");
    const navigate = useNavigate();
    let tempAmount: number = 0;
    const myDate = new Date;
    const api_url = `${api_domain}/reports?rptId=`;
    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
    };
    let rptCount: number = 0;
    const initRptHeaderInfo: ReportHeaderInfo = {
        amount: 0,
        id: -1,
        name: "New Report",
        cardNumber: 0,
        canEdit: false
    }
    const [reportHeaderData, setReportHeaderData] = useState<ReportHeaderInfo>(initRptHeaderInfo);

    //Sets the Header info once per Report selection
    useEffect(() => {
        if (reportExpenses != undefined) {
            console.log(`Setting Header Info: ${JSON.stringify(reportExpenses)}`);
            tempAmount = 0;
            reportExpenses?.map((item) => {
                tempAmount += item.amount;
            });
            setReportHeaderData((currState: ReportHeaderInfo) => ({
                ...currState,
                amount: tempAmount,
                cardNumber: reportExpenses[0] != undefined ? reportExpenses[0].cardNumber : 0,
                canEdit: true
            }));
            console.log(`Setting Header Info: ${JSON.stringify(reportHeaderData)}`);
        }
        else {
            console.log("resetting Header Info");
            setReportHeaderData(initRptHeaderInfo);
        }
    }, [reportExpenses])


    //Initial call to populate the Reports dropdown
    useEffect(() => {
        if (reportExpenses !== undefined) {
            const getOpenReports = async () => {
                try {
                    console.log(`Calling Api: ${api_url}${reportExpenses[0].cardNumber}`);
                    const response = await axios.get(api_url + reportExpenses[0].cardNumber, {
                        headers: userHeaders
                    });
                    console.log(`Reports call returned: ${JSON.stringify(response.data.reports)}`);
                    setReportInfo(response.data.reports);
                }
                catch (error) {
                    console.log("Get Open Reports Error");
                }
                finally {
                    setLoading(true);
                }
            }
            getOpenReports();
        }
    }, []);

    const handleUpdatingViews = (data: Expense[] | undefined) => {
        setReportExpenses(data);
        setEditInProgress(false);

    }

    const handleSwitchReports = (event: SelectChangeEvent<string>) => {
        if (selectedValue === "-1" || editInProgress) {
            console.log(`Switching Reports: ${selectedValue} : ${editInProgress}`);
            const userConfirmed = window.confirm("Are you sure you want to switch reports?  You will lose any unsaved changes.");
            if (!userConfirmed) {
                setSelectedValue(selectedValue);
                return;
            }
        }

        setSelectedValue(event.target.value);
        console.log(`event ID: ${parseInt(event.target.value)} : ${JSON.stringify(selectedValue)} : ${JSON.stringify(editInProgress)}`);
        setReportHeaderData((currState: ReportHeaderInfo) => ({
            ...currState,
            canEdit: reportInfo && reportInfo[parseInt(event.target.value)]?.status === "SUBMITTED" ? false : true
        }));
        //use report ID to filter reportExpenses and call ReportSetup
        if (event.target.value == "-1") {
            handleCancel(false);
        }
        console.log(`Report Items: ${JSON.stringify(reportItems)}`);
        const selectedReport: Expense[] | undefined = reportItems?.filter((rpt) => rpt.reportID === parseInt(event.target.value));
        console.log(`Selected Report: ${JSON.stringify(selectedReport)}`);
        if (selectedReport != undefined && selectedReport.length > 0)
            handleUpdatingViews(selectedReport)
        else
            console.log(`handleSwitchReports returned empty data: ${JSON.stringify(selectedReport)}`);
    }


    const handleButtonClicks = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        console.log(`handleButtonClicks: ${event.currentTarget.textContent}`);
        switch (event.currentTarget.textContent) {
            case "Cancel":
                handleCancel();
                break;
            case "Delete":
                handleDelete();
                break;
            case "Save":
                handleSave();
                break;
        }
    }

    const handleCancel = (doNavigate: boolean = true): void => {
        const userConfirmed = doNavigate ? window.confirm("Are you sure you want to cancel?  You will lose any unsaved changes.") : false;
        if (userConfirmed || !doNavigate) {
            handleUpdatingViews(undefined);
            if (doNavigate) {
                console.log(`handleCancel: ${doNavigate}`);
                navigate(`../expenses`)
            }
        }
    }

    const handleDelete = () => {
        const userConfirmed = window.confirm("Are you sure you want to delete this report?");
        if (userConfirmed) {
            // Proceed with delete logic
            console.log("Report deleted");
            setEditInProgress(false);
            // alert deleted notification
            // navigate to expenses
            // Add your delete logic here
        } else {
            console.log("Delete action cancelled");

        }
    }

    const handleSave = () => {
        setEditInProgress(false);
        //Report saved alert
    }


    const createReportDropDown = () => {
        const pendingReports: ReportInfo[] | undefined = reportInfo?.filter((rpt) =>
            rpt.status === "PENDING"
        );

        const returnedReports: ReportInfo[] | undefined = reportInfo?.filter((rpt) =>
            rpt.status === "RETURNED"
        )
        // console.log(`Report Info: ${JSON.stringify(reportInfo)}`);
        console.log(`Returned Reports: ${JSON.stringify(returnedReports)}`);
        console.log(`Pending Reports: ${JSON.stringify(pendingReports)}`);
        return (
            <>
                {returnedReports ? (
                    <>
                        <optgroup label="Returned">
                            {returnedReports.map((rpt) => (
                                <option key={rpt.id} value={rpt.id}>{rpt.name}</option>
                            ))}
                        </optgroup>
                    </>
                ) : <></>}

                {pendingReports ? (
                    <optgroup label="Pending">
                        {pendingReports.map((rpt) => (
                            <option key={rpt.id} value={rpt.id}>{rpt.name}</option>
                        ))
                        }
                    </optgroup>
                ) : <></>
                }
            </>
        )
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
                    {reportHeaderData.name}</Typography>
                <Typography variant='subtitle1' marginLeft={15}>${reportHeaderData.amount.toFixed(2)}</Typography>
                <Box sx={{
                    marginLeft: "100px"
                }}>
                    <Stack display={"block"} spacing={2} direction={"row"}>
                        <Button
                            variant="contained"
                            onClick={handleButtonClicks}
                            disabled={!reportHeaderData.canEdit}
                        >
                            Save</Button>
                        <Button
                            variant="outlined"
                            onClick={handleButtonClicks}
                            disabled={!reportHeaderData.canEdit}
                        >
                            Delete</Button>
                        <Button
                            variant='text'
                            size='small'
                            onClick={handleButtonClicks}
                        >
                            Cancel</Button>
                    </Stack>
                </Box>
            </Stack>
            <Stack direction={'row'} marginTop={0} marginBottom={1}>
                <Typography variant='subtitle1' marginLeft={20}>xxx{reportHeaderData.cardNumber}</Typography>
                {loading ? (
                    reportInfo?.length ? (
                        <FormControl sx={{
                            marginTop: 2,
                            marginLeft: 70,
                            minWidth: 120
                        }}>
                            <InputLabel htmlFor="grouped-native-select">Reports</InputLabel>
                            <Select
                                native defaultValue=""
                                id="grouped-native-select"
                                label="Reports"
                                value={selectedValue}
                                onChange={handleSwitchReports}
                            >
                                <option aria-label="None" value="-1" key={-1}>New Report</option>
                                {createReportDropDown()};
                            </Select>
                        </FormControl>
                    ) : <></>
                ) : (
                    <Typography variant='subtitle1' marginLeft={70}>Loading...</Typography>
                )}


            </Stack>
        </>
    )
}

export default ReportHeader
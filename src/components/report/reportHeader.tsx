import { Box, Button, ButtonGroup, Divider, Stack, TextField, Typography } from '@mui/material'
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
import { Expense, ReportHeaderInfo, ReportInfo, ReportUpdate, StatementUpdate } from '../../types';


const ReportHeader: React.FC<ReportHeaderInfo> = ({ amount, cardNumber, editInProgress }) => {
    const { newReportItems, currReportExpenses, setCurrReportExpenses } = useAppContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [reportInfo, setReportInfo] = useState<ReportInfo[] | undefined>(); //used for report details
    const [selectedValue, setSelectedValue] = useState<string | undefined>("-1"); //used for report selection
    const [editInProgressFlag, setEditInProgressFlag] = useState<boolean>(editInProgress); //used to signal if edits are in progress
    const initialReportName: string = "New Report"; //used for New Report Dropdown name
    const [newReportName, setNewReportName] = useState<string>(""); //used only for new report name
    const navigate = useNavigate();
    const myDate = new Date;
    const api_url = `${api_domain}/reports`;
    const api_url_statements_report = `${api_domain}/statements/report`;
    const api_url_statements = `${api_domain}/statements`;
    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
    };
    // let editInProgressFlag: boolean = editInProgress;
    const initRptHeaderInfo: ReportHeaderInfo = {
        //amount: amount,
        id: -1,
        name: "",
        cardNumber: amount,
        canEdit: false,
        editInProgress: editInProgressFlag
    }
    //may not need this
    const [reportHeaderData, setReportHeaderData] = useState<ReportHeaderInfo>(initRptHeaderInfo); //used for report header info

    //Sets the Header info once per Report selection
    useEffect(() => {
        if (cardNumber !== 0) {
            console.log(`Setting Header Info:newreportItems ${JSON.stringify(newReportItems)}`);
            setReportHeaderData((currState: ReportHeaderInfo) => ({
                ...currState,
                canEdit: true //Need to revisit this for Submitted Reports
            }));
            console.log(`Setting Header Info: ${JSON.stringify(reportHeaderData)}`);
        }
        else {
            console.log("resetting Header Info");
            setReportHeaderData(initRptHeaderInfo);
        }
    }, [amount])


    const getOpenReports = async (rptId: number | undefined) => {
        try {
            setLoading(true);
            console.log(`Calling Api: ${api_url}?id=${cardNumber}`);
            const response = await axios.get(api_url + "?id=" + cardNumber, {
                headers: userHeaders
            });
            console.log(`Reports call returned: ${JSON.stringify(response.data.reports)}`);
            setReportInfo(response.data.reports);
            rptId && setSelectedValue(rptId?.toString());
        }
        catch (error) {
            console.log("Get Open Reports Error");
        }
        finally {
            setLoading(false);
        }
    }


    //Initial call to populate the Reports dropdown
    useEffect(() => {
        getOpenReports(undefined);
    }, []);

    useEffect(() => {
        setEditInProgressFlag(editInProgress);
        console.log(`ReportHeader:EditInProgressFlag: ${editInProgressFlag}`);
    }, [editInProgress]);

    //Get statements for the selected Report
    const GetSelectedReportInfo = async (reportID: number) => {
        try {
            setLoading(true);
            console.log(`Calling Api: ${api_url_statements_report}?id=${reportID}`);
            const response = await axios.get(api_url_statements_report + "?id=" + reportID, {
                headers: userHeaders
            });
            console.log(`GetSelectedReportInfo call returned: ${JSON.stringify(response.data.expenses)}`);
            setCurrReportExpenses(response.data.expenses);
        }
        catch (error) {
            console.log("GetSelectedReportInfo Error");
        }
        finally {
            setLoading(false);
        }
    }

    const handleUpdatingViews = (data: Expense[] | undefined) => {
        setEditInProgressFlag(false);
        console.log(`handleUpdatingViews:editInProgressFlag ${JSON.stringify(editInProgressFlag)}`);

    }

    const handleSwitchReports = (event: SelectChangeEvent<string>) => {
        console.log(`Switching Reports:editInProgressFlag ${selectedValue} : ${editInProgressFlag}`);
        var index = (event.target as HTMLSelectElement).selectedIndex;


        if (selectedValue === "-1" || editInProgressFlag) {
            const userConfirmed = window.confirm("Are you sure you want to switch reports?  You will lose any unsaved changes.");
            if (!userConfirmed) {
                setSelectedValue(selectedValue);
                return;
            }
        }

        if (event.target.value === "-1") {
            handleUpdatingViews(undefined);
            navigate(`../expenses`);
            return;
        }
        else setEditInProgressFlag(false);

        GetSelectedReportInfo(parseInt(event.target.value));
        setSelectedValue(event.target.value);
        console.log(`event ID: ${parseInt(event.target.value)} : ${JSON.stringify(selectedValue)} : ${JSON.stringify(editInProgressFlag)}`);
        setReportHeaderData((currState: ReportHeaderInfo) => ({
            ...currState,
            canEdit: reportInfo && reportInfo[parseInt(event.target.value)]?.status === "SUBMITTED" ? false : true,
            name: (event.target as HTMLSelectElement)[index].innerText
        }));



        //use report ID to and call the API to get the report details***
        // console.log(`Report Items: ${JSON.stringify(newReportItems)} : current items - ${JSON.stringify(currReportExpenses)}`);
        // const selectedReport: Expense[] | undefined = newReportItems?.filter((rpt) => rpt.reportID === parseInt(event.target.value));
        // console.log(`Selected Report: ${JSON.stringify(selectedReport)}`);
        // if (selectedReport !== undefined && selectedReport.length > 0)
        //     handleUpdatingViews(selectedReport)
        // else
        //     console.log(`handleSwitchReports returned empty data: ${JSON.stringify(selectedReport)}`);
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
            setEditInProgressFlag(false);
            // alert deleted notification
            // navigate to expenses
            // Add your delete logic here
        } else {
            console.log("Delete action cancelled");

        }
    }

    const handleSave = () => {
        console.log(`handleSave: ${selectedValue}`);
        newReportName.trim() === "" && selectedValue === "-1" ?
            window.alert("Please enter a report name") :
            (
                saveNewReport()
            )
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
                {(returnedReports?.length ?? 0) > 0 ? (
                    <>
                        <optgroup label="Returned">
                            {returnedReports?.map((rpt) => (
                                <option key={rpt.id} value={rpt.id}>{rpt.name}</option>
                            ))}
                        </optgroup>
                    </>
                ) : <></>}

                {(pendingReports?.length ?? 0 > 0) ? (
                    <optgroup label="Pending">
                        {pendingReports?.map((rpt) => (
                            <option key={rpt.id} value={rpt.id}>{rpt.name}</option>
                        ))
                        }
                    </optgroup>
                ) : <></>
                }
            </>
        )
    }

    const handleNewReportNamcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewReportName(event.target.value);
    }

    const saveNewReport = async () => {
        console.log(`Calling Api: ${api_url_statements} for Report id; ${selectedValue}`)
        console.log(`saveNewReport: CURRENT REPORT EXPENSES: ${JSON.stringify(currReportExpenses)}`);
        let reportFinal: ReportUpdate = {
            cardNumber: cardNumber as number,
            reportName: newReportName.trim() === "" ? initialReportName : newReportName,
            reportId: selectedValue === "-1" ? undefined : parseInt(selectedValue as string),
            reportMemo: '',
            statements: []
        }
        let updatedStatements: StatementUpdate;
        currReportExpenses && currReportExpenses.map((item) => {
            item.reportID = parseInt(selectedValue as string);
            updatedStatements = {
                id: item.id as number,
                reportId: reportFinal.reportId,
                category: item.category,
                description: item.description,
                type: item.type,
                memo: item.memo
            }
            reportFinal.statements.push(updatedStatements);
        })

        try {
            const response = await axios.post(api_url_statements, reportFinal, {
                headers: userHeaders
            });
            console.log(`saveNewReport call returned: ${JSON.stringify(response.data)}`);
            // Call to reset the report dropdown ***

            if (response.data > 0) {
                console.log(`saveNewReport calling getOpenReports: }`);
                getOpenReports(response.data); //refresh the report dropdown
                setEditInProgressFlag(false)
            }
        } catch (error) {
            console.log(`saveNewReport error: ${error}`);
        } finally {

        }


    }

    console.log(`ReportHeader: ${(currReportExpenses === undefined || !reportHeaderData.canEdit)}`)
    console.log(`ReportHeader:EditInProgress ${JSON.stringify(editInProgress)} : ${JSON.stringify(editInProgressFlag)}`);
    return (
        <>
            <Stack direction={'row'} marginTop={2} marginBottom={1}>
                <Typography variant='subtitle1' marginLeft={15}>{myDate.toDateString()}</Typography>
                {reportHeaderData.name === "" ? (
                    <TextField
                        label='Enter report name'
                        variant="outlined"
                        sx={{ marginLeft: 4 }}
                        value={newReportName}
                        onChange={handleNewReportNamcChange}
                    />
                ) : (
                    <TextField
                        label=' '
                        variant="standard"
                        slotProps={{
                            input: {
                                disableUnderline: true,
                            },
                        }}
                        value={reportHeaderData.name}
                        sx={{ marginLeft: 12 }}
                    />
                )}
                <Typography variant='subtitle1' marginLeft={12}>${amount?.toFixed(2)}</Typography>
                <Box sx={{
                    marginLeft: "100px"
                }}>
                    <Stack display={"block"} spacing={2} direction={"row"}>
                        <Button
                            variant="contained"
                            onClick={handleButtonClicks}
                            disabled={currReportExpenses === undefined || !reportHeaderData.canEdit}
                        >
                            Save</Button>
                        <Button
                            variant="outlined"
                            onClick={handleButtonClicks}
                            disabled={currReportExpenses === undefined || !reportHeaderData.canEdit}
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
                <Typography variant='subtitle1' marginLeft={20}>xxx{cardNumber}</Typography>
                {!loading ? (
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
                                <option aria-label="None" value="-1" key={-1}>{selectedValue === "-1" ? initialReportName : "Add New Expense"}</option>
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
import { Alert, Box, Button, ButtonGroup, Divider, Snackbar, Stack, TextField, Typography, SnackbarCloseReason } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../hooks/useAppContext';
import { useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { api_domain } from '../../utilities';
import { ReportRequest, reportStatus } from '../../types'; // Ensure this is the correct import for the enum
import axios from 'axios';
import { alertStatus, Expense, newReportRequest, receiptImageInfo, receiptImageResponse, reportDeleteRequest, ReportHeaderInfo, ReportInfo, ReportUpdate, sasTokenCache, StatementUpdate } from '../../types';
import { report } from 'process';
import { userInfo } from 'os';
import { ConstructionOutlined } from '@mui/icons-material';


const ReportHeader: React.FC<ReportHeaderInfo> = ({ amount }) => {
    const { newReportItems,
        ReportSetUp,
        currReportExpenses,
        currReportItemsToDelete,
        setCurrReportItemsToDelete,
        editInProgressFlag,
        setEditInProgressFlag,
        setReceiptImg,
        receiptImg,
        setAlertMsg
    } = useAppContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [reportInfo, setReportInfo] = useState<ReportInfo[] | undefined>(); //used for report details
    const [selectedValue, setSelectedValue] = useState<string | undefined>("-1"); //used for report selection
    //const [editInProgressFlag, setEditInProgressFlag] = useState<boolean>(true); //used to signal if edits are in progress
    const initialReportName: string = "New Report"; //used for New Report Dropdown name
    const [newReportName, setNewReportName] = useState<string>(""); //used only for new report name
    const [isAlertOpen, setIsAlertOpen] = useState<alertStatus>({ open: false, message: "", severity: "info" });
    const navigate = useNavigate();
    const myDate = new Date;
    const api_url = `${api_domain}/reports`;
    const api_url_report_update = `${api_url}/update`;
    const api_url_report_delete = `${api_url}/delete`;
    const api_url_statements_update = `${api_domain}/statements/update`;
    const api_url_statements_report = `${api_domain}/statements/report`;
    const api_url_images = `${api_domain}/images`;
    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
        "Cache-Control": "no-cache"
    };
    const userHeadersImages = {
        "Authorization": auth,
        "Content-Type": "multipart/form-data",
        "Cache-Control": "no-cache"
    };

    const initRptHeaderInfo: ReportHeaderInfo = {
        //amount: amount,
        id: -1,
        name: "",
        cardNumber: localStorage.getItem('userCC') ? parseInt(localStorage.getItem("userCC") as string) : 0,
        editInProgress: true,
        status: reportStatus.NEW
    }
    //may not need this
    const [reportHeaderData, setReportHeaderData] = useState<ReportHeaderInfo>(initRptHeaderInfo); //used for report header info
    let curReportStatus: reportStatus = reportStatus.NEW;

    //Sets the Header info once per Report selection
    useEffect(() => {
        if (reportHeaderData.cardNumber !== 0) {
            console.log(`Setting Header Info:newreportItems ${JSON.stringify(newReportItems)}`);
            setReportHeaderData((currState: ReportHeaderInfo) => ({
                ...currState,
                amount: amount
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
            console.log(`getOpenReports: Calling Api ${api_url}?id=${reportHeaderData.cardNumber} for report id: ${rptId}`);
            const response = await axios.get(api_url + "?id=" + reportHeaderData.cardNumber, {
                headers: userHeaders
            });
            console.log(`getOpenReports: Reports call returned: ${JSON.stringify(response.data.reports)}`);
            setReportInfo(response.data.reports);
            // if no report id arg, then default to new report otherwise set the selected value
            if (rptId === undefined) {
                setSelectedValue("-1");
                setReportHeaderData((currState: ReportHeaderInfo) => ({
                    ...currState,
                    editInProgress: true,
                    status: reportStatus.NEW
                }));
                setEditInProgressFlag(true);
            }
            else {
                setSelectedValue(rptId.toString());
                const selectedReport: ReportInfo = response.data.reports.find((rpt: ReportInfo) => rpt.id === rptId)
                setReportHeaderData((currState: ReportHeaderInfo) => ({
                    ...currState,
                    name: selectedReport ? selectedReport.name : "",
                    id: rptId,
                    editInProgress: false,
                    status: (selectedReport?.status as reportStatus) ?? undefined
                }));
                setEditInProgressFlag(false);
            }
        }
        catch (error) {
            console.log("getOpenReports: Get Open Reports Error");
        }
        finally {
            setLoading(false);
        }
    }


    //Initial call to populate the Reports dropdown
    useEffect(() => {
        console.log(`ReportHeader:initial call: ${reportHeaderData.cardNumber} :: SelectedValue ${selectedValue} :: EditInProgressFlag ${editInProgressFlag}`);
        (selectedValue === "-1") && getOpenReports(undefined);
        setAlertMsg({ open: false, message: "", severity: "info" });
    }, []);

    // useEffect(() => { //TODO
    //     setEditInProgressFlag(editInProgress);
    //     console.log(`ReportHeader:EditInProgressFlag: ${editInProgressFlag} - ReportHeader-EditInProgress: ${reportHeaderData.editInProgress}`);
    // }, [editInProgress]);

    //Get statements for the selected Report
    const GetSelectedReportInfo = async (reportID: number) => {
        try {
            setLoading(true);
            console.log(`Calling Api: ${api_url_statements_report}?id=${reportID}`);
            const response = await axios.get(api_url_statements_report + "?id=" + reportID, {
                headers: userHeaders
            });
            console.log(`GetSelectedReportInfo call returned: ${JSON.stringify(response.data.expenses)}`);
            ReportSetUp(response.data.expenses, "CURRENTREPORT");
            setEditInProgressFlag(false);
            ReportSetUp(undefined, "ACTIVEREPORT");
        }
        catch (error) {
            console.log("GetSelectedReportInfo Error");
        }
        finally {
            setLoading(false);
        }
    }

    // should i move this to handleDelete?
    const InitializeView = (data: Expense[] | undefined, reportType: string) => {
        if (!data) {
            ReportSetUp(undefined, reportType);
            getOpenReports(undefined);
            setReportHeaderData(initRptHeaderInfo);
            setNewReportName("");
            console.log(`handleUpdatingViews:editInProgressFlag ${JSON.stringify(editInProgressFlag)}`);
        }
    };

    const handleSwitchReports = (event: SelectChangeEvent<string>) => {
        console.log(`handleSwitchReports:editInProgressFlag ${selectedValue} : ${editInProgressFlag}`);
        console.log(`handleSwitchReports: ${JSON.stringify(reportInfo)}`);  //? reportInfo[parseInt(event.target.value)]?.status : reportStatus.NEW}`);
        var index = (event.target as HTMLSelectElement).selectedIndex;

        setAlertMsg({ open: false, message: "", severity: "info" });
        // goin from new report to existing report
        if (selectedValue === "-1" || editInProgressFlag) {
            const userConfirmed = window.confirm("Are you sure you want to switch reports?  You will lose any unsaved changes.");
            if (!userConfirmed) {
                setSelectedValue(selectedValue);
                return;
            }
        }

        // goin from existing report to new report
        if (event.target.value === "-1") {
            //handleUpdatingViews(undefined);
            navigate(`../expenses`);
            return;
        }

        GetSelectedReportInfo(parseInt(event.target.value));
        setSelectedValue(event.target.value);
        if (reportInfo) {
            console.log('handleSwitchReports: yes');
        }
        setReportHeaderData((currState: ReportHeaderInfo) => ({
            ...currState,
            name: (event.target as HTMLSelectElement)[index].innerText,
            editInProgress: false,
            status: reportInfo ? reportInfo.find((rpt) => rpt.id === parseInt(event.target.value))?.status as reportStatus : undefined
        }));

        setCurrReportItemsToDelete([]);
        setReceiptImg([]);
        ReportSetUp(undefined, "NEWREPORT");
    }


    const handleButtonClicks = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        console.log(`handleButtonClicks: button selected -  ${event.currentTarget.textContent}`);
        switch (event.currentTarget.textContent) {
            case "Delete":
                handleDelete();
                break;
            case "Save":
                setReportHeaderData((currState: ReportHeaderInfo) => ({
                    ...currState,
                    status: reportStatus.PENDING as reportStatus
                }));
                curReportStatus = reportStatus.PENDING;
                handleSave(reportStatus.PENDING);
                break;
            case "Submit":
                const userConfirm = window.confirm("Once submitted, the report cannot be edited. Are you sure you want to submit?");
                if (userConfirm) {
                    setReportHeaderData((currState: ReportHeaderInfo) => ({
                        ...currState,
                        status: reportStatus.SUBMITTED as reportStatus
                    }));
                    curReportStatus = reportStatus.SUBMITTED;
                    handleSave(reportStatus.SUBMITTED);
                }
                break;
            case "Approve":
                break;
            case "Return":
                break;
        }
    }

    const handleCancel = (doNavigate: boolean = true): void => {
        const userConfirmed = doNavigate ? window.confirm("Are you sure you want to cancel?  You will lose any unsaved changes.") : false;
        if (userConfirmed || !doNavigate) {
            //handleUpdatingViews(undefined);
            if (doNavigate) {
                console.log(`handleCancel: ${doNavigate}`);
                navigate(`../expenses`)
            }
        }
    }

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsAlertOpen({ open: false, message: "", severity: "info" });
    };

    const handleDelete = async () => {
        if (selectedValue === "-1") {
            const userConfirmed_NewReport = window.confirm("You will be navigated to Expense view.  Are you sure you want to delete this report?");
            if (userConfirmed_NewReport) {
                navigate(`../expenses`);
            }
        }
        else {
            const userConfirmed = window.confirm("Are you sure you want to delete this report?");
            if (userConfirmed) {
                // Proceed with delete logic
                let itemsToDelete: number[] = [];

                currReportExpenses && currReportExpenses.map((item) => {
                    itemsToDelete.push(item.id as number);
                });

                const reportDeleteRequest: reportDeleteRequest = {
                    reportId: parseInt(selectedValue as string),
                    itemsToDelete: itemsToDelete
                }

                try {
                    setLoading(true);
                    const response = await axios.post(api_url_report_delete, reportDeleteRequest, {
                        headers: userHeaders
                    });
                    console.log(`handleDelete call returned: ${JSON.stringify(response.data)}`);
                    // alert deleted notification
                    setIsAlertOpen({ open: true, message: `Report ${reportHeaderData.name} deleted successfully!`, severity: "success" });
                    InitializeView(undefined, "CURRENTREPORT")
                } catch (error) {
                    console.log(`handleDelete error: ${error}`);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log("Delete action cancelled");

            }
        }
    }

    const handleSave = (rpt_status: reportStatus) => {
        console.log(`handleSave: ${selectedValue} :: status - ${rpt_status}`);
        setAlertMsg({ open: false, message: "", severity: "info" });
        if (newReportName.trim() === "" && selectedValue === "-1") {
            setIsAlertOpen({ open: true, message: "Please enter a report name", severity: "error" });
            //window.alert("Please enter a report name");
        } else {
            updateReport();
        }
        //Report saved alert
    }

    const createReportDropDown = () => {
        const pendingReports: ReportInfo[] | undefined = reportInfo?.filter((rpt) =>
            rpt.status?.toString() === "PENDING"
        );

        const returnedReports: ReportInfo[] | undefined = reportInfo?.filter((rpt) =>
            rpt.status?.toString() === "RETURNED"
        )
        const submittedReports: ReportInfo[] | undefined = reportInfo?.filter((rpt) =>
            rpt.status?.toString() === "SUBMITTED"
        )

        //console.log(`Report Info: ${JSON.stringify(reportInfo)}`);
        console.log(`Submitted Reports: ${JSON.stringify(submittedReports)}`);
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
                ) : <></>}
                {(submittedReports?.length ?? 0) > 0 ? (
                    <optgroup label="Submitted">
                        {submittedReports?.map((rpt) => (
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

    //Save the receipt images to Azure
    const saveReceiptImages = async (imageToUpload: File, rptId: number) => {
        console.log(`saveReceiptImages: Calling Api: ${api_url_images} for Report id: ${rptId} :: Image count: ${newReportName}`);
        const formData = new FormData();

        try {
            //loop through the receipt images and save them***
            formData.append("request", imageToUpload);
            const url = `${api_url_images}?rptId=${rptId}`;
            const response = await axios.post(url, formData, {
                headers: userHeadersImages
            });
            console.log(`saveReceiptImages call returned: ${JSON.stringify(response.data)}`);
            //setImageUploadInfo(response);
            setReceiptImg([]);
            return response.data;
        } catch (error) {
            console.log(`saveReceiptImages error: ${error}`);
            setAlertMsg({ open: true, message: "An error occurred while uploading receipt images. Please try again.", severity: "error" });
            setIsAlertOpen({ open: true, message: "An error occurred while uploading receipt images. Please try again.", severity: "error" });
            return "";
        }
    }

    const createNewReport = async () => {
        const setStatus = reportHeaderData.status && reportHeaderData.status !== reportStatus.NEW ? reportHeaderData.status as reportStatus : reportStatus.PENDING;

        try {
            const request: newReportRequest = {
                cardNumber: reportHeaderData.cardNumber as number,
                name: (newReportName.trim() !== "") ? newReportName : "",
                memo: `Initial report created: ${new Date().toDateString()}`,
                status: setStatus
            }

            if (request.name === "" || request.cardNumber === 0) {
                setAlertMsg({ open: true, message: "Invalid request", severity: "error" });
                setIsAlertOpen({ open: true, message: "Invalid request", severity: "error" });
                console.error(`createNewReport: Invalid request failed calling ${api_url} with request ${JSON.stringify(request)}`);
                return 0;
            }
            console.log(`createNewReport: Calling Api: ${api_url} for Report name: ${JSON.stringify(request)}`);
            const response: { data: number } = await axios.post(api_url, request, {
                headers: userHeaders
            });

            if (response.data === 0) throw new Error("Create New Report call failed returning 0:  most likely a duplicate report name");
            console.log(`createNewReport: call succeeded and returned: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            setAlertMsg({ open: true, message: `Error Creating New Report.  ${process.env.REACT_APP_SUPPORT_CONTACT_MSG} \nHint: if this is a new report, use a different name and try again.`, severity: "error" });
            setIsAlertOpen({ open: true, message: `Error Creating New Report.  ${process.env.REACT_APP_SUPPORT_CONTACT_MSG}`, severity: "error" });
            console.error(`createNewReport: error: ${error}`);
            return -1;
        }
    }

    const updateExistingReport = async (rptId: number, rptMemo?: string) => {
        const request: ReportRequest = {
            reportid: rptId,
            memo: rptMemo,
            status: curReportStatus
        }

        if (rptId === 0) {
            setAlertMsg({ open: true, message: "Invalid request", severity: "error" });
            setIsAlertOpen({ open: true, message: "Invalid request", severity: "error" });
            console.error(`updateExistingReport: Invalid request failed calling ${api_url_report_update}`);
            return 0;
        }

        try {
            console.log(`updateExistingReport: Calling Api: ${api_url_report_update} for Report id: ${rptId}`);
            const response = await axios.post(api_url_report_update, request, {
                headers: userHeaders
            });

            if (response.data === null) throw new Error("Update Existing Report call failed returning 0:  most likely a duplicate report name");
            console.log(`updateExistingReport: call succeeded and returned: ${JSON.stringify(response.data)}`);
            // update ReportSetup ***
            setReportInfo(reportInfo => reportInfo?.map(rpt =>
                rpt.id === rptId ?
                    { ...rpt, memo: response.data.memo, status: reportStatus[response.data.status as unknown as keyof typeof reportStatus] } :
                    rpt
            ));


            //     if (rpt.id === rptId) {
            //         rpt.status = reportStatus[response.data.status as unknown as keyof typeof reportStatus];
            //     }
            //     return rpt;
            // }));
            return rptId;
        } catch (error) {
            setAlertMsg({ open: true, message: `Error Updating Report.  ${process.env.REACT_APP_SUPPORT_CONTACT_MSG}`, severity: "error" });
            setIsAlertOpen({ open: true, message: `Error Updating Report.  ${process.env.REACT_APP_SUPPORT_CONTACT_MSG}`, severity: "error" });
            console.error(`updateExistingReport: error: ${error}`);
            return -1;
        }
    }

    //Update the report with the new image URLs
    const updateReport = async () => {
        // console.log(`updateReport: CURRENT REPORT EXPENSES: ${JSON.stringify(currReportExpenses)}`);
        console.log(`updateReport: REPORT HEADER DATA: ${JSON.stringify(reportHeaderData)}`);
        let reportFinal: ReportUpdate = {
            cardNumber: reportHeaderData.cardNumber as number,
            reportName: selectedValue === "-1" ? (newReportName.trim() === "" ? initialReportName : newReportName) : reportHeaderData.name as string,
            reportId: selectedValue === "-1" ? undefined : parseInt(selectedValue as string),
            reportMemo: '',
            itemsToDelete: currReportItemsToDelete,
            status: (curReportStatus === reportStatus.NEW || curReportStatus === reportStatus.PENDING) ? undefined : curReportStatus,    //reportHeaderData.status === reportStatus.SUBMITTED ? reportStatus.SUBMITTED : undefined,
            statements: []
        }

        // const imageURI: string = await saveReceiptImages();  //Save receipt images first
        let updatedStatements: StatementUpdate;
        let receiptUrl: string | undefined = undefined;

        // Save images and update the report
        const processExpenses = async (rptId: number) => {
            console.log(`updateReport: Report Id is ${rptId}`);

            // this is where you will manage user updates to the report ***
            for (const item of currReportExpenses || []) {
                const currImage: receiptImageInfo | undefined = receiptImg.find((img) => img.expenseId === item.id);
                receiptUrl = currImage ? await saveReceiptImages(currImage.image, rptId) : undefined;
                //if (receiptUrl !== "") {
                // if receiptUrl is undefined, then use the existing receiptUrl as the receipt is not being updated
                const tokenKey: string | undefined = receiptUrl ? receiptUrl.split("/").slice(4).join("/").split("?")[0] : undefined;
                console.log(`updateReport: receipt key: ${tokenKey} for item: ${item.id} :: receipt image store ${receiptImg.length}`);
                updatedStatements = {
                    id: item.id as number,
                    reportId: rptId,
                    category: item.category,
                    description: item.description,
                    type: item.type,
                    memo: item.memo,
                    receiptUrl: tokenKey ? tokenKey : item.receiptUrl
                }
                console.log(`updateReport: updatedStatements: ${JSON.stringify(updatedStatements)}`);
                reportFinal.statements.push(updatedStatements);
                //}
            }
        };


        let reportId: number = 0;
        if (reportFinal.reportId) {   // Updates existing report
            reportId = await updateExistingReport(reportFinal.reportId, reportFinal.reportMemo);
        } else await createNewReport();   // Creates a new report only if it's a new report

        if (typeof reportId === 'number' && reportId > 0) {
            reportFinal.reportId = reportId;
            await processExpenses(reportId);  // Only if existing or createNewReport succeeded
        }
        else {
            return;
        }

        console.log(`updateReport: reportFinal - ${JSON.stringify(reportFinal)}`);
        try {
            // Check if there are any statements to save
            if (reportFinal.statements.length === 0) {
                setAlertMsg({ open: true, message: `Invalid report.  Must have at least one expense per report. ${process.env.REACT_APP_SUPPORT_CONTACT_MSG}.`, severity: "error" });
                setIsAlertOpen({ open: true, message: `Invalid report.  Must have at least one expense per report. ${process.env.REACT_APP_SUPPORT_CONTACT_MSG}.`, severity: "error" });
                console.error(`updateReport: Invalid report.  Must have at least one expense per report.`);
                // clean up by deleting report info ***
                return;
            }

            console.log(`updateReport: Calling Api: ${api_url_statements_update} for Report id: ${reportFinal.reportId}`);
            const response = await axios.post(api_url_statements_update, reportFinal, {
                headers: userHeaders
            });
            console.log(`updateReport: call returned: ${JSON.stringify(response.data)}`);

            // Check if the report statements were saved
            if (response.data.expenses <= 0) {
                setAlertMsg({ open: true, message: "An error occurred while saving the report statements. Please try again.", severity: "error" });
                setIsAlertOpen({ open: true, message: "An error occurred while saving the report statements. Please try again.", severity: "error" });
                console.log(`updateReport: Error occurred while saving the report.`);
                // clean up by deleting images & report info ***
                return;
            }

            setCurrReportItemsToDelete([]);
            if (selectedValue === "-1") {
                console.log(`updateReport: calling getOpenReports: `);
                getOpenReports(reportId); //refresh the report dropdown only if it's a new report
                ReportSetUp(undefined, "NEWREPORT")
            } else {
                curReportStatus === reportStatus.SUBMITTED && getOpenReports(reportId); //refresh the report dropdown if Submitting the report
                // check if status is different from reportInfo.  if so update the reportInfo
                console.log(`updateReport: checking if status is different from reportInfo: ${reportInfo?.find((rpt) => rpt.id === reportId)?.status} :: ${reportHeaderData.status}`);
                if (reportInfo?.find((rpt) => rpt.id === reportId)?.status !== reportHeaderData.status) {
                    const updatedReportInfo: ReportInfo[] | undefined = reportInfo?.map((rpt) => {
                        if (rpt.id === reportId) {
                            rpt.status = reportHeaderData.status as reportStatus;
                        }
                        return rpt;
                    });
                    setReportInfo(updatedReportInfo);
                    ReportSetUp(response.data.expenses, "CURRENTREPORT");
                }
            }

            //GetSelectedReportInfo(reportId); //refresh the report details
            console.log(`updateReport: header Data: ${JSON.stringify(reportHeaderData)}`); //
            setIsAlertOpen({ open: true, message: "Report saved successfully!", severity: "success" });
        } catch (error) {
            console.log(`updateReport: error: ${error}`);
        }
    }

    console.log(`New Report Items: ${JSON.stringify(newReportItems)}`);
    // console.log(`ReportHeader: CURRENTREPORTEXPENSES: ${currReportExpenses}`)
    console.log(`ReportHeader:EDITINPROGRESSFLAG ${JSON.stringify(editInProgressFlag)}`);
    console.log(`ReportHeader:is submitted status ${reportHeaderData.status && reportStatus[reportHeaderData.status as unknown as keyof typeof reportStatus] === reportStatus.SUBMITTED} :: ${reportHeaderData.status}`);
    console.log(`ReportHeader:is curReportStatus - ${curReportStatus}`);
    console.log(`ReportHeader: ${typeof reportHeaderData.status} :: ${reportStatus.SUBMITTED}`);
    return (
        <>
            <Snackbar autoHideDuration={6000} open={isAlertOpen.open} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity={isAlertOpen.severity}
                    variant="filled"
                    sx={{ width: '100%', whiteSpace: "pre-line" }}
                >
                    {isAlertOpen.message}
                </Alert>
            </Snackbar>

            {reportHeaderData.name === "" ? (
                <TextField
                    label='Enter report name'
                    variant="outlined"
                    sx={{ marginLeft: 25, marginTop: 1 }}
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
                    sx={{ marginLeft: 30, width: 140, textAlign: 'center', fontWeight: 'bold', fontSize: 30 }}
                />
            )}
            {(localStorage.getItem('isAdmin') !== "true") ? (
                <ButtonGroup variant="outlined" color="primary" aria-label="contained primary button group"
                    sx={{ marginLeft: 40, gap: 1, marginTop: .3 }}>
                    <Button
                        variant='contained'
                        size='small'
                        onClick={handleButtonClicks}
                        disabled={(currReportExpenses === undefined) ||
                            (reportStatus[reportHeaderData.status as unknown as keyof typeof reportStatus] === reportStatus.SUBMITTED)
                        }
                    >
                        Submit</Button>
                    <Button
                        variant="outlined"
                        onClick={handleButtonClicks}
                        disabled={currReportExpenses === undefined ||
                            !editInProgressFlag ||
                            (reportStatus[reportHeaderData.status as unknown as keyof typeof reportStatus] === reportStatus.SUBMITTED)}
                        sx={{ marginRight: 1 }}
                    >
                        Save</Button>
                    <Divider color='secondary' orientation='vertical' flexItem />
                    <Button
                        variant="text"
                        size='small'
                        onClick={handleButtonClicks}
                        disabled={(currReportExpenses === undefined) ||
                            (reportStatus[reportHeaderData.status as unknown as keyof typeof reportStatus] === reportStatus.SUBMITTED)}
                        sx={{}}
                    >
                        Delete</Button>
                </ButtonGroup>) : (
                <ButtonGroup variant='outlined' color='primary' aria-label='contained primary button group'
                    sx={{ marginLeft: 40, gap: 1, marginTop: .3 }}>
                    <Button
                        variant='contained'
                        onClick={handleButtonClicks}
                        sx={{ marginLeft: 40, marginTop: 1 }}>
                        Approve
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleButtonClicks}
                        sx={{ marginLeft: 40, marginTop: 1 }}>
                        Return
                    </Button>
                </ButtonGroup>
            )}

            <Stack direction={'row'} marginTop={0} marginBottom={1}>
                <Typography variant='subtitle1'
                    sx={{
                        marginLeft: 10,
                        width: 130,
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}>{myDate.toDateString()}</Typography>
                <Typography variant='subtitle1'
                    sx={{
                        marginLeft: 25,
                        width: 50,
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}>${amount?.toFixed(2)}</Typography>
                {!loading ? (
                    reportInfo?.length ? (
                        <FormControl sx={{
                            marginTop: 2,
                            marginLeft: 25,
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
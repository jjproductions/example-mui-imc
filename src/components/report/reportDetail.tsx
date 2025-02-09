import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Alert, AlertTitle, Box, Button, Container, Divider, FilledInput, FormControl, InputAdornment, InputLabel, OutlinedInput, Snackbar, SnackbarCloseReason, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import { alertStatus, Expense, gridType, receiptImageInfo, sasTokenRefreshRequest } from "../../types";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ReportHeader from './reportHeader';
import UploadReceipt from './receipt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { api_domain, isTokenCached, tokenCacheUpdate } from '../../utilities';
import axios from "axios";
import { report } from 'process';
import { blob } from 'stream/consumers';


const ReportDetail = () => {
    const { newReportItems,
        currReportExpenses,
        ReportSetUp,
        currReportItemsToDelete,
        setCurrReportItemsToDelete,
        receiptImg,
        alertMsg,
        setAlertMsg,
        activeReportItem,
        setEditInProgressFlag
    } = useAppContext();
    const [reportItem, setReportItem] = useState<Expense | null>(null);
    const [reportAmountTotal, setReportAmountTotal] = useState<number>(5);
    const navigate = useNavigate();
    const cardNumber: number = localStorage.getItem('userCC') ? parseInt(localStorage.getItem("userCC") as string) : 0;
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState<alertStatus>({ open: false, message: "", severity: "info" });
    let reportAmount: number = 0;
    let skipReceiptImg: boolean = false;
    let tempExpense: Expense[] | undefined = currReportExpenses;
    const dummyExpense: Expense = {
        amount: 0,
        category: '',
        cardNumber: 0,
        description: '',
        memo: '',
        transactionDate: '',
        id: 0,
        postDate: '',
        type: '',
        reportID: null,
        receiptUrl: undefined
    }

    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
    };
    const api_url_signin_sastoken = `${api_domain}/signin/sastoken`;

    console.log(`ReportDetail: Current Items to Delete - ${JSON.stringify(currReportItemsToDelete)}`);
    //Calculate total amount for report
    useEffect(() => {
        console.log(`ReportDetail: Current Report Expenses - ${JSON.stringify(currReportExpenses)}`);
        reportAmount = 0;
        currReportExpenses?.map((row) => {
            reportAmount += row.amount;
        })
        setReportAmountTotal(reportAmount);
        ReportSetUp(undefined, "ACTIVEREPORT");
    }, [currReportExpenses]);

    useEffect(() => {
        console.log(`ReportDetail:Image ${!skipReceiptImg} - ${JSON.stringify(receiptImg?.length)}`);
        ReportSetUp(undefined, "ACTIVEREPORT");
    }, [receiptImg]);

    const handleDeleteClick = (id: GridRowId) => () => {
        if (currReportExpenses !== undefined) {
            ReportSetUp(currReportExpenses.filter((row) => row.id !== id), "CURRENTREPORT");
            //setReport(undefined);
            console.log(`Delete: ${id} : ${JSON.stringify(currReportExpenses.filter((row) => row.id !== id))}`);
            !newReportItems && setCurrReportItemsToDelete([...currReportItemsToDelete, id as number]);  // Add to delete list only if it's an existing report
            setEditInProgressFlag(true);
        }

    };

    const handleReceiptClick = (id: GridRowId) => async () => {
        let tmpReceipt: string | undefined = currReportExpenses?.find((row) => row.id === id)?.receiptUrl;

        if (tmpReceipt) {
            console.log(`handleReceiptClick: ${id as number} :: tmpReceipt: ${JSON.stringify(tmpReceipt)}`);
            // this shows images from a new report not yet saved; this is the full URL without SAS token
            if (tmpReceipt?.startsWith("http")) {
                const receiptInfo: receiptImageInfo = receiptImg?.find((row) => row.expenseId === id) as receiptImageInfo;
                tmpReceipt = URL.createObjectURL(receiptInfo.image);
            }
            else {
                // Check in local storaqge to get full URL with SAS token
                try {
                    const cachedToken: string | undefined = isTokenCached(tmpReceipt);
                    if (!cachedToken) {  // Has expired and needs to be refreshed
                        const blobName = tmpReceipt;
                        console.log(`handleReceiptClick: ${id as number} :: bloblName: ${JSON.stringify(blobName)}`);
                        const request: sasTokenRefreshRequest = {
                            "blobName": blobName as string,
                        };
                        if (blobName === "") {
                            console.error(`handleReceiptClick:Blob name is invalid: ${blobName}`);
                            setIsAlertOpen({ open: true, message: "Can not display image receipt.", severity: "error" });
                            tmpReceipt = undefined;
                        }
                        // Change to an Azure function to get SAS token
                        const sasToken = await axios.post(api_url_signin_sastoken, request, {
                            headers: userHeaders
                        });
                        console.log(`handleReceiptClick:Blob URL with SAS: ${sasToken}`);
                        tmpReceipt = sasToken.data;
                        tokenCacheUpdate(tmpReceipt as string);   // Update the cache with the refreshed token
                    }
                    else { // No need to refresh token
                        tmpReceipt = cachedToken;
                        console.log(`handleReceiptClick:SAS Token is still valid`);
                    }
                } catch (error) {
                    console.error("handleReceiptClick:Error fetching data:", error);
                    setIsAlertOpen({ open: true, message: "Can not display image receipt.", severity: "error" });
                    tmpReceipt = undefined;
                }
            }
            tmpReceipt && window.open(tmpReceipt, "_blank");
        }
    }

    interface ColumnActions {
        id: GridRowId;
    }

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'Id', width: 60 },
        {
            field: 'receiptImg', type: 'actions', headerName: '', width: 50,
            getActions: ({ id }: ColumnActions) => {
                const receiptUrl = currReportExpenses?.find((row) => row.id === id)?.receiptUrl;
                return receiptUrl ? [
                    <GridActionsCellItem
                        icon={<ReceiptIcon />}
                        label="Receipt"
                        onClick={handleReceiptClick(id)}
                        color="inherit"
                    />
                ] : [];
            },
        },
        { field: 'transactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 100 },
        { field: 'description', headerName: 'Description', width: 240 },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', width: 75,
            getActions: ({ id }: ColumnActions) => {
                return [
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ]

    console.log(`selected Item: ${currReportExpenses?.length} ${JSON.stringify(currReportExpenses)}`);

    const createGrid = () => {
        return (
            <DataGrid
                rows={currReportExpenses}
                columns={columns}
                autoPageSize

                onRowSelectionModelChange={(select) => {
                    const selectedIDs = new Set(select);
                    const selectedRows: Expense[] | undefined = currReportExpenses?.filter((row: any) =>
                        selectedIDs.has(row.id)
                    );
                    console.log(`selectedIDs: ${JSON.stringify(selectedIDs)}`)
                    console.log(`grid select: ${select}`);
                    console.log(`grid selection: ${JSON.stringify(selectedRows)}`);
                    (selectedRows != undefined && selectedRows.length > 0) ? ReportSetUp(selectedRows, "ACTIVEREPORT") : ReportSetUp(undefined, "ACTIVEREPORT");
                }}
            />
        )
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

    console.log(`Show Alert: ${showAlert} - ${JSON.stringify(receipt?.size)}`);
    return (
        <>

            {alertMsg.open && (
                <Alert severity={alertMsg.severity} onClose={() => setAlertMsg({ ...alertMsg, open: false })}>
                    <AlertTitle>Receipt</AlertTitle>
                    <Typography variant='h6' color='secondary' sx={{ whiteSpace: "pre-line" }}>{alertMsg.message}</Typography>
                </Alert>
            )}
            <Snackbar autoHideDuration={6000} open={isAlertOpen.open} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {isAlertOpen.message}
                </Alert>
            </Snackbar>
            <ReportHeader amount={reportAmountTotal} cardNumber={cardNumber} editInProgress={false} />
            <Divider variant='middle' color='secondary' />
            {currReportExpenses ? (
                <div style={{ marginLeft: 5, width: 1000 }}>
                    {activeReportItem && activeReportItem.id !== 0 ? (
                        <Box sx={{ float: 'right', marginRight: 5, width: 230 }}>
                            <UploadReceipt />
                        </Box>
                    ) : (
                        <></>
                    )}
                    <Container sx={{
                        margin: 2,
                        height: 375,
                        width: 725,
                    }}>
                        {createGrid()}
                    </Container>

                </div>

            ) : (
                <>
                    {/* <Typography variant='h6' color='secondary' sx={{ marginLeft: 5 }}>No expenses to report.</Typography> */}
                    <Button
                        variant='outlined'
                        color='primary'
                        sx={{ margin: 5 }} onClick={() => navigate(`../expenses`)}>Add expense</Button>
                </>

            )}
            {activeReportItem !== undefined && activeReportItem?.id !== 0 ? (
                <>
                    <Box
                        component="form"
                        sx={{ '& > :not(style)': { marginTop: 3, width: '20ch' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <FormControl disabled variant='filled' fullWidth sx={{ marginLeft: 5 }}>
                            <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
                            <FilledInput
                                id="filledlined-adornment-amount"
                                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                value={activeReportItem?.amount}
                            />
                        </FormControl>
                        <FormControl disabled variant='filled' fullWidth sx={{ marginLeft: 2 }}>
                            <InputLabel htmlFor="outlined-adornment-vendor">Vendor</InputLabel>
                            <FilledInput
                                id="filledlined-adornment-vendor"
                                startAdornment={<InputAdornment position="start"></InputAdornment>}
                                value={activeReportItem?.description}
                            />
                        </FormControl>

                    </Box>
                    <Box
                        component="form"
                        sx={{ '& > :not(style)': { marginTop: 3, width: '20ch' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <FormControl disabled variant='filled' fullWidth sx={{ marginLeft: 5 }}>
                            <InputLabel htmlFor="outlined-adornment-tdate">Transaction Date</InputLabel>
                            <FilledInput
                                id="filledlined-adornment-tdate"
                                startAdornment={<InputAdornment position="start"></InputAdornment>}
                                value={activeReportItem?.transactionDate}
                            />
                        </FormControl>
                        <FormControl disabled variant='filled' fullWidth sx={{ marginLeft: 2 }}>
                            <InputLabel htmlFor="outlined-adornment-category">Category</InputLabel>
                            <FilledInput
                                id="filledlined-adornment-category"
                                startAdornment={<InputAdornment position="start"></InputAdornment>}
                                value={activeReportItem?.category}
                            />

                        </FormControl>
                    </Box>
                    <TextField
                        id="outlined-basic"
                        // multiline
                        label="Memo"
                        variant="outlined"
                        sx={{ marginLeft: 5, marginTop: 2, width: 420 }}
                        value={activeReportItem?.memo}
                    />
                </>
            ) : (
                <></>
            )}
        </>
    )
}

export default ReportDetail
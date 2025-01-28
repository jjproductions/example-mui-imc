import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Box, Button, Container, Divider, FilledInput, FormControl, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import { Expense, gridType } from "../../types";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ReportHeader from './reportHeader';
import { report } from 'process';


const ReportDetail = () => {
    const { newReportItems, currReportExpenses, setCurrReportExpenses, currReportItemsToDelete, setCurrReportItemsToDelete } = useAppContext();
    const [reportItem, setReportItem] = useState<Expense | null>(null);
    const [reportAmountTotal, setReportAmountTotal] = useState<number>(5);
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState<boolean>(true);
    const cardNumber: number = localStorage.getItem('userCC') ? parseInt(localStorage.getItem("userCC") as string) : 0;
    let reportAmount: number = 0;
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
        reportID: null
    }


    console.log(`ReportDetail: Current Items to Delete - ${JSON.stringify(currReportItemsToDelete)}`);
    //Calculate total amount for report
    useEffect(() => {
        reportAmount = 0;
        currReportExpenses?.map((row) => {
            reportAmount += row.amount;
        })
        setReportAmountTotal(reportAmount);
    }, [currReportExpenses]);


    //Sets state for selected row
    const setReport = (item: Expense | undefined) => {
        item ? setReportItem(item as Expense) : setReportItem(dummyExpense);

    }

    const handleDeleteClick = (id: GridRowId) => () => {
        if (currReportExpenses !== undefined) {
            setEditMode(true);
            setCurrReportExpenses(currReportExpenses.filter((row) => row.id !== id));
            setReport(undefined);
            console.log(`Delete: ${id} : ${JSON.stringify(currReportExpenses.filter((row) => row.id !== id))}`);
            !newReportItems && setCurrReportItemsToDelete([...currReportItemsToDelete, id as number]);  // Add to delete list only if it's an existing report
        }

    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'Id', width: 60 },
        { field: 'transactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 100 },
        { field: 'description', headerName: 'Description', width: 240 },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', width: 75,
            getActions: ({ id }) => {
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
                    (selectedRows != undefined && selectedRows.length > 0) ? setReport(selectedRows[0]) : setReport(undefined);
                }}
            />
        )
    }

    return (
        <>
            <ReportHeader amount={reportAmountTotal} cardNumber={cardNumber} editInProgress={editMode} />
            <Divider variant='middle' color='secondary' />
            {currReportExpenses ? (
                <div style={{ width: 675 }}>
                    <Container sx={{
                        margin: 3,
                        height: 375
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
            {reportItem !== null && reportItem.id !== 0 ? (
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
                                value={reportItem?.amount}
                            />
                        </FormControl>
                        <FormControl disabled variant='filled' fullWidth sx={{ marginLeft: 2 }}>
                            <InputLabel htmlFor="outlined-adornment-vendor">Vendor</InputLabel>
                            <FilledInput
                                id="filledlined-adornment-vendor"
                                startAdornment={<InputAdornment position="start"></InputAdornment>}
                                value={reportItem?.description}
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
                                value={reportItem?.transactionDate}
                            />
                        </FormControl>
                        <FormControl disabled variant='filled' fullWidth sx={{ marginLeft: 2 }}>
                            <InputLabel htmlFor="outlined-adornment-category">Category</InputLabel>
                            <FilledInput
                                id="filledlined-adornment-category"
                                startAdornment={<InputAdornment position="start"></InputAdornment>}
                                value={reportItem?.category}
                            />

                        </FormControl>
                    </Box>
                    <TextField
                        id="outlined-basic"
                        // multiline
                        label="Memo"
                        variant="outlined"
                        sx={{ marginLeft: 5, marginTop: 2, width: 420 }}
                        value={reportItem?.memo}
                    />
                </>
            ) : (
                <></>
            )}
        </>
    )
}

export default ReportDetail
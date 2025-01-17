import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Box, Container, Divider, FilledInput, FormControl, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import { Expense, gridType } from "../../types";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';



const ReportDetail = () => {
    const { reportItems, editInProgress, reportExpenses, setReportExpenses, setEditInProgress } = useAppContext();
    const [reportItem, setReportItem] = useState<Expense | null>(null);
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

    //Sets state for selected row
    const setReport = (item: Expense | undefined) => {
        item ? setReportItem(item as Expense) : setReportItem(dummyExpense);

    }

    const handleDeleteClick = (id: GridRowId) => () => {
        if (reportExpenses !== undefined) {
            setEditInProgress(true);
            setReportExpenses(reportExpenses.filter((row) => row.id !== id));
            setReport(undefined);
            console.log(`Delete: ${id} : ${JSON.stringify(reportExpenses.filter((row) => row.id !== id))}`);
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

    console.log(`selected Item: ${reportExpenses?.length} ${JSON.stringify(reportExpenses)}`);

    //useEffect(() => {
    const createGrid = () => {
        return (
            <DataGrid
                rows={reportExpenses}
                columns={columns}
                // initialState={{
                //     pagination: { paginationModel: { pageSize: 3 } },
                // }}
                // pageSizeOptions={[3, 7, 10]}
                autoPageSize

                onRowSelectionModelChange={(select) => {
                    const selectedIDs = new Set(select);
                    const selectedRows: Expense[] | undefined = reportExpenses?.filter((row: any) =>
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
    //});

    return (
        <>
            <Divider variant='middle' color='secondary' />
            <div style={{ width: 675 }}>
                <Container sx={{
                    margin: 3,
                    height: 375
                }}>
                    {createGrid()}
                </Container>
            </div>
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
    )
}

export default ReportDetail
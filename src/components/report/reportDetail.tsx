import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Box, Container, Divider, FilledInput, FormControl, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import { Expense, gridType } from "../../types";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';



const ReportDetail = () => {
    const { reportItems, ReportSetUp, setActiveReportItem } = useAppContext();
    const [reportItem, setReportItem] = useState<Expense | null>(null);
    const [rows, setRows] = React.useState(reportItems);
    const dummyExpense: Expense = {
        amount: 0,
        category: '',
        cardNumber: 0,
        description: '',
        memo: '',
        transactionDate: '',
        id: 0,
        postDate: '',
        type: ''
    }


    const setReport = (item: Expense | undefined) => {
        item ? setReportItem(item as Expense) : setReportItem(dummyExpense);
        setActiveReportItem(item);
    }

    const handleDeleteClick = (id: GridRowId) => () => {
        if (rows !== undefined) {
            ReportSetUp(rows.filter((row) => row.id !== id));
            setRows(rows.filter((row) => row.id !== id));
            setReport(undefined);
            console.log(`Delete: ${id} : ${JSON.stringify(rows.filter((row) => row.id !== id))}`);
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

    console.log(`selected Item: ${rows?.length} ${JSON.stringify(rows)}`);


    return (
        <>
            <Divider variant='middle' color='secondary' />
            <div style={{ width: 675 }}>
                <Container sx={{
                    margin: 3,
                    height: 375
                }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        // initialState={{
                        //     pagination: { paginationModel: { pageSize: 3 } },
                        // }}
                        // pageSizeOptions={[3, 7, 10]}
                        autoPageSize

                        onRowSelectionModelChange={(select) => {
                            const selectedIDs = new Set(select);
                            const selectedRows: Expense[] | undefined = reportItems?.filter((row: any) =>
                                selectedIDs.has(row.id)
                            );
                            // console.log(`grid select: ${select}`);
                            console.log(`grid selection: ${JSON.stringify(selectedRows)}`);
                            (selectedRows != undefined && selectedRows.length > 0) ? setReport(selectedRows[0]) : setReport(undefined);
                        }}
                    />
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
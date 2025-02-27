import React, { useState, useContext } from "react";
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, ButtonGroup, Snackbar, Alert, SnackbarCloseReason } from "@mui/material";
import { Expense, alertStatus, bankExpense } from "../types";
import axios from "axios";
import { styled } from '@mui/material/styles';
import { AuthContext } from "../hooks/useAuth";

const Statements: React.FC = () => {
    const { userInfo } = useContext(AuthContext);
    const [bankStatment, setBankStatement] = useState<bankExpense[] | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAlertOpen, setIsAlertOpen] = useState<alertStatus>({ open: false, message: "", severity: "info" });
    const api_url = `${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_API_VERSION}/expenses`;
    const auth = `Bearer ${localStorage.getItem("token")}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
    };
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log(`handleSelectFile: ${JSON.stringify(file)}`);
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text: string = e.target?.result as string;
            if (text) {
                const rows = text.split("\n");
                // console.log(`Before: ${rows}`); 
                const parsedExpenses: bankExpense[] = rows
                    .slice(1) // Skip the header
                    .filter((row) => row.trim() !== "") // Ignore empty rows
                    .map((row) => {
                        const [cardNumber, transactionDate, postDate, description, category, type, amount, memo] = row.split(",");
                        return {
                            "Transaction Date": transactionDate.trim(),
                            "Post Date": postDate.trim(),
                            Amount: amount.trim(),
                            Description: description.trim(),
                            Card: cardNumber.trim(),
                            Category: category?.trim(),
                            Type: type.trim(),
                            Memo: memo?.trim(),
                        };
                    });

                setFileName(event.target.files?.item(0)?.name ?? null)
                setBankStatement(parsedExpenses);
            }
        };
        reader.readAsText(file);
    };

    const handleUpload = (event: React.MouseEvent<HTMLElement>) => {
        const oData: bankExpense[] | null = bankStatment;
        console.log(`prepForApiCall: ${oData}`);
        if (oData) {
            let expenseObj: Expense[] = [];
            console.log(oData.length);
            console.log(oData[1]?.Category);
            console.log(oData);

            for (let i = 0; i < oData.length; i++) {
                expenseObj.push({
                    amount: Number(oData[i].Amount),
                    cardNumber: Number(oData[i].Card),
                    transactionDate: new Date(oData[i]["Transaction Date"]).toJSON(),
                    postDate: new Date(oData[i]["Post Date"]).toJSON(),
                    category: oData[i]?.Category,
                    description: oData[i].Description,
                    type: oData[i].Type,
                    memo: oData[i].Memo,
                    id: null,
                    reportID: null,
                    receiptUrl: undefined
                })
            }

            // Post data

            console.log(`Calling api: ${api_url}`);
            const postExpenses = async (finalExpense: Expense[]) => {
                try {
                    var request = JSON.stringify(finalExpense);
                    console.log(request);
                    const response = await axios.post(api_url, request, {
                        headers: userHeaders
                    });
                    console.log(`postExpenses: Response: ${JSON.stringify(response.data)}`);
                    if (response.data.statusCode === 200) {
                        handleClear(`${response.data.statusMessage}`);
                    } else {
                        handleClear(`Data upload unsuccessful: ${response.data.statusText}`);
                    }
                } catch (error) {
                    console.error("postExpenses: Error fetching data:", error);
                    handleClear("Failed to upload data.  Contact Tech Support.");
                } finally {
                    setLoading(false);
                }
            };
            postExpenses(expenseObj);
        }

    }

    const handleClear = (message: string | null) => {

        setBankStatement(null);
        setIsAlertOpen({ open: true, message: message ?? "Data Uploaded", severity: "info" });
        setFileName(null);
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

    return (
        <div style={{ padding: "16px" }}>
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
            <Button
                variant="contained"
                component="label"
                disabled={bankStatment ? true : false}
                sx={{ mb: 2 }}
            >
                Select File
                <VisuallyHiddenInput
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleSelectFile}
                />
            </Button>
            <Box sx={{
                float: "right"
            }}>
                <ButtonGroup disabled={bankStatment ? false : true}>
                    <Button variant='contained' color='secondary' onClick={handleUpload}>Upload</Button>
                    <Button variant='text' disableRipple disableFocusRipple sx={{
                        fontSize: 12,
                        paddingX: 5
                    }}
                        onClick={() => handleClear(null)}
                    >Clear</Button>
                </ButtonGroup>
            </Box>
            {fileName && <Typography variant='subtitle1' marginLeft={5}>{fileName}</Typography>}
            {bankStatment && <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Transaction Date</TableCell>
                            <TableCell>Post Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Card Number</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Memo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bankStatment?.map((bStatement, index) => (
                            <TableRow key={index}>
                                <TableCell>{bStatement["Transaction Date"]}</TableCell>
                                <TableCell>{bStatement["Post Date"]}</TableCell>
                                <TableCell>{bStatement.Amount}</TableCell>
                                <TableCell>{bStatement.Description}</TableCell>
                                <TableCell>{bStatement.Card}</TableCell>
                                <TableCell>{bStatement.Category}</TableCell>
                                <TableCell>{bStatement.Type}</TableCell>
                                <TableCell>{bStatement.Memo}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>}
        </div>
    );
};

export default Statements;
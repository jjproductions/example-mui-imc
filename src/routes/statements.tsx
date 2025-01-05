import React, { useState, useContext } from "react";
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, ButtonGroup } from "@mui/material";
import { Expense, bankExpense } from "../types";
import axios from "axios";
import { styled } from '@mui/material/styles';
import { AuthContext } from "../hooks/useAuth";

const Statements: React.FC = () => {
    const { token, userInfo } = useContext(AuthContext);
    const [bankStatment, setBankStatement] = useState<bankExpense[] | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
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
                            Category: category.trim(),
                            Type: type.trim(),
                            Memo: memo.trim(),
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
            console.log(oData[1].Category);
            console.log(oData);

            for (let i = 0; i < oData.length; i++) {
                expenseObj.push({
                    amount: Number(oData[i].Amount),
                    cardNumber: Number(oData[i].Card),
                    transactionDate: new Date(oData[i]["Transaction Date"]).toJSON(),
                    postDate: new Date(oData[i]["Post Date"]).toJSON(),
                    category: oData[i].Category,
                    description: oData[i].Description,
                    type: oData[i].Type,
                    memo: oData[i].Memo,
                    id: null
                })
            }

            // for (let i = 0; i < oData.length; i++) {
            //     expenseObj.push({
            //         Amount: Number(oData[i].Amount),
            //         CardNumber: Number(oData[i].Card),
            //         TransactionDate: new Date(oData[i]["Transaction Date"]).toJSON(),
            //         PostDate: new Date(oData[i]["Post Date"]).toJSON(),
            //         Category: oData[i].Category,
            //         Description: oData[i].Description,
            //         Type: oData[i].Type,
            //         Memo: oData[i].Memo
            //     })
            // }
            
            // Post data

            console.log(`Calling api: ${api_url}`);

            const postExpenses = async (finalExpense: Expense[]) => {
                try {
                    var request = JSON.stringify(finalExpense);
                    console.log(request);
                    const response = await axios.post(api_url, request, {
                        headers: userHeaders
                        });
                    handleClear("Data uploaded successfully!");
                } catch (error) {
                    console.error("Error fetching data:", error);
                    handleClear("Sorry, the data failed to upload");
                } finally {
                    setLoading(false);
                }
            };
            postExpenses(expenseObj);
        }

    }

    const handleClear = (message: string | null) => {
        
        setBankStatement(null);
        setFileName(message ?? null);
    }

    return (
        <div style={{ padding: "16px" }}>
            {/* <Typography variant="h5" gutterBottom>
                Upload bank statement
            </Typography> */}
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
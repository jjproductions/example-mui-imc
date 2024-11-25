import React, { useContext, useEffect, useState } from "react";
import { Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, ButtonGroup } from "@mui/material";
import { Expense, UserType } from "../types";
import axios from "axios";
import { api_domain } from "../utilities";
import { AuthContext } from "../hooks/useAuth";

const Expenses: React.FC = () => {
    const { token, userInfo } = useContext(AuthContext);
    const [tExpenses, setTExpenses] = useState<Expense[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [transMessage, setTransMessage] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const loggedInUser: UserType | null = userInfo;
    const api_url = loggedInUser?.isAdmin ? `${api_domain}/statements` : `${api_domain}/statements`;
    
    console.log(`userInfo: user:${userInfo?.user} role:${userInfo?.role} Admin:${userInfo?.isAdmin}`);

    const auth = `Bearer ${token}`;
    const userHeaders = {
      "Authorization": auth
    };

    const PopulateData = (data: Expense[]) => {
        console.log(`PopulateData: ${data.length} :: ${data[1].description}`);
    }

    const ControlVisibility = (message: string | null) => {
        setTransMessage(message ?? null);
    }

    useEffect(() => {
        const getExpenses = async () => {
            try {
                console.log(`Calling Api: ${api_url}`);
                const response = await axios.get(api_url, {
                    headers: userHeaders
                });
                const isMultipleTransactions: string = response.data.expenses.length > 1 ? `${response.data.expenses.length} transactions` : "1 transaction";
                const transCountMessage: string = response.data.expenses.length > 0 ? isMultipleTransactions : "No Transactions Available";
                ControlVisibility(transCountMessage);
                PopulateData(response.data.expenses);
                setTExpenses(response.data.expenses);
            } catch (error) {
                console.error("Error fetching data:", error);
                ControlVisibility("Sorry, the data failed to upload");
            } finally {
                setLoading(false);
            }
        };
        getExpenses();
    }, [selected]);

    const handleCreateReport = () => {
        console.log("Create Report");
    }
    

    return (
        <div style={{ padding: "16px" }}>
            {/* <Typography variant="h5" gutterBottom>
                Upload bank statement
            </Typography> */}
            {/* <Button
                variant="contained"
                component="label"
                disabled
                sx={{ mb: 2 }}
            >
                Select File
            </Button> */}
            <Box sx={{
                float: "right"
            }}>
                <ButtonGroup disabled={tExpenses ? false : true}>
                    <Button variant='contained' color='secondary' onClick={handleCreateReport}>Create Report</Button>
                </ButtonGroup>
            </Box>
            {transMessage && <Typography variant='subtitle1' marginLeft={5}>{transMessage}</Typography>}
            {tExpenses && <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                        {tExpenses.map((expense, index) => (
                            <TableRow key={index}>
                                <TableCell>{expense.transactionDate}</TableCell>
                                <TableCell>{expense.postDate}</TableCell>
                                <TableCell>{expense.amount}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>{expense.cardNumber}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell>{expense.type}</TableCell>
                                <TableCell>{expense.memo}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>}
        </div>
    );
};

export default Expenses;


import { Alert, Button, ButtonBase, ButtonGroup, Card, CardActions, CardContent, Collapse, Container, IconButton, IconButtonProps, Snackbar, SnackbarCloseReason, styled, Typography } from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import React, { PureComponent, useEffect, useState } from 'react'
import { useAppContext } from '../../hooks/useAppContext'
import { api_domain } from '../../utilities';
import axios from 'axios';
import { alertStatus, Expense, ReportInfo } from '../../types';
import { report } from 'process';
import { ButtonGraphic } from '../custom/graphicbutton';
import { ExpandMore } from '@mui/icons-material';


const AdminReports = () => {
    const api_url = `${api_domain}/reports/admin`;
    const [reportInfo, setReportInfo] = useState<ReportInfo[] | undefined>(undefined);
    const [cardArray, setCardArray] = useState<number[]>([]);
    const [cardCount, setCardCount] = useState<[string, number][]>([]);
    const [selectedCardExpenses, setSelectedCardExpenses] = useState<Expense[] | undefined>(undefined);
    const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
    const [isAlertOpen, setIsAlertOpen] = useState<alertStatus>({ open: false, message: "", severity: "info" });
    const [showExpenseGrid, setShowExpenseGrid] = useState<boolean>(false);
    const api_url_statements_report = `${api_domain}/statements/report`;
    const [expanded, setExpanded] = useState<boolean>(false);
    const [selectedCard, setSelectedCard] = useState<number>(0);
    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
        "Cache-Control": "no-cache"
    };

    interface ExpandMoreProps extends IconButtonProps {
        expand: boolean;
    }

    const ExpandMoreSection = styled((props: ExpandMoreProps) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
    })(({ theme }) => ({
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        variants: [
            {
                props: ({ expand }) => !expand,
                style: {
                    transform: 'rotate(0deg)',
                },
            },
            {
                props: ({ expand }) => !!expand,
                style: {
                    transform: 'rotate(180deg)',
                },
            },
        ],
    }));

    const hideGrid = () => {
        setShowExpenseGrid(false);
        setSelectedExpense(undefined);
    }

    const handleButtonClicks = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const action = Number(event.currentTarget.textContent);
        console.log(`handleButtonClicks: ${action} selected`);
        hideGrid();
    }

    const getAdminReports = async () => {
        try {
            const response = await axios(api_url, {
                headers: userHeaders
            });
            if (response.data !== null) {
                console.log(`AdminReports: getAdminReports: ${JSON.stringify(response.data)}`);
                setReportInfo(response.data);
                const cards: Set<number | undefined> = new Set(response.data?.map((report: ReportInfo) => report.cardNumber));
                const tmpCardArray = Array.from(cards).filter((card): card is number => card !== undefined);
                let tmpCardCount: [string, number][] = [];
                setCardArray(tmpCardArray);
                tmpCardArray.forEach((card: number) => {
                    const count = response.data?.filter((report: ReportInfo) => report.cardNumber === card).length;
                    tmpCardCount.push([card.toString(), count]);
                    console.log(`AdminReports: getAdminReports: ${card} has ${count} reports`);
                });
                setCardCount(tmpCardCount);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        console.log(`AdminReports: useEffect:  reportInfo: ${JSON.stringify(reportInfo)}`);
        getAdminReports();

    }, []);

    const handleExpandState = (card: number): boolean => {
        console.log(`AdminReports:handleExpandState: expanded:${expanded} selectedCard:${selectedCard} ${card} :: ${expanded && selectedCard === card}`);
        return expanded && selectedCard === card;
    }

    const createCardReports = () => {
        console.log(`AdminReports:createCardReports: card array ${JSON.stringify(cardArray)}`);
        return (
            <>
                {cardArray.map((card) => (
                    console.log(`createCardReports: card count: ${JSON.stringify(cardCount)}`),
                    <Card
                        key={card}
                        sx={{ minWidth: 175 }}
                    >
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {card}
                            </Typography>
                            <Typography variant="body2">
                                You have {cardCount.find((count) => count[0] === card.toString())?.[1]} reports to review.
                            </Typography>
                            {/*  */}
                        </CardContent>
                        <CardActions>
                            <ExpandMoreSection
                                onClick={() => handleExpandClick(card)}
                                aria-expanded={handleExpandState(card)}
                                aria-label="show more"
                                expand={handleExpandState(card)}
                                sx={{
                                    transform: handleExpandState(card) ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: (theme) =>
                                        theme.transitions.create("transform", {
                                            duration: theme.transitions.duration.shortest,
                                        }),
                                }}
                            >
                                <ExpandMore />
                            </ExpandMoreSection>
                        </CardActions>
                        <Collapse in={handleExpandState(card)} timeout="auto" unmountOnExit>
                            <CardContent>
                                {reportInfo?.filter((reports: ReportInfo) => reports.cardNumber === card).map((report: ReportInfo) => (
                                    <ButtonGraphic
                                        text={report.name}
                                        onClick={() => handleReportClick(report.id)}
                                        key={report.id}
                                    />
                                ))}
                            </CardContent>
                        </Collapse>
                    </Card>
                ))}
            </>
        )
    }

    const handleExpandClick = (card: number) => {
        console.log(`AdminReports: handleExpandClick: ${expanded}`);
        setExpanded(selectedCard === card ? !expanded : true);
        setSelectedCard(card);
        const rptInfo: ReportInfo[] | undefined = reportInfo?.filter((report: ReportInfo) => report.cardNumber === card);
        console.log(`AdminReports: handleExpandClick: ${JSON.stringify(rptInfo)}`);

    };

    const handleReportClick = async (card: number) => {
        console.log(`AdminReports: handleCardClick: ${card}`);
        try {
            console.log(`Calling Api: ${api_url_statements_report}?id=${card}`);
            const response = await axios.get(api_url_statements_report + "?id=" + card, {
                headers: userHeaders
            });
            if (response.data.expenses !== null) {
                //const selectedCardExpenses: Expense[] | undefined = response.data.expenses?.filter((expense: Expense) => expense.cardNumber === card);
                console.log(`AdminReports: handleButtonClicks: ${JSON.stringify(response.data.expenses)}`);
                setSelectedCardExpenses(response.data.expenses);
                setShowExpenseGrid(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setShowExpenseGrid(false);
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

    interface ColumnActions {
        id: GridRowId;
    }

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'Id', width: 60 },
        // {
        //     field: 'receiptImg', type: 'actions', headerName: '', width: 50,
        //     getActions: ({ id }: ColumnActions) => {
        //         const receiptUrl = selectedCardExpenses?.find((row) => row.id === id)?.receiptUrl;
        //         return receiptUrl ? [
        //             <GridActionsCellItem
        //                 icon={<ReceiptIcon />}
        //                 label="Receipt"
        //                 onClick={handleReceiptClick(id)}
        //                 color="inherit"
        //             />
        //         ] : [];
        //     },
        // },
        { field: 'transactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 100 },
        { field: 'description', headerName: 'Description', width: 240 }
    ]

    const createExpensesGrid = () => {
        return (
            <DataGrid
                rows={selectedCardExpenses}
                columns={columns}
                autoPageSize
                onRowSelectionModelChange={(select) => {
                    const selectedIDs = new Set(select);
                    const selectedRows: Expense[] | undefined = selectedCardExpenses?.filter((row: any) =>
                        selectedIDs.has(row.id)
                    );
                    (selectedRows != undefined && selectedRows.length > 0) && setSelectedExpense(selectedRows[0]);
                }}
            />
        )
    }

    return (
        <div>
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
            <ButtonGroup variant='outlined' color='primary' aria-label='contained primary button group'
                sx={{ marginLeft: 50, gap: 1, marginTop: 0 }}>
                <Button
                    onClick={handleButtonClicks}
                    sx={{ marginLeft: 40, marginTop: 1 }}
                    disabled={!showExpenseGrid}
                >
                    Approve
                </Button>
                <Button
                    variant='contained'
                    onClick={handleButtonClicks}
                    sx={{ marginLeft: 40, marginTop: 1 }}
                    disabled={!showExpenseGrid}
                >
                    Return
                </Button>
            </ButtonGroup>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', marginLeft: '20px' }}>
                {createCardReports()}
            </div>
            <Container sx={{
                margin: 2,
                height: 375,
                width: 725,
            }}>
                {showExpenseGrid && createExpensesGrid()}
            </Container>
        </div>
    )
}

export default AdminReports
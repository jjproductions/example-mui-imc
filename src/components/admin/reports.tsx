import { Alert, Button, ButtonBase, ButtonGroup, Card, CardActions, CardContent, Collapse, Container, IconButton, IconButtonProps, Snackbar, SnackbarCloseReason, styled, Typography } from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import React, { PureComponent, useEffect, useState } from 'react'
import { useAppContext } from '../../hooks/useAppContext'
import { api_domain } from '../../utilities';
import axios from 'axios';
import { alertStatus, Expense, ReportInfo, ReportRequest, reportStatus } from '../../types';
import { report } from 'process';
import { ButtonGraphic } from '../custom/graphicbutton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ViewImageSelection } from '../report/imageViewer';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const AdminReports = () => {
    const api_url = `${api_domain}/reports/admin`;
    const [reportInfo, setReportInfo] = useState<ReportInfo[] | undefined>(undefined); // holds report information
    const [cardArray, setCardArray] = useState<number[]>([]);
    const [cardCount, setCardCount] = useState<[string, number][]>([]);
    const [selectedCardExpenses, setSelectedCardExpenses] = useState<Expense[] | undefined>(undefined); // holds expenses for a selected report
    const [isAlertOpen, setIsAlertOpen] = useState<alertStatus>({ open: false, message: "", severity: "info" });
    const [showExpenseGrid, setShowExpenseGrid] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [selectedCard, setSelectedCard] = useState<number>(0); // the card number selected
    const api_url_statements_report = `${api_domain}/statements/report`;
    const api_url_reports_update = `${api_domain}/reports/update`;
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
        setSelectedCardExpenses(undefined);
    }

    const handleButtonClicks = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const action = event.currentTarget.textContent;
        console.log(`handleButtonClicks: ${action} selected`);
        let selection: reportStatus = reportStatus.RETURNED;
        try {
            switch (action) {
                case "Approve":
                    selection = reportStatus.APPROVED;
                    break;
                case "Return":
                    selection = reportStatus.RETURNED
                    break;
                default:
                    break;
            }

            if (selectedCardExpenses) {
                const rptInfo: ReportInfo | undefined = reportInfo?.find((report: ReportInfo) => report.id === selectedCardExpenses[0].reportID);
                const request: ReportRequest = {
                    "reportid": rptInfo?.id as number,
                    "status": selection,
                    "memo": rptInfo?.memo
                };
                console.log(`handleButtonClicks: Call api ${api_url_reports_update} for reportId`);
                const response = await axios.post(api_url_reports_update, request, {
                    headers: userHeaders
                });
                if (response.data !== null) {
                    console.log(`handleButtonClicks: ${action} selected returned: ${JSON.stringify(response.data)}`);
                    setReportInfo((prevReportInfo) => {
                        return prevReportInfo?.filter((report: ReportInfo) =>
                            report.id !== rptInfo?.id
                        );
                    });
                    // Update the card count - remove the card if there is only one report
                    if (cardCount.find((count) => count[0] === rptInfo?.cardNumber?.toString())?.[1] === 1) {
                        setCardCount((prevCardCount) => {
                            return prevCardCount.filter((count) => count[0] !== rptInfo?.cardNumber?.toString());
                        });
                        setCardArray((prevCardArray) => {
                            return prevCardArray.filter((card) => card !== rptInfo?.cardNumber);
                        });
                    } else {// decrement the count
                        setCardCount((prevCardCount) => {
                            return prevCardCount.map((count) => {
                                if (count[0] === rptInfo?.cardNumber?.toString()) {
                                    return [count[0], count[1] - 1];
                                }
                                return count;
                            });
                        });
                    }
                    setIsAlertOpen({ open: true, message: `Expense successfully ${action}`, severity: "success" });
                } else {
                    setIsAlertOpen({ open: true, message: "Error processing request", severity: "error" });
                }
            }
        } catch (error) {
            console.error(`Error processnig request to ${action} the report`, error);
            setIsAlertOpen({ open: true, message: `Error processing request to ${action} the report`, severity: "error" });
        }
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
        const settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 2
        };
        return (
            <div style={{ width: "75%", margin: "0 auto" }}>
                <Slider {...settings}>
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
                                    <ExpandMoreIcon />
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
                </Slider>
            </div>
        )
    }
    // This function will expand the card to show the reports associated with that card.
    const handleExpandClick = (card: number) => {
        console.log(`AdminReports: handleExpandClick: ${expanded}`);
        setExpanded(selectedCard === card ? !expanded : true);
        setSelectedCard(card);
        const rptInfo: ReportInfo[] | undefined = reportInfo?.filter((report: ReportInfo) => report.cardNumber === card);
        console.log(`AdminReports: handleExpandClick: ${JSON.stringify(rptInfo)}`);

    };
    // Selecting a report will display the expenses associated with that report.
    const handleReportClick = async (rptId: number) => {
        console.log(`AdminReports: handleReportClick: ${rptId}`);
        try {
            console.log(`AdminReports: handleReportClick: Calling Api: ${api_url_statements_report}?id=${rptId}`);
            const response = await axios.get(api_url_statements_report + "?id=" + rptId, {
                headers: userHeaders
            });
            if (response.data.expenses !== null) {
                //const selectedCardExpenses: Expense[] | undefined = response.data.expenses?.filter((expense: Expense) => expense.cardNumber === card);
                console.log(`AdminReports: handleReportClick: ${JSON.stringify(response.data.expenses)}`);
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
        {
            field: 'receiptImg', type: 'actions', headerName: '', width: 50,
            getActions: ({ id }: ColumnActions) => {
                const receiptUrl = selectedCardExpenses?.find((row) => row.id === id)?.receiptUrl;
                return receiptUrl ? [
                    <GridActionsCellItem
                        icon={<ReceiptIcon />}
                        label="Receipt"
                        onClick={ViewImageSelection(id, selectedCardExpenses)}
                        color="inherit"
                    />
                ] : [];
            },
        },
        { field: 'transactionDate', headerName: 'Transaction Date', width: 150 },
        { field: 'amount', headerName: 'Amount', width: 100 },
        { field: 'description', headerName: 'Description', width: 240 },
        { field: 'category', headerName: 'Category', width: 180 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'memo', headerName: 'Memo', width: 240 }
    ]

    const createExpensesGrid = () => {
        return (
            <DataGrid
                rows={selectedCardExpenses}
                columns={columns}
                autoPageSize
            />
        )
    }
    console.log(`AdminReports: Name - ${JSON.stringify(reportInfo?.find((report: ReportInfo) => report?.id === selectedCardExpenses?.[0].reportID)?.name)}`);
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
                sx={{ marginRight: 5, gap: 1, marginTop: -1, width: 500, float: 'right' }}>
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
            <Typography variant='h5' component='span' sx={{ marginLeft: 50, marginTop: 0, width: '50%' }}>
                {reportInfo?.find((report: ReportInfo) => report?.id === selectedCardExpenses?.[0].reportID)?.name ?? "Select a Report"}
            </Typography>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', marginLeft: '20px' }}>
                {createCardReports()}
            </div>
            <Container sx={{
                margin: 4,
                height: 375,
                width: 1025,
            }}>
                {showExpenseGrid && createExpensesGrid()}
            </Container>
        </div>
    )
}

export default AdminReports
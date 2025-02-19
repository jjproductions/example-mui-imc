import React, { useContext, useEffect, useState } from "react";
import { Button, Typography, Box, ButtonGroup, Select, OutlinedInput, MenuItem, SelectChangeEvent, Theme, useTheme } from "@mui/material";
import { Expense, gridType, users, UserType } from "../types";
import axios from "axios";
import { api_domain, getCCUsers } from "../utilities";
import { AuthContext } from "../hooks/useAuth";
import { GridView } from "../components/gridView";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { report } from "process";

const Expenses: React.FC = () => {
    const { userInfo } = useContext(AuthContext);
    const { newReportItems, ReportSetUp, setCurrReportItemsToDelete } = useAppContext();
    const [tExpenses, setTExpenses] = useState<Expense[] | undefined>(undefined);  //used for gridview
    const [loading, setLoading] = useState<boolean>(false);
    const [transMessage, setTransMessage] = useState<string | null>(null);
    const [selected, setSelected] = useState<number>(-1); //used for staff selection
    const [users, setUsers] = useState<users[]>([]); //used for staff
    const navigate = useNavigate();
    const loggedInUser: UserType | null = userInfo;
    let api_url = `${api_domain}/statements`;
    const api_url_users = `${api_domain}/users?allusers=1`;
    let gridConfig: gridType = { items: tExpenses, showCheckBox: !userInfo?.isAdmin };

    //console.log(`userInfo: user:${userInfo?.user} role:${userInfo?.role} Admin:${userInfo?.isAdmin}`);

    // console.log(`tExpenses: ${JSON.stringify(tExpenses)}`);

    const theme = useTheme();
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
    };

    const PopulateData = (data: Expense[] | undefined) => {
        if (data !== undefined || data !== null) {
            setTExpenses(data);
            data && console.log(`PopulateData: ${data.length} :: ${JSON.stringify(data[0])}`);
        }
    }

    const ControlVisibility = (message: string | null) => {
        setTransMessage(message ?? null);
    }

    useEffect(() => {
        ReportSetUp(undefined, "NEWREPORT");
        ReportSetUp(undefined, "CURRENTREPORT");
        //setCurrReportExpenses(undefined);
        setCurrReportItemsToDelete([]);
        console.log(`expenses: load: users - ${JSON.stringify(users)} :: is Admin ${userInfo?.isAdmin}`);
        const getUsers = async () => {
            try {
                console.log(`getUsers: userInfo: ${userInfo?.isAdmin}`);
                if (userInfo?.isAdmin && (users == null || users.length === 0)) {
                    // Get all CC Users
                    console.log(`getUsers: Calling Api: ${api_url_users}`);
                    const response = await axios.get(api_url_users, {
                        headers: userHeaders
                    });
                    console.log(`getUsers: users: ${response.data.users}`);
                    if (response && response.data.users.length > 1) {
                        setUsers(response.data.users);
                    }
                    else
                        console.log("getUsers: NO DATA");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                ControlVisibility("Sorry, the data failed to upload");
            } finally {
                setLoading(false);
            }
        };
        console.log(`getUsers: selected: ${selected}`);
        getUsers();
    }, [selected]);


    useEffect(() => {
        const getExpenses = async () => {
            try {
                //Staff use case
                if (!userInfo?.isAdmin) {
                    api_url = `${api_url}`;
                }
                //Admin use case
                else if (userInfo?.isAdmin) {
                    api_url = selected > -1 ? `${api_url}?id=${selected}` : "";
                }

                if (api_url !== "") {
                    console.log(`Calling Api: ${api_url}`);
                    const response = await axios.get(api_url, {
                        headers: userHeaders
                    });
                    const isMultipleTransactions: string = response?.data?.expenses?.length > 1 ? `${response.data.expenses.length} transactions` : "1 transaction";
                    const transCountMessage: string = response?.data?.expenses?.length > 0 ? isMultipleTransactions : "No Transactions Available";
                    ControlVisibility(transCountMessage);
                    if (response?.data?.expenses?.length > 0) {
                        PopulateData(response.data.expenses);
                    }
                    else
                        PopulateData(undefined);

                }
            }
            catch (error) {
                console.log("Get Statement Error");
            }
            finally {
                setLoading(false);
            }
        };
        getExpenses();
    }, [selected]);

    const handleCreateReport = () => {
        console.log("Create Report" + { newReportItems });
        ReportSetUp(newReportItems, "CURRENTREPORT");
        navigate(`../reports`)
    }

    const handleStaffSelection = (event: SelectChangeEvent<typeof selected>) => {
        const {
            target: {
                value
            }
        } = event;
        console.log(`handle staff selection: ${value as number}`);
        setSelected(
            // On autofill we get a stringified value.
            value as number
        );
    }


    function getStyles(name: string, theme: Theme, user: string) {
        return {
            fontWeight: user?.includes(name)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
        };
    }

    console.log(`Report visibility: ${!(newReportItems !== undefined && newReportItems.length > 0 ? false : true)}`);
    return (
        <div style={{ padding: "16px" }}>
            <Box sx={{
                float: "right"
            }}>
                {!userInfo?.isAdmin ? (
                    <ButtonGroup disabled={(newReportItems !== undefined && newReportItems.length > 0 ? false : true)}>
                        <Button variant='contained' color='secondary' onClick={handleCreateReport}>Create Report</Button>
                    </ButtonGroup>
                ) : (
                    <Select
                        labelId="staff-selection"
                        id="staff-selection"
                        //multiple
                        value={selected}
                        onChange={handleStaffSelection}
                        input={<OutlinedInput
                            id="staff-selection"
                            label="Staff"
                            aria-label="staff-selection"
                        // margin='dense'    
                        />}
                        fullWidth
                        MenuProps={MenuProps}
                        sx={{
                            fontSize: 25
                        }}
                    >
                        {users.map((user) => (
                            <MenuItem
                                key={user.card}
                                value={user.card}
                                style={getStyles(user.name, theme, user.name)}
                            >
                                {user.name}
                            </MenuItem>
                        ))}
                    </Select>
                )}
            </Box>
            {transMessage && <Typography variant='subtitle1' marginLeft={5}>{transMessage}</Typography>}
            {tExpenses && <GridView config={gridConfig} />}
        </div>
    );
};

export default Expenses;


import React, { useContext, useEffect, useState } from "react";
import { Button, Typography, Box, ButtonGroup, Select, OutlinedInput, MenuItem, SelectChangeEvent, Theme, useTheme } from "@mui/material";
import { Expense, gridType, users, UserType } from "../types";
import axios from "axios";
import { api_domain, getCCUsers } from "../utilities";
import { AuthContext } from "../hooks/useAuth";
import { GridView } from "../components/gridView";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const Expenses: React.FC = () => {
    const { userInfo } = useContext(AuthContext);
    const { reportItems, ReportSetUp } = useAppContext();
    const [tExpenses, setTExpenses] = useState<Expense[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [transMessage, setTransMessage] = useState<string | null>(null);
    const [selected, setSelected] = useState<number>(-1);
    const [users, setUsers] = useState<users[]>([]);
    const navigate = useNavigate();
    const loggedInUser: UserType | null = userInfo;
    let api_url = `${api_domain}/statements`;
    let gridConfig: gridType = { items: tExpenses, showCheckBox: !userInfo?.isAdmin};
    
    //console.log(`userInfo: user:${userInfo?.user} role:${userInfo?.role} Admin:${userInfo?.isAdmin}`);

    console.log(`tExpenses: ${JSON.stringify(tExpenses)}`);

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

    const PopulateData = (data: Expense[]) => {
        console.log(`PopulateData: ${data.length} :: ${data[1].description}`);
    }

    const ControlVisibility = (message: string | null) => {
        setTransMessage(message ?? null);
    }

    useEffect(() => {
        const getUsers = async () => {
            try {
                if (userInfo?.isAdmin && (users == null || users.length === 0)) {
                    // Get all CC Users
                    const response: users[] = await getCCUsers();
                    console.log(`getUsers first response: ${response.length}`);
                    if (response && response.length > 1)
                    {
                        setUsers(response);
                    }
                    else
                        console.log("NO DATA");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                ControlVisibility("Sorry, the data failed to upload");
            } finally {
                setLoading(false);
            }
        };
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
                    
                if (api_url != "") 
                {
                    console.log(`Calling Api: ${api_url}`);
                    const response = await axios.get(api_url, {
                        headers: userHeaders
                    });
                    const isMultipleTransactions: string = response?.data?.expenses?.length > 1 ? `${response.data.expenses.length} transactions` : "1 transaction";
                    const transCountMessage: string = response?.data?.expenses?.length > 0 ? isMultipleTransactions : "No Transactions Available";
                    ControlVisibility(transCountMessage);
                    if (response?.data?.expenses?.length > 0){
                        PopulateData(response.data.expenses);
                        console.log(`length: ${response.data.expenses.length} :: expense response: ${JSON.stringify(response.data.expenses)}`);
                        setTExpenses(response.data.expenses);
                    }
                    else
                        setTExpenses(undefined);
                    
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
        console.log("Create Report");
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
      
    return (
        <div style={{ padding: "16px" }}>
            <Box sx={{
                float: "right"
            }}>
                {!userInfo?.isAdmin ? (
                    <ButtonGroup disabled={tExpenses ? false : true}>
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


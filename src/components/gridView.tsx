// import React, { useContext, useState } from 'react'
import { Expense, gridType } from "../types";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container } from '@mui/material';
import { useAppContext } from '../hooks/useAppContext';


export const GridView = ({ config }: { config: gridType }) => {
  // const [selectedRows, setSelectedRows] = useState<Expense[] | undefined>(undefined);
  const { ReportSetUp } = useAppContext();
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Id', width: 60 },
    { field: 'transactionDate', headerName: 'Transaction Date', width: 150 },
    { field: 'postDate', headerName: 'Post Date', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'description', headerName: 'Description', width: 150 },
    { field: 'cardNumber', headerName: 'Card', width: 75 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'type', headerName: 'Type', width: 85 },
    { field: 'memo', headerName: 'Memo', width: 150 }
  ];

  return (
    <div style={{ height: 300, width: '100%' }}>
      <Container sx={{
        margin: 10
      }}>
        <DataGrid
          rows={config.items}
          columns={columns}
          checkboxSelection={config.showCheckBox}
          onRowSelectionModelChange={(select) => {
            const selectedIDs = new Set(select);
            const selectedRows: Expense[] = config?.items?.filter((row: any) =>
              selectedIDs.has(row.id)
            ) as Expense[];
            console.log(`grid select: ${select}`);
            console.log(`grid selection: ${JSON.stringify(selectedRows)}`);
            // setSelectedRows(selectedRows);
            ReportSetUp(selectedRows, "INITIALREPORT");
          }}
          sx={{
            // margin: 5
          }}
        />
      </Container>
    </div>
  )
}
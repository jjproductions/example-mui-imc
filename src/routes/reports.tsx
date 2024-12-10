import React from 'react'
import { GridView } from '../components/gridView'
import { Expense } from '../types'
import { useAppContext } from '../hooks/useAppContext'; 
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';

const Reports = () => {
  const { reportItems } = useAppContext();

  //console.log(`Report: ${JSON.parse(JSON.stringify(reportItems))}`);
  
const rptCard = ({ item } : { item:Expense } ) => (
  <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        {/* <CardMedia
          component="img"
          height="140"
          image="/static/images/cards/contemplative-reptile.jpg"
          alt="green iguana"
        /> */}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {item.description}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {item.transactionDate}
            {item.amount}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
)

  return (
  
    //   {reportItems?.map((value, index) => {
    //       rptCard(value);
    //   })}
    <>
    {reportItems?.map((value, index) => {
      return (
        <Card sx={{ maxWidth: 345 }}>
          <CardActionArea>
            <CardContent sx={{
                // padding: 0,
                mx: 5
            }}>
              <Typography gutterBottom variant="h6" component="div">
                  {value.description}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {value.transactionDate.substring(0,10)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ${value.amount}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
    )})};
    </>
  );
}

export default Reports
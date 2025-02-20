import { GridRowId } from '@mui/x-data-grid';
import React from 'react'
import { Expense, receiptImageInfo, sasTokenRefreshRequest } from '../../types';
import { api_domain, sasIsTokenCached, sasTokenCacheUpdate } from '../../utilities';
import axios from 'axios';

export const ViewImageSelection = (id: GridRowId, expenses: Expense[]) => async () => {
    const auth = `Bearer ${localStorage.getItem('token')}`;
    const userHeaders = {
        "Authorization": auth,
        "Content-Type": 'application/json',
    };
    const api_url_signin_sastoken = `${api_domain}/signin/sastoken`;

    let tmpReceipt: string | undefined = expenses?.find((row) => row.id === id)?.receiptUrl;

    if (tmpReceipt) {
        console.log(`handleReceiptClick: ${id as number} :: tmpReceipt: ${JSON.stringify(tmpReceipt)}`);
        // this shows images from a new report not yet saved; this is the full URL without SAS token
        if (tmpReceipt?.startsWith("http")) {
            // const receiptInfo: receiptImageInfo = receiptImg?.find((row) => row.expenseId === id) as receiptImageInfo;
            // tmpReceipt = URL.createObjectURL(receiptInfo.image);
        }
        else {
            // Check in local storaqge to get full URL with SAS token
            try {
                const cachedToken: string | undefined = sasIsTokenCached(tmpReceipt);
                if (!cachedToken) {  // Has expired and needs to be refreshed
                    const blobName = tmpReceipt;
                    console.log(`handleReceiptClick: ${id as number} :: bloblName: ${JSON.stringify(blobName)}`);
                    const request: sasTokenRefreshRequest = {
                        "blobName": blobName as string,
                    };
                    if (blobName === "") {
                        console.error(`handleReceiptClick:Blob name is invalid: ${blobName}`);
                        //setIsAlertOpen({ open: true, message: "Can not display image receipt.", severity: "error" });
                        tmpReceipt = undefined;
                    }
                    // Change to an Azure function to get SAS token
                    const sasToken = await axios.post(api_url_signin_sastoken, request, {
                        headers: userHeaders
                    });
                    console.log(`handleReceiptClick:Blob URL with SAS: ${sasToken}`);
                    tmpReceipt = sasToken.data;
                    sasTokenCacheUpdate(tmpReceipt as string);   // Update the cache with the refreshed token
                }
                else { // No need to refresh token
                    tmpReceipt = cachedToken;
                    console.log(`handleReceiptClick:SAS Token is still valid`);
                }
            } catch (error) {
                console.error("handleReceiptClick:Error fetching data:", error);
                //setIsAlertOpen({ open: true, message: "Can not display image receipt.", severity: "error" });
                tmpReceipt = undefined;
            }
        }
        tmpReceipt && window.open(tmpReceipt, "_blank");
    }
}
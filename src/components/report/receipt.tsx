import React, { useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import { useAppContext } from "../../hooks/useAppContext";
import { Expense, receiptImageInfo } from "../../types";


const UploadReceipt = () => {
    const { currReportExpenses, ReportSetUp, activeReportItem, receiptImg, setReceiptImg, setEditInProgressFlag, setAlertMsg } = useAppContext();
    const [receiptImage, setReceiptImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & EventTarget;
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log(`File selected: ${JSON.stringify(file.size)}`);
            setAlertMsg({ open: false, message: "", severity: "info" });
            setReceiptImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAttach = () => {
        if (!receiptImage) {
            // alert("Please provide a receipt image.");
            setAlertMsg({ open: true, message: "Please provide a receipt image.", severity: "error" });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("receiptImage", receiptImage);

            console.log(`Receipt Image: ${JSON.stringify(receiptImage.size)} :: ${receiptImage.type}`);
            //const updateExpense: Expense = { ...activeReportItem as Expense, receiptImg: receiptImage.name };
            let receiptCollection: receiptImageInfo[] = receiptImg as receiptImageInfo[];
            const receiptInfo: receiptImageInfo = {
                name: receiptImage.name,
                image: receiptImage,
                contentType: receiptImage.type,
                expenseId: activeReportItem?.id as number,
                reportId: activeReportItem?.reportID as number
            }
            receiptCollection.push(receiptInfo);
            console.log(`Receipt Collection: count:${receiptCollection.length} :: ${JSON.stringify(receiptInfo)}`);
            console.log(`Receipt Collection: id:${activeReportItem?.id} :: ${JSON.stringify(receiptImage.name)}`);
            ReportSetUp(currReportExpenses?.map(exp =>
                exp.id === activeReportItem?.id ? { ...exp, receiptUrl: URL.createObjectURL(receiptImage).replace("blob:", "").trim() } : exp) as Expense[],
                "CURRENTREPORT"); // update receipt image name as placeholder in current expense.  This will be updated when the report is saved and i have the image URI
            setReceiptImg(receiptCollection); //add to receipt image array
            setReceiptImage(null);
            setPreviewUrl(null);
            setEditInProgressFlag(true);
            // alert("Receipt attached successfully.");
            setAlertMsg({ open: true, message: "Receipt attached successfully.", severity: "success" });

        } catch (error) {
            console.error("Error uploading data:", error);
            alert("An error occurred while uploading. Please try again.");
            setAlertMsg({ open: true, message: "An error occurred while uploading. Please try again.", severity: "error" });
        }
    };

    return (
        <div >
            <Card>
                <CardContent sx={{ width: "175px", height: "50%" }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'block', marginBottom: '16px' }}

                    />
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Receipt Preview"
                            style={{ maxWidth: '100%', marginBottom: '16px' }}
                        />
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAttach}
                        fullWidth
                    >
                        Attach
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default UploadReceipt;

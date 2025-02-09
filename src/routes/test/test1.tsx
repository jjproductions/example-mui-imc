import React, { useState } from "react";
import { Button, Card, CardContent, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const UploadReceipt_Test: React.FC = () => {
    const [receiptImage, setReceiptImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [rows, setRows] = useState([
        { id: 1, name: "Item 1", description: "Description 1", receiptUploaded: false },
        { id: 2, name: "Item 2", description: "Description 2", receiptUploaded: false },
    ]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReceiptImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (id: number) => {
        if (!receiptImage) {
            alert("Please provide a receipt image.");
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("receiptImage", receiptImage);

        try {
            const response = await fetch("https://your-api-endpoint.com/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Receipt uploaded successfully.");
                setRows((prevRows) => prevRows.map(row => row.id === id ? { ...row, receiptUploaded: true } : row));
                setReceiptImage(null);
                setPreviewUrl(null);
            } else {
                alert("Failed to upload. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading data:", error);
            alert("An error occurred while uploading. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "name", headerName: "Name", flex: 1 },
        { field: "description", headerName: "Description", flex: 1 },
        {
            field: "receipt",
            headerName: "Receipt",
            width: 120,
            renderCell: (params) => (
                params.row.receiptUploaded ? (
                    <UploadFileIcon color="primary" />
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpload(params.row.id)}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload"}
                    </Button>
                )
            ),
        },
    ];

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <CardContent className="p-4 space-y-4">
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

                    <DataGrid rows={rows} columns={columns} autoHeight />
                </CardContent>
            </Card>
        </div>
    );
};

export default UploadReceipt_Test;

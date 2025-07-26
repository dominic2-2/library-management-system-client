"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Box, Paper, Typography, Grid } from "@mui/material";
import { ENV } from "@/config/env";

export default function CreateLoanPage() {
  const [barcode, setBarcode] = useState("");
  const [bookInfo, setBookInfo] = useState<any>(null);

  const [userQuery, setUserQuery] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);

  // ngày phải trả
  const [dueDate, setDueDate] = useState("");

  // min / max cho date input
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const plus7 = new Date(today);
    plus7.setDate(today.getDate() + 7);

    const plus14 = new Date(today);
    plus14.setDate(today.getDate() + 14);

    const toISO = (d: Date) => d.toISOString().split("T")[0];

    setMinDate(toISO(tomorrow));
    setMaxDate(toISO(plus14));
    setDueDate(toISO(plus7));
  }, []);

  const handleLoadBook = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${ENV.apiUrl}/loans/book?barcode=${barcode}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      alert("Không tìm thấy sách!");
      return;
    }
    const data = await res.json();
    setBookInfo(data);
  };

  const handleLoadUser = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${ENV.apiUrl}/loans/user?query=${userQuery}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      alert("Không tìm thấy người dùng!");
      return;
    }
    const data = await res.json();
    setUserInfo(data);
  };

  const handleCreateLoan = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${ENV.apiUrl}/loans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: userInfo.userId,
        copyId: bookInfo.copyId,
        dueDate,
      }),
    });

    if (res.ok) {
      alert("Tạo mượn sách thành công");
      setBookInfo(null);
      setUserInfo(null);
      setDueDate(minDate);
      setBarcode("");
      setUserQuery("");
    } else {
      const errorMessage = await res.text();
      alert(`Tạo mượn sách thất bại: ${errorMessage}`);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Mượn Sách
      </Typography>

      <Grid container spacing={3}>
        {/* BOOK */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin Sách
            </Typography>
            <TextField
              label="Barcode sách"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleLoadBook}>
              Load Sách
            </Button>

            {bookInfo && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <b>Barcode:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.barcode}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Trạng thái:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.copyStatus}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Vị trí:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.location}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Tiêu đề sách:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.title}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Tựa volume:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.volumeTitle}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Tác giả:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.authors.join(", ")}
                  </Grid>
                  <Grid item xs={6}>
                    <b>NXB:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.publisherName}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Ấn bản:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.editionName}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Năm XB:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.publicationYear}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Bìa:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.coverTypeName}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Giấy:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.paperQualityName}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Giá:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.price}
                  </Grid>
                  <Grid item xs={6}>
                    <b>ISBN:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.isbn}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Ghi chú:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {bookInfo.notes}
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* USER */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin Người mượn
            </Typography>
            <TextField
              label="Username / Email / Phone"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleLoadUser}>
              Load Người mượn
            </Button>

            {userInfo && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <b>Username:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {userInfo.username}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Họ tên:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {userInfo.fullName}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Email:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {userInfo.email}
                  </Grid>
                  <Grid item xs={6}>
                    <b>Phone:</b>
                  </Grid>
                  <Grid item xs={6}>
                    {userInfo.phone}
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* DATE + SUBMIT */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ngày phải trả
            </Typography>
            <TextField
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              inputProps={{ min: minDate, max: maxDate }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCreateLoan}
              disabled={!bookInfo || !userInfo || !dueDate}
            >
              Xác nhận Mượn Sách
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

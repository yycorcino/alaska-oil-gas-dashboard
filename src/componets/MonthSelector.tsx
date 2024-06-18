"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Button, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

const MonthSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  useEffect(() => {
    const pathParts = pathname.split("/");
    const datePart = pathParts[pathParts.length - 1];

    if (datePart) {
      const [month, year] = datePart.split("-");
      const parsedDate = dayjs(`${year}-${month}-01`);
      if (parsedDate.isValid()) {
        setSelectedDate(parsedDate);
      }
    }
  }, [pathname]);

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setSelectedDate(newValue);
      router.push(`/dashboard/${newValue.format("MM-YYYY")}`);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedDate) {
      const newDate = selectedDate.subtract(1, "month");
      setSelectedDate(newDate);
      router.push(`/dashboard/${newDate.format("MM-YYYY")}`);
    }
  };

  const handleNextMonth = () => {
    if (selectedDate) {
      const newDate = selectedDate.add(1, "month");
      setSelectedDate(newDate);
      router.push(`/dashboard/${newDate.format("MM-YYYY")}`);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" alignItems="center" gap="8px">
        <span>Month of </span>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          views={["year", "month"]}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: "150px",
                }}
              />
            ),
          }}
        />
        <Button onClick={handlePreviousMonth} style={{ minWidth: "30px" }}>
          {"<"}
        </Button>
        <Button onClick={handleNextMonth} style={{ minWidth: "30px" }}>
          {">"}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default MonthSelector;

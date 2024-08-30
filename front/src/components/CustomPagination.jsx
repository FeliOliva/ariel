import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { blue, red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: red[500],
    },
  },
});

const CustomPagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  currentPage,
}) => {
  const pageCount = Math.ceil(rowCount / rowsPerPage);
  const [visibleRange, setVisibleRange] = useState([1, Math.min(5, pageCount)]);

  const handlePageChange = (page) => {
    onChangePage(page);
  };

  const handleNext = () => {
    if (visibleRange[1] < pageCount) {
      const newStart = visibleRange[0] + 5;
      const newEnd = Math.min(newStart + 4, pageCount);
      setVisibleRange([newStart, newEnd]);
    }
  };

  const handlePrev = () => {
    if (visibleRange[0] > 1) {
      const newStart = Math.max(visibleRange[0] - 5, 1);
      const newEnd = Math.min(newStart + 4, pageCount);
      setVisibleRange([newStart, newEnd]);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <ButtonGroup variant="outlined" color="primary">
          <Button
            onClick={handlePrev}
            disabled={visibleRange[0] === 1}
            startIcon={<ArrowBackIos />}
          >
            Prev
          </Button>
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            {"<"}
          </Button>
          {Array.from(
            { length: visibleRange[1] - visibleRange[0] + 1 },
            (_, i) => {
              const page = visibleRange[0] + i;
              return (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={currentPage === page ? "contained" : "outlined"}
                  color={currentPage === page ? "primary" : "inherit"}
                >
                  {page}
                </Button>
              );
            }
          )}
          <Button onClick={handleNextPage} disabled={currentPage === pageCount}>
            {">"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={visibleRange[1] === pageCount}
            endIcon={<ArrowForwardIos />}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>
    </ThemeProvider>
  );
};

export default CustomPagination;

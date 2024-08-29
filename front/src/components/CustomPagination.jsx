// src/components/CustomPagination.js
import React from "react";

const CustomPagination = ({
  rowsPerPage,
  rowCount,
  onChangePage,
  currentPage,
}) => {
  const pageCount = Math.ceil(rowCount / rowsPerPage);

  const handlePageChange = (page) => {
    onChangePage(page);
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
    >
      {Array.from(Array(pageCount), (item, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              cursor: "pointer",
              backgroundColor: currentPage === page ? "#007bff" : "#fff",
              color: currentPage === page ? "#fff" : "#007bff",
              border: `1px solid ${
                currentPage === page ? "#007bff" : "#007bff"
              }`,
            }}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
};

export default CustomPagination;

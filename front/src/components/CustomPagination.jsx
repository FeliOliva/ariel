import React, { useState } from "react";
import { Button, Space } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

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
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <Space.Compact>
        <Button
          onClick={handlePrev}
          disabled={visibleRange[0] === 1}
          icon={<LeftOutlined />}
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
                type={currentPage === page ? "primary" : "default"}
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
        >
          Next <RightOutlined />
        </Button>
      </Space.Compact>
    </div>
  );
};

export default CustomPagination;

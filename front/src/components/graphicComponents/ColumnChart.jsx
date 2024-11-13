import { Column } from "@ant-design/charts";

const data = [
  { category: "A", value: 30 },
  { category: "B", value: 70 },
  { category: "C", value: 45 },
];

const ColumnChart = () => {
  return <Column data={data} xField="category" yField="value" />;
};

export default ColumnChart;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "antd";

const { Option } = Select;

const FetchComboBox = ({
  url,
  label,
  labelKey,
  valueKey,
  onSelect,
  value,
  style,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(url);
        setOptions(response.data);
      } catch (error) {
        console.error(`Error fetching options from ${url}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [url]);

  // console.log("options");
  // console.log(options);
  return (
    <Select
      showSearch
      placeholder={`Seleccione ${label}`}
      optionFilterProp="children"
      onChange={(value) => {
        // console.log(options[0]);
        const op = options.filter((i) => i[valueKey] === value);
        if (op.length > 0) {
          onSelect(op[0]);
        }
      }}
      style={{ ...style, position: "relative" }}
      value={value}
      loading={loading}
      allowClear
    >
      {options.map((option) => (
        <Option
          key={option[valueKey]}
          value={option[valueKey]}
          style={{ width: "100%" }}
        >
          {option[labelKey]}
        </Option>
      ))}
    </Select>
  );
};

export default FetchComboBox;

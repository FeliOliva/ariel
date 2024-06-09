import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import axios from "axios";

const FetchComboBox = ({ url, label, labelKey, valueKey, onSelect }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(url);
        const formattedOptions = response.data.map((item) => ({
          label: item[labelKey],
          value: item[valueKey],
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, [url, labelKey, valueKey]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      value={selectedOption}
      onChange={(event, newValue) => {
        setSelectedOption(newValue);
        onSelect(newValue);
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default FetchComboBox;

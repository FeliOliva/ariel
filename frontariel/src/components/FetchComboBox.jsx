import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

const FetchComboBox = ({ url, label, labelKey, valueKey, open, onSelect }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const response = await axios.get(url);
          setOptions(
            response.data.map((item) => ({
              label: item[labelKey],
              value: item[valueKey],
            }))
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open, url, labelKey, valueKey]);

  return (
    <Autocomplete
      disablePortal
      options={options}
      loading={loading}
      sx={{ width: 300 }}
      onChange={(_, value) => {
        if (value) {
          onSelect(value);
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default FetchComboBox;

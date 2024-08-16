import { useState, useEffect } from "react";
import axios from "axios";

export function useFetchClientes(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    axios(url)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching the data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  });
  return { data, loading };
}

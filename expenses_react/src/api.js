import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

let token = null;
export const setToken = (t) => {
  token = t;
};

const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

export const login = async (username, password) => {
  const res = await axios.post(`${BASE_URL}/login`, { username, password });
  return res.data;
};

export const register = async (username, password) => {
  const res = await axios.post(`${BASE_URL}/register`, { username, password });
  return res.data;
};

export const fetchEntries = async () => {
  const res = await axios.get(`${BASE_URL}/entries`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const addEntry = async (entry) => {
  const res = await axios.post(`${BASE_URL}/entries`, entry, {
    headers: authHeaders(),
  });
  return res.data;
};

export const deleteEntry = async (id) => {
  await axios.delete(`${BASE_URL}/entries/${id}`, { headers: authHeaders() });
};

export const fetchRates = async () => {
  const ratesUrl =
    process.env.REACT_APP_RATES_URL ||
    "https://api.exchangerate-api.com/v4/latest/USD";
  const res = await axios.get(ratesUrl);
  return res.data.rates;
};

export const fetchBudgets = async (year, month) => {
  const res = await axios.get(`${BASE_URL}/budgets`, {
    params: { year, month },
    headers: authHeaders(),
  });
  return res.data;
};

export const saveBudget = async ({ category, year, month, amount }) => {
  const res = await axios.post(
    `${BASE_URL}/budgets`,
    {
      category,
      year,
      month,
      amount,
    },
    { headers: authHeaders() }
  );
  return res.data;
};

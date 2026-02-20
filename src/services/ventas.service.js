import api from '../api/api'

export const ventasService = async (payload) => {
  const { data } = await api.post("/ventas", payload);
  return data;
};
import axios from "axios";
const axiosJWT = axios.create();
export const getColumnByProjectId = async (projectId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/columns/project/${projectId}`
  );
  return res;
};
export const createColumn = async (projectId, data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/columns/project/${projectId}`,
    data
  );
  return res;
};
export const updatedColumns = async (projectId, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/columns/project/${projectId}/batch-update`,
    data
  );
  return res;
};

import axios from "axios";
const axiosJWT = axios.create();
export const getColumnByProjectId = async (projectId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/columns/project/${projectId}`
  );
  return res;
};

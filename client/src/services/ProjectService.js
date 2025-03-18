import axios from "axios";
// const axiosJWT = axios.create();
import Cookies from "js-cookie";
const access_token = Cookies.get("access_token");
export const getAllProject = async () => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects`);
  return res;
};
export const getAllProjectByManagerID = async (managerId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/projects/managed/${managerId}`
  );
  return res;
};
export const createProject = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/projects`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res;
};
export const deleteProject = async (projectId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/project/delete/${projectId}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const updateProject = async (projectId, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/project/update/${projectId}`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const getDetailProjectProject = async (projectId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/projects/${projectId}`
  );
  return res;
};
export const AddMember = async (projectId, userId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/project/addmember/${projectId}`,
    { userId },
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const DeleteMember = async (projectId, userId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/project/deletemember/${projectId}`,
    { userId },
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

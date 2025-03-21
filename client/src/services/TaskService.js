import axios from "axios";
import Cookies from "js-cookie";
const access_token = Cookies.get("access_token");
export const getAllTask = async (projectId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/tasks/project/${projectId}`
  );
  return res;
};
export const createTask = async (projectId, data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/tasks/project/${projectId}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res;
};
export const deleteTask = async (taskId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`
  );
  return res;
};
export const getDetailTask = async (taskId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`
  );
  return res;
};
export const updateStatusSubtask = async (
  taskId,
  subtaskId,
  userId,
  status
) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/task/update_status/task/${taskId}/subtask/${subtaskId}/user/${userId}`,
    { status }
  );
  return res.data;
};
export const updateStatusTask = async (taskId, columnId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/status/${columnId}`
  );
  return res;
};
export const assignedTask = async (taskId, userId) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/assignee/${userId}`
  );
  return res;
};
export const removeassignee = async (taskId, userId) => {
  console.log(taskId, userId);
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/assignee/${userId}`
  );
  return res;
};

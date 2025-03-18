import axios from "axios";
import Cookies from "js-cookie";
const access_token = Cookies.get("access_token");
export const getAllTask = async (projectId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/tasks/project/${projectId}`
  );
  return res;
};
export const createTask = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/task/create`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const deleteTask = async (taskIds) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/task/delete/`,
    {
      data: { taskIds },
    },
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const deleteTaskSingle = async (taskId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/task/delete/${taskId}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const deleteSubTask = async (taskId, subtaskId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/task/delete/task/${taskId}/subtask/${subtaskId}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const addSubTask = async (task_id, data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/task/create-subtask/${task_id}`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const getDetailTask = async (taskId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/task/detail/${taskId}`
  );
  return res.data;
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
export const updateStatusTask = async (taskId, userId, status) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/task/update_status/task/${taskId}/user/${userId}`,
    { status }
  );
  return res.data;
};
export const assignedTask = async (taskId, userId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/task/addassignee/task/${taskId}/user/${userId}`
  );
  return res.data;
};
export const removeassignee = async (taskId, userId) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/task/removeassignee/task/${taskId}/user/${userId}`
  );
  return res.data;
};

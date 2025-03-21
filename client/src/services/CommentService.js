import axios from "axios";
const axiosJWT = axios.create();
export const getCommentbyTaskId = async (TaskId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/tasks/${TaskId}/comments`
  );
  return res;
};
export const createComment = async (TaskId, data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/tasks/${TaskId}/comments`,
    data
  );
  return res;
};
export const deleteComment = async (taskId, commentId) => {
  console.log(commentId);
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/comments/${commentId}`
  );
  return res;
};
export const updateComment = async (taskId, commentId, content) => {
  const res = await axios.patch(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/comments/${commentId}`,
    content
  );
  return res;
};

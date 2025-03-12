import axios from "axios";
const axiosJWT = axios.create();
export const getCommentbyTaskId = async (TaskId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/comment/getbytaskid/${TaskId}`
  );
  return res.data;
};
export const createComment = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/comment/create/`,
    data
  );
  return res.data;
};
export const deleteComment = async (id) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/comment/delete/${id}`
  );
  return res.data;
};

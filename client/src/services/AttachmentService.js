import axios from "axios";
const axiosJWT = axios.create();
export const getAttachmentsByTaskId = async (taskId) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/attachments`
  );
  return res;
};
export const uploadAttachment = async (taskId, data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/attachments`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res;
};
export const deleteAttachment = async (taskId, attachmentId) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/attachments/${attachmentId}`
  );
  return res;
};
export const downloadAttachment = async (fileName) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/tasks/attachments/download/${fileName}`
  );
  return res;
};

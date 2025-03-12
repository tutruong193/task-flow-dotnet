import axios from "axios";
const axiosJWT = axios.create();
export const getAllNotificationByIdProject = async (id) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/notification/getall/${id}`
  );
  return res.data;
};
export const getAllNotificationByAssigned = async (userid) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/notification/getallbyuser/${userid}`
  );
  return res.data;
};

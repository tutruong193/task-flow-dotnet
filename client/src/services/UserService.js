import axios from "axios";
import Cookies from "js-cookie";
const access_token = Cookies.get("access_token");
export const loginUser = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/user/login`,
    data
  );
  return res.data;
};
export const logoutUser = async () => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/user/logout`
  );
  return res.data;
};
export const getAllUser = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/user/getall`
  );
  return res.data;
};
export const createUser = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/user/create`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const deleteUser = async (id) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/api/user/delete/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const deleteManyUser = async (ids) => {
  const res = await axios.delete(
    `${
      process.env.REACT_APP_API_URL
    }/api/user/delete-many?selectedManyKeys=${ids.join(",")}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
export const getDetailsUser = async (id) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/user/detail/${id}`
  );
  return res.data;
};
export const updateUser = async (id, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/user/update/${id}`,
    data
  );
  return res.data;
};
export const sendVertifyCode = async (id) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/user/send-vertify-code/${id}`
  );
  return res.data;
};
export const vertifyCode = async (id, code) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/user/send-vertify-code/${id}`,
    { code }
  );
  return res.data;
};
export const vertifyUser = async (email) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/api/user/vertify`,
    { email }
  );
  return res.data;
};
export const changePassword = async (id, password, request) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/user/changepassword/${id}`,
    { password, request }
  );
  return res.data;
};

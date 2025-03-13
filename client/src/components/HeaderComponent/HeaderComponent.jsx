import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  BellOutlined,
  LockOutlined,
  MailOutlined,
  EditOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Modal,
  Tabs,
  Form,
  message,
  Upload,
  Typography,
} from "antd";
import { useCookies } from "react-cookie";
import { jwtTranslate, getBase64 } from "../../ultilis";
import * as UserService from "../../services/UserService";
import { Popover } from "antd";
import { useNavigate } from "react-router-dom";
import LogoComponent from "../LogoComponent/LogoComponent";
import NotificationComponent from "../NotificationComponent/NotificationComponent";
import * as Message from "../../components/MessageComponent/MessageComponent";
import styled from "styled-components";
const { Title } = Typography;
const WrapperUploadFile = styled(Upload)`
  & .ant-upload-list {
    display: none;
  }
  & .ant-upload-list-text {
    display: none;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;
const HeaderComponent = () => {
  const [cookiesAccessToken, setCookieAccessToken] = useCookies("");
  const accessToken = cookiesAccessToken.access_token;
  const navigate = useNavigate();
  const [stateUser, setStateUser] = useState({
    name: "",
    email: "",
    avatar: "",
    phone: "",
    role: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  //fetch data
  const fetchDataUser = async () => {
    try {
      const res = await UserService.getDetailsUser(
        jwtTranslate(accessToken)?.sub
      );
      setStateUser(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDataUser();
  }, [accessToken]);

  const handleProfileClick = () => {
    setIsModalOpen(true);
    setActiveTab("1");
    form.setFieldsValue({
      name: stateUser.name,
      email: stateUser.email,
      phone: stateUser?.phone,
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    passwordForm.resetFields();
  };

  //update information
  const handleOnchangeAvatarDetails = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateUser({
      ...stateUser,
      avatar: file.preview,
    });
  };
  const handleOnchangeDetails = (e) => {
    setStateUser({
      ...stateUser,
      [e.target.name]: e.target.value,
    });
  };
  const handleUpdateInfo = async () => {
    try {
      const res = await UserService.updateUser(
        jwtTranslate(accessToken)?.id,
        stateUser
      );
      if (res.status === "OK") {
        Message.success();
        fetchDataUser();
        form.setFieldsValue({
          name: stateUser.name,
          email: stateUser.email,
          phone: stateUser?.phone,
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      message.error("Cập nhật thông tin thất bại!");
    }
  };
  ///change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const handleChangePassword = async () => {
    try {
      console.log(oldPassword, newPassword);
      const res = await UserService.changePassword(
        jwtTranslate(accessToken)?.id,
        newPassword,
        oldPassword
      );
      if (res.status === "OK") {
        Message.success();
        setNewPassword();
        setOldPassword();
        passwordForm.setFieldsValue({
          oldPassword: "",
          newPassword: "",
        });
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      message.error("Cập nhật thông tin thất bại!");
    }
  };
  ////logout
  const handleLogoutClick = () => {
    // await UserService.logoutUser();
    navigate("/login");
    window.location.reload();
  };
  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        textAlign: "center",
      }}
    >
      <Avatar
        src={stateUser?.avatar}
        icon={<UserOutlined />}
        size={60}
        style={{ marginBottom: "10px" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {jwtTranslate(accessToken)?.role !== "admin" && (
          <Button
            type="link"
            onClick={handleProfileClick}
            style={{ color: "#1890ff" }}
          >
            Profile
          </Button>
        )}
        <Button
          type="link"
          onClick={handleLogoutClick}
          style={{ color: "#1890ff" }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
  return (
    <div className="container-header">
      <div onClick={() => navigate("/system/user/your-work")}>
        <LogoComponent />
      </div>
      <div className="container-header-right">
        {/* <div className="header-icon">
          {jwtTranslate(accessToken)?.role !== "admin" && (
            <NotificationComponent />
          )}
        </div> */}
        <Popover
          placement="bottomRight"
          trigger={"hover"}
          title={`Welcome, ${stateUser?.name}!`}
          content={content}
        >
          <div className="header-icon">
            <Avatar src={stateUser?.avatar} icon={<UserOutlined />} size={30} />
          </div>
        </Popover>
      </div>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1890ff",
            }}
          >
            <EditOutlined style={{ marginRight: 10 }} />
            My profile
          </div>
        }
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        centered
        width={450}
      >
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          style={{ marginBottom: 20 }}
        >
          <Tabs.TabPane tab="Personal information" key="1">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <WrapperUploadFile
                onChange={handleOnchangeAvatarDetails}
                maxCount={1}
                accept="image/*"
                maxSize={10 * 1024 * 1024}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <Button>Select File</Button>
                  {stateUser?.avatar && (
                    <img
                      src={stateUser?.avatar}
                      alt="avatar"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </WrapperUploadFile>
            </div>
            <Form form={form} layout="vertical" onFinish={handleUpdateInfo}>
              <Form.Item
                label="Username"
                name="name"
                rules={[{ required: true, message: "Enter yourname" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Your name"
                  name="name"
                  onChange={handleOnchangeDetails}
                />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Your email"
                  name="email"
                  onChange={handleOnchangeDetails}
                  disabled
                />
              </Form.Item>
              <Form.Item label="Phone" name="phone">
                <Input
                  prefix={<UserOutlined />}
                  name="phone"
                  placeholder="Your phone number"
                  onChange={handleOnchangeDetails}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<EditOutlined />}
                >
                  Update
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Change password" key="2">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                label="Old password"
                name="oldPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter old password"
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label="New password"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<LockOutlined />}
                >
                  Change
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default HeaderComponent;

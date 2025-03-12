import React, { useEffect, useState } from "react";
import {
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Card,
  Avatar,
  Popover,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import moment from "moment";
import * as UserService from "../../services/UserService";
import * as ProjectService from "../../services/ProjectService";
import { useNavigate } from "react-router-dom";
import { jwtTranslate } from "../../ultilis";
import { useCookies } from "react-cookie";
import * as Message from "../../components/MessageComponent/MessageComponent";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(utc);
dayjs.extend(customParseFormat);
const dateFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

const renderDate = (date) => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", dateFormatOptions).format(parsedDate);
};
const ProjectCardComponent = ({ projectId, projectQuerry }) => {
  const [cookiesAccessToken, setCookieAccessToken, removeCookie] =
    useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const isManager = infoUser?.role === "manager";
  const navigate = useNavigate();
  const [stateProject, setStateProject] = useState({
    name: "",
    description: "",
    startDate: null,
    endDate: null,
    status: "",
    members: [],
  });
  //kiem tra xem het han hay chua
  const isExpired = new Date() > new Date(stateProject?.endDate);
  //lấy dữ liệu để set name và avatar
  const [userList, setUserList] = useState([]);
  const takAvatar = (id) => {
    const user = userList.find((user) => user._id === id);
    return user ? user.avatar : null;
  };
  const takName = (id) => {
    const user = userList.find((user) => user._id === id);
    return user ? user.name : null;
  };
  const [userData, setUserData] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState();
  useEffect(() => {
    const fetchProjectAndUsers = async () => {
      try {
        // Gọi đồng thời cả hai hàm API
        const [projectRes, userRes] = await Promise.all([
          ProjectService.getDetailProjectProject(projectId),
          UserService.getAllUser(),
        ]);
        // Xử lý kết quả của project
        if (projectRes.status === "OK") {
          setStateProject(projectRes.data);
          setSelectedMembers(projectRes.data.members);
        } else {
          console.error("Error fetching project details");
        }
        // Xử lý kết quả của user
        if (userRes?.data) {
          const formattedUsers = userRes.data
            .filter((user) => user.role.includes("member"))
            .map((user) => ({
              label: user.name,
              value: user._id,
            }));
          setUserData(formattedUsers || []);
          setUserList(
            userRes?.data?.filter((user) => !user.role.includes("admin"))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchProjectAndUsers();
    localStorage.removeItem("manage_project_info");
    localStorage.removeItem("projectId");
  }, [projectId]);

  const tags = [
    {
      status: "pending",
      color: "#f34e4e",
      backgroundColor: "rgba(243, 78, 78, .1)",
    },
    {
      status: "progress",
      color: "#f7cc53",
      backgroundColor: "rgba(247, 204, 83, .1)",
    },
    {
      status: "done",
      color: "#51d28c",
      backgroundColor: "rgba(81, 210, 140, .1)",
    },
  ];
  const fetchUserData = async (id) => {
    const res = await UserService.getDetailsUser(id);
    return res.data;
  };
  const handleCardClick = async () => {
    navigate(`/system/user/project/board`);
    localStorage.setItem("projectId", projectId);
    const managerInfo = await fetchUserData(stateProject.managerID);
    localStorage.setItem("manage_project_info", JSON.stringify(managerInfo));
  };
  // Hàm xử lý sự kiện Delete
  const handleDelete = async () => {
    try {
      const res = await ProjectService.deleteProject(projectId);
      if (res.status === "OK") {
        Message.success("Project deleted successfully");
        projectQuerry.refetch();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      Message.error("Failed to delete project");
    }
  };
  //editProject
  const [formEdit] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleChangeSelectMember = (value) => {
    setSelectedMembers(value);
  };
  const handleEdit = () => {
    setIsEditModalVisible(true);
    formEdit.setFieldsValue({
      name: stateProject.name,
      description: stateProject.description,
      startDate: dayjs(stateProject.startDate).local(), // Chuyển đổi về múi giờ địa phương
      endDate: dayjs(stateProject.endDate).local(),
      status: stateProject.status,
    });
  };
  const handleSaveEdit = async () => {
    try {
      const updateProject = {
        ...formEdit.getFieldsValue(),
        members: selectedMembers,
      };
      const res = await ProjectService.updateProject(projectId, updateProject); // Gọi hàm cập nhật
      if (res.status === "OK") {
        formEdit.resetFields();
        setIsEditModalVisible(false);
        Message.success();
        projectQuerry.refetch();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      Message.error("Failed to update project");
    }
  };
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
  };
  console.log(userData);
  return (
    <div>
      <Card
        title={<div onClick={handleCardClick}>{stateProject?.name}</div>}
        extra={
          !isExpired &&
          isManager && (
            <Popover
              trigger="click"
              content={
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEdit} // Gọi hàm xử lý khi click
                    style={{
                      textAlign: "left",
                      padding: 0,
                      justifyContent: "flex-start",
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete the project"
                    description="Are you sure to delete this project?"
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      style={{
                        textAlign: "left",
                        padding: 0,
                        justifyContent: "flex-start",
                      }}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              }
            >
              <EllipsisOutlined />
            </Popover>
          )
        }
        actions={[
          <Avatar.Group
            max={{
              count: 2,
              style: {
                color: "#f56a00",
                backgroundColor: "#fde3cf",
              },
            }}
          >
            {stateProject?.members?.map((member) =>
              takAvatar(member) ? (
                <Avatar
                  key={member}
                  src={takAvatar(member)} // Hiển thị avatar từ URL
                  alt={takName(member)}
                  title={takName(member)}
                  style={{
                    cursor: "pointer",
                  }}
                />
              ) : (
                <Avatar
                  key={member}
                  style={{
                    backgroundColor: "#87d068",
                    cursor: "pointer",
                  }}
                  alt={takName(member)}
                  title={takName(member)}
                >
                  {takName(member)?.charAt(0).toUpperCase()}
                </Avatar>
              )
            )}
          </Avatar.Group>,
          <div
            style={{
              width: "fit-content",
              padding:
                stateProject?.status === "incompleted" ? "0px 5px" : "0px 20px",
              backgroundColor:
                tags.find((tag) => tag.status === stateProject?.status)
                  ?.backgroundColor || "gray",
              color:
                tags.find((tag) => tag.status === stateProject?.status)
                  ?.color || "white",
              marginRight: "5px",
            }}
          >
            {stateProject?.status || "none"}
          </div>,
        ]}
      >
        <div>
          <div>{stateProject?.description || " "}</div>
          <div>{renderDate(stateProject?.startDate)}</div>
          <div>{renderDate(stateProject?.endDate)}</div>
        </div>
      </Card>
      <Modal
        title="Edit Project"
        open={isEditModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
      >
        <Form layout="vertical" form={formEdit} autoComplete="off">
          <Form.Item label="Name" name="name">
            <Input name="name" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea name="description" />
          </Form.Item>
          <Form.Item label="Start Date" name="startDate">
            <DatePicker
              name="startDate"
              disabledDate={(current) => {
                // Không cho phép chọn ngày trước hôm nay
                return current && current < moment().startOf("day");
              }}
              disabled={new Date() > new Date(stateProject.startDate)}
            />
          </Form.Item>
          <Form.Item label="End Date" name="endDate">
            <DatePicker
              name="endDate"
              disabledDate={(current) => {
                // Không cho phép chọn ngày trước hôm nay
                return current && current < moment().startOf("day");
              }}
            />
          </Form.Item>
          <Form.Item label="Members">
            <Select
              defaultValue={stateProject.members}
              mode="multiple"
              onChange={handleChangeSelectMember}
              options={userData}
              placeholder="Select members"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectCardComponent;

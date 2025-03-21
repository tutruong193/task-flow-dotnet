import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Input,
  Button,
  Row,
  Col,
  Modal,
  Form,
  DatePicker,
  Select,
  Empty,
  Table,
  Tag,
  Avatar,
  Typography,
} from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import * as ProjectService from "../../../services/ProjectService";
import { jwtTranslate } from "../../../ultilis";
import * as UserService from "../../../services/UserService";
import * as Message from "../../../components/MessageComponent/MessageComponent";
const { Text } = Typography;

const UserManagerProjectPage = () => {
  const [cookiesAccessToken, setCookieAccessToken, removeCookie] =
    useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const isManager = infoUser?.role == "Manager";
  const navigate = useNavigate();
  // Fetch projects
  const fetchProjectAllByManageID = async () => {
    const res = await ProjectService.getAllProjectByManagerID(infoUser?.sub);
    return res.data;
  };

  const projectQuerry = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjectAllByManageID,
    config: { retry: 3, retryDelay: 1000 },
  });

  const { data: dataProject } = projectQuerry;

  // Modal add project
  const [formAddProject] = Form.useForm();
  const [isModalAddProject, setIsModalAddProject] = useState(false);

  // Fetch user data for searching members
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    const fetchUserAll = async () => {
      try {
        const res = await UserService.getAllUser();
        const formattedUsers = res?.data
          .filter((user) => user.role == "Member")
          .map((user) => ({
            label: user.name,
            value: user.id,
          }));
        setUserData(formattedUsers || []);
      } catch (e) {
        console.log(e);
      }
    };
    fetchUserAll();
  }, []);

  // Action when adding project
  const [stateAddProject, setStateAddProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    managerID: infoUser?.sub,
    members: [],
  });

  const handleOnChangeAddProject = (e) => {
    setStateAddProject({
      ...stateAddProject,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeSelectMember = (value) => {
    setStateAddProject((prevState) => ({
      ...stateAddProject,
      members: value,
    }));
  };

  const onChangeDate = (name, date) => {
    if (date) {
      const formattedDate = moment(date).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"); // Sử dụng định dạng UTC ISO
      setStateAddProject((prevState) => ({
        ...prevState,
        [name]: formattedDate,
      }));
    } else {
      setStateAddProject((prevState) => ({
        ...prevState,
        [name]: null,
      }));
    }
  };

  const showModalAddProject = () => {
    setIsModalAddProject(true);
  };

  const handleCancelAddProject = () => {
    setIsModalAddProject(false);
    setStateAddProject({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      managerID: infoUser?.sub,
      members: [],
    });
    formAddProject.resetFields();
  };

  const handleAddProject = async () => {
    try {
      await formAddProject.validateFields();
      const res = await ProjectService.createProject(stateAddProject);
      if (res.status == "200" || res.status == "201") {
        Message.success("Project added successfully");
        setStateAddProject({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          managerID: infoUser?.id,
          members: [],
        });
        projectQuerry.refetch();
        formAddProject.resetFields();
        setIsModalAddProject(false);
      } else {
        Message.error(res.message);
      }
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Text
          strong
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => handleCardClick(record.id)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Text type="secondary">{text || "No description"}</Text>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members) => (
        <Avatar.Group maxCount={3}>
          {members.map((member) => (
            <Avatar key={member} icon={<UserOutlined />} />
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        // const isFinished = new Date(endDate) < new Date();
        return <Tag color={"green"}>{status}</Tag>;
      },
    },
  ];
  const handleCardClick = async (projectId) => {
    navigate(`/system/user/project/board`);
    localStorage.setItem("projectId", projectId);
  };
  return (
    <div style={{ minHeight: "100vh", padding: "40px" }}>
      <h2 style={{ fontSize: "25px", paddingBottom: "20px", fontWeight: 700 }}>
        Your work
      </h2>
      <div>
        <div className="container-projects">
          <div className="container-title">
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "Roboto, sans-serif",
              }}
            >
              Recent projects
            </h2>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              {isManager && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showModalAddProject}
                >
                  Create a new project
                </Button>
              )}
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={dataProject}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  description="No recent projects found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </div>
      </div>

      <Modal
        title="Add a new project"
        open={isModalAddProject}
        onOk={handleAddProject}
        onCancel={handleCancelAddProject}
      >
        <Form
          form={formAddProject}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please input the project name!" },
            ]}
          >
            <Input name="name" onChange={handleOnChangeAddProject} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              name="description"
              onChange={handleOnChangeAddProject}
            />
          </Form.Item>

          <Form.Item
            label="Start at:"
            name="startDate"
            rules={[
              { required: true, message: "Please select the start date!" },
            ]}
          >
            <DatePicker
              onChange={(date) => onChangeDate("startDate", date)}
              disabledDate={(current) => {
                return current && current < moment().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item
            label="End at:"
            name="endDate"
            rules={[{ required: true, message: "Please select the end date!" }]}
          >
            <DatePicker
              onChange={(date) => onChangeDate("endDate", date)}
              disabledDate={(current) => {
                return current && current < moment().startOf("day");
              }}
            />
          </Form.Item>
          <Form.Item label="Members" name="members">
            <Select
              mode="multiple"
              placeholder="Please select"
              onChange={handleChangeSelectMember}
              style={{
                width: "100%",
              }}
              options={userData}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagerProjectPage;

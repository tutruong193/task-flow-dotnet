import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
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
} from "antd";
import moment from "moment";
import ProjectCardComponent from "../../../components/ProjectCardComponent/ProjectCardComponent";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import * as ProjectService from "../../../services/ProjectService";
import { jwtTranslate } from "../../../ultilis";
import * as UserService from "../../../services/UserService";
import * as Message from "../../../components/MessageComponent/MessageComponent";
const UserManagerProjectPage = () => {
  const [cookiesAccessToken, setCookieAccessToken, removeCookie] =
    useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const isManager = infoUser?.role === "manager";
  // Fetch projects
  const fetchProjectAll = async () => {
    const res = await ProjectService.getAllProject();
    return res;
  };

  const projectQuerry = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjectAll,
    config: { retry: 3, retryDelay: 1000 },
  });

  const { data: projects } = projectQuerry;
  const dataProject = projects?.data?.filter(
    (project) =>
      project.managerID === infoUser?.id ||
      project.members?.some((member) => member === infoUser?.id)
  );
  console.log(dataProject);
  // Modal add project
  const [formAddProject] = Form.useForm();
  const [isModalAddProject, setIsModalAddProject] = useState(false);
  // Fetch user data for searching members
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    const fetchUserAll = async () => {
      try {
        const res = await UserService.getAllUser();
        // Format userData to suit AutoComplete's requirement
        const formattedUsers = res?.data
          .filter((user) => user.role.includes("member"))
          .map((user) => ({
            label: user.name,
            value: user._id,
          }));
        setUserData(formattedUsers || []);
      } catch (e) {
        console.log(e);
      }
    };
    fetchUserAll();
  }, []);
  //action when adding project
  const [stateAddProject, setStateAddProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    managerID: infoUser?.id,
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
      const formattedDate = date.utc().format("YYYY-MM-DDTHH:mm:ss[Z]"); // Sử dụng định dạng UTC ISO
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
      managerID: infoUser?.id,
      members: [],
    });
    formAddProject.resetFields();
  };
  const handleAddProject = async () => {
    try {
      await formAddProject.validateFields();
      const res = await ProjectService.createProject(stateAddProject);
      if (res.status === "OK") {
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
                <div className="title-default" onClick={showModalAddProject}>
                  Create a new project
                </div>
              )}
            </div>
          </div>
          <Row className="projects" gutter={[16, 16]}>
            {dataProject?.filter(
              (project) => new Date(project.endDate) >= new Date()
            ).length > 0 ? (
              dataProject
                ?.filter((project) => new Date(project.endDate) >= new Date())
                .map((project) => (
                  <Col key={project._id} span={4}>
                    <ProjectCardComponent
                      projectId={project._id}
                      projectQuerry={projectQuerry}
                    />
                  </Col>
                ))
            ) : (
              <Col span={24}>
                <Empty
                  description="No recent projects found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Col>
            )}
          </Row>
        </div>
        <div className="container-title">
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "Roboto, sans-serif",
              padding: "20px 0px",
            }}
          >
            Finished projects
          </h2>
        </div>
        <Row className="projects" gutter={[16, 16]}>
          {dataProject?.filter(
            (project) => new Date(project.endDate) < new Date()
          ).length > 0 ? (
            dataProject
              ?.filter((project) => new Date(project.endDate) < new Date())
              .map((project) => (
                <Col key={project._id} span={4}>
                  <ProjectCardComponent
                    projectId={project._id}
                    projectQuerry={projectQuerry}
                  />
                </Col>
              ))
          ) : (
            <Col span={24}>
              <Empty
                description="No finished projects found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Col>
          )}
        </Row>
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
            name="startDate" // Đặt đúng tên name
            format={{
              format: "YYYY-MM-DD HH:mm:ss",
              type: "mask",
            }}
            rules={[
              { required: true, message: "Please select the start date!" },
            ]}
          >
            <DatePicker
              onChange={(date) => onChangeDate("startDate", date)}
              disabledDate={(current) => {
                // Không cho phép chọn ngày trước hôm nay
                return current && current < moment().startOf("day");
              }}
            />
          </Form.Item>

          <Form.Item
            label="End at:"
            name="endDate"
            format={{
              format: "YYYY-MM-DD HH:mm:ss",
              type: "mask",
            }}
            rules={[{ required: true, message: "Please select the end date!" }]}
          >
            <DatePicker
              onChange={(date) => onChangeDate("endDate", date)}
              disabledDate={(current) => {
                // Không cho phép chọn ngày trước hôm nay
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

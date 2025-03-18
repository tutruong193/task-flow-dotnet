import React, { useEffect, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Input, Button, Form, Avatar, Typography } from "antd";
import { useLocation } from "react-router-dom";
import * as TaskService from "../../../services/TaskService";
import * as ProjectService from "../../../services/ProjectService";
import * as UserService from "../../../services/UserService";
import { useQuery } from "@tanstack/react-query";
import ModalAddProject from "../../../components/ModalAddProject/ModalAddProject";
import * as Message from "../../../components/MessageComponent/MessageComponent";
import TableListView from "../../../components/TableListView/TableListView";
import AddPeopleModal from "../../../components/ModalAddPeople/ModelAddPeople";
import { jwtTranslate } from "../../../ultilis";
import { useCookies } from "react-cookie";
const { Title, Text } = Typography;
const ListPage = () => {
  const [cookiesAccessToken] = useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const isManager = infoUser?.role === "manager";
  ///lấy dữ liệu để set name và avatar
  const [userList, setUserList] = useState([]);
  const takeAvatar = (id) => {
    const user = userList.find((user) => user._id === id);
    return user ? user.avatar : null;
  };
  const takeName = (id) => {
    const user = userList.find((user) => user._id === id);
    return user ? user.name : null;
  };
  const takeEmail = (id) => {
    const user = userList.find((user) => user._id === id);
    return user ? user.email : null;
  };
  //fetch task data and user data
  const fetchTaskAll = async () => {
    const res = await TaskService.getAllTask(projectId);
    return res;
  };
  const taskQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTaskAll,
    staleTime: 0, // Đảm bảo dữ liệu luôn được coi là "stale" và cần refetch
    cacheTime: 1000,
  });
  const { data: tasks } = taskQuery;
  const [stateProject, setStateProject] = useState([]);
  const [userData, setUserData] = useState([]);
  const projectId = localStorage.getItem("projectId");
  const isExpired = new Date() > new Date(stateProject?.endDate);
  const fetchTaskDataAndMemberList = async () => {
    try {
      const [projectRes, userRes] = await Promise.all([
        ProjectService.getDetailProjectProject(projectId),
        UserService.getAllUser(), // Thay thế bằng hàm thực tế để lấy dữ liệu user
      ]);
      if (projectRes.status === "OK") {
        setStateProject(projectRes.data);
      } else {
        console.error("Error fetching project details");
      }
      if (userRes.status === "OK") {
        const existingMemberIds = new Set(
          projectRes.data.members.map((member) => member.userId)
        );
        existingMemberIds.add(projectRes.data.managerID);
        existingMemberIds.add("66f4f0f9aa581e424317d838");
        // Lọc danh sách user để loại bỏ những người dùng có ID trùng với các thành viên hiện có hoặc managerID
        const filteredUserList = userRes.data
          .filter((user) => !existingMemberIds.has(user._id))
          .map((user) => ({
            label: user.name,
            value: user._id,
          }));
        setUserData(filteredUserList);
        setUserList(
          userRes?.data?.filter((user) => !user.role.includes("admin"))
        );
      } else {
        console.error("Error fetching project details");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchTaskDataAndMemberList();
  }, [projectId]);
  //assign members to task
  const options = [];
  if (stateProject?.members) {
    // Sử dụng members thay vì membersID
    for (let i = 0; i < stateProject.members.length; i++) {
      options.push({
        value: stateProject.members[i], // ID thành viên
        label: takeName(stateProject.members[i]),
      });
    }
  }
  //add task
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // Form instance
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); // Reset the form fields
  };
  const handleAddTask = async (values) => {
    try {
      const newTask = {
        name: values.name,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        projectId: projectId,
        assignees: values.assignees,
        description: values.description,
      };
      const res = await TaskService.createTask(newTask);
      if (res.status === "OK") {
        Message.success("Task added successfully!");
        handleCancel();
        taskQuery.refetch();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      Message.error("An error occurred while adding the task.");
    }
  };
  //add members to project
  const [isModalAddPeopleOpen, setIsModalAddPeopleOpen] = useState(false);
  const [value, setValue] = useState();
  const showModalAddPeople = () => {
    setIsModalAddPeopleOpen(true);
  };
  const handleOkAddPeople = async () => {
    const res = await ProjectService.AddMember(projectId, value);
    if (res.status === "OK") {
      Message.success();
      setValue(null);
      setIsModalAddPeopleOpen(false);
      fetchTaskDataAndMemberList();
    } else {
      Message.error(res.message);
    }
  };
  const handleCancelAddPeople = () => {
    setIsModalAddPeopleOpen(false);
    setValue(null);
  };

  const handleRemoveMember = async (userId) => {
    const res = await ProjectService.DeleteMember(projectId, userId);
    if (res.status === "OK") {
      Message.success();
      fetchTaskDataAndMemberList();
      taskQuery.refetch();
    } else {
      Message.error(res.message);
    }
  };
  ///delete task
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const handleDeleteTasks = async () => {
    try {
      const res = await TaskService.deleteTask(selectedTaskIds);
      if (res.status === "OK") {
        Message.success("Tasks deleted successfully!");
        taskQuery.refetch();
        setSelectedTaskIds([]);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Error deleting tasks:", error);
      Message.error("An error occurred while deleting tasks.");
    }
  };
  //search
  const [searchValue, setSearchValue] = useState("");
  const handleSearch = (e) => {
    setSearchValue(e.target.value); // Cập nhật giá trị tìm kiếm theo từng ký tự
  };
  const filteredDataTable = tasks?.data?.filter((task) =>
    task?.name.toLowerCase().includes(searchValue.toLowerCase())
  );
  const highlightText = (text, searchValue) => {
    if (!searchValue) return text;
    const parts = text.split(new RegExp(`(${searchValue})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchValue.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };
  return (
    <div className="task-page">
      <div className="task-title">
        <div className="breadcrumb">
          <div>Project</div>
          <div>/</div>
          <div>{stateProject?.name}</div>
        </div>
        <Title level={4} style={{ margin: 0 }}>
          LIST
        </Title>
      </div>
      <div className="toolbar">
        <div className="toolbar-left">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search"
            style={{ width: 240 }}
            onChange={handleSearch}
          />
          <Avatar.Group
            max={{
              count: 2,
              style: {
                color: "#f56a00",
                backgroundColor: "#fde3cf",
              },
            }}
          >
            {options.map((member) =>
              takeAvatar(member?.value) ? (
                <Avatar
                  key={member?.value}
                  src={takeAvatar(member?.value)} // Hiển thị avatar từ URL
                  alt={takeName(member?.value)}
                  title={takeName(member?.value)}
                  style={{
                    cursor: "pointer",
                  }}
                />
              ) : (
                <Avatar
                  key={member?.value}
                  style={{
                    backgroundColor: "#87d068",
                    cursor: "pointer",
                  }}
                  alt={takeName(member?.value)}
                  title={takeName(member?.value)}
                >
                  {takeName(member?.value)?.charAt(0).toUpperCase()}
                </Avatar>
              )
            )}
          </Avatar.Group>

          {!isExpired && isManager && (
            <Avatar icon={<PlusOutlined />} onClick={showModalAddPeople} />
          )}
          <AddPeopleModal
            isVisible={isModalAddPeopleOpen}
            onCancel={handleCancelAddPeople}
            onAddPeople={handleOkAddPeople}
            userData={userData}
            currentMembers={stateProject.members}
            onChange={setValue}
            onRemoveMember={handleRemoveMember}
            value={value}
            takeAvatar={takeAvatar}
            takeName={takeName}
            takeEmail={takeEmail}
          />
        </div>
        {!isExpired && isManager && (
          <div className="toolbar-right">
            <Button
              icon={<PlusOutlined />}
              className="action_button"
              onClick={showModal}
            >
              Add
            </Button>
            <Button
              icon={<DeleteOutlined />}
              className="action_button"
              disabled={selectedTaskIds.length === 0} // Vô hiệu hóa nếu không có task nào được chọn
              onClick={handleDeleteTasks}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      <div className="task-card-container">
        <TableListView
          taskQuery={taskQuery}
          data={filteredDataTable}
          onRowSelectionChange={(selectedKeys) =>
            setSelectedTaskIds(selectedKeys)
          }
          takeAvatar={takeAvatar}
          takeName={takeName}
          takeEmail={takeEmail}
          highlightText={highlightText}
          searchValue={searchValue}
        />
      </div>
      <ModalAddProject
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        handleAddTask={handleAddTask}
        form={form}
        options={options}
      />
    </div>
  );
};

export default ListPage;

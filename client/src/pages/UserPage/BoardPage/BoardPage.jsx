import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCookies } from "react-cookie";
import * as TaskService from "../../../services/TaskService";
import * as ProjectService from "../../../services/ProjectService";
import * as UserService from "../../../services/UserService";
import AddPeopleModal from "../../../components/ModalAddPeople/ModelAddPeople";
import {
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import * as Message from "../../../components/MessageComponent/MessageComponent";
import {
  Input,
  Button,
  Typography,
  Avatar,
  Modal,
  Select,
  Form,
  Radio,
  DatePicker,
} from "antd";
import ModalAddProject from "../../../components/ModalAddProject/ModalAddProject";
import Column from "../../../components/Board/Column";
import { jwtTranslate } from "../../../ultilis";
const { Title, Text } = Typography;
const BoardPage = () => {
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
  const projectId = localStorage.getItem("projectId");
  const [columns, setColumns] = useState({
    todo: { name: "TO DO", count: 1, items: [] },
    progress: { name: "IN PROGRESS", count: 1, items: [] },
    done: { name: "DONE", count: 3, items: [] },
  });
  const [stateProject, setStateProject] = useState([]);
  const [userData, setUserData] = useState([]);
  const [cookiesAccessToken] = useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const isExpired = new Date() > new Date(stateProject?.endDate);
  const isManager = infoUser?.role === "manager";
  const fetchAllData = async () => {
    try {
      const [projectRes, userRes, taskRes] = await Promise.all([
        ProjectService.getDetailProjectProject(projectId),
        UserService.getAllUser(),
        TaskService.getAllTask(projectId),
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
      if (taskRes.status === "OK") {
        const taskData = taskRes.data;
        const newColumns = {
          todo: {
            name: "TO DO",
            count: taskData.filter((task) => task.status === "todo").length,
            items: taskData.filter((task) => task.status === "todo"),
          },
          progress: {
            name: "IN PROGRESS",
            count: taskData.filter((task) => task.status === "progress").length,
            items: taskData.filter((task) => task.status === "progress"),
          },
          done: {
            name: "DONE",
            count: taskData.filter((task) => task.status === "done").length,
            items: taskData.filter((task) => task.status === "done"),
          },
        };
        setColumns(newColumns);
      } else {
        console.error("Error fetching task list");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchAllData();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = Array.from(sourceColumn.items);
    const destItems = Array.from(destColumn.items);
    const [movedItem] = sourceItems.splice(source.index, 1);

    movedItem.status = destination.droppableId;

    if (source.droppableId !== destination.droppableId) {
      // destItems.splice(destination.index, 0, movedItem);
      try {
        // Gọi API để cập nhật trạng thái trong DB
        const res = await TaskService.updateStatusTask(
          movedItem._id,
          infoUser.id,
          movedItem.status
        );
        if (res.status === "OK") {
          Message.success();
          destItems.splice(destination.index, 0, movedItem);
          setColumns({
            ...columns,
            [source.droppableId]: {
              ...sourceColumn,
              items: sourceItems,
              count: sourceItems.length,
            },
            [destination.droppableId]: {
              ...destColumn,
              items: destItems,
              count: destItems.length,
            },
          });
        } else {
          Message.error(res.message);
          sourceItems.splice(source.index, 0, movedItem);
          setColumns({
            ...columns,
            [source.droppableId]: {
              ...sourceColumn,
              items: sourceItems,
              count: sourceItems.length,
            },
            [destination.droppableId]: {
              ...destColumn,
              items: destItems,
              count: destItems.length,
            },
          });
        }
        // Thêm item vào cột đích và cập nhật lại UI
      } catch (error) {
        // Khôi phục lại trạng thái cũ trong UI nếu gặp lỗi
        sourceItems.splice(source.index, 0, movedItem);
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
            count: sourceItems.length,
          },
          [destination.droppableId]: {
            ...destColumn,
            items: destItems,
            count: destItems.length,
          },
        });
      }
    } else {
      sourceItems.splice(destination.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
          count: sourceItems.length,
        },
      });
    }
  };
  //assign members to task
  const options = [];
  if (stateProject?.members) {
    // Sử dụng members thay vì membersID
    for (let i = 0; i < stateProject.members.length; i++) {
      options.push({
        value: stateProject.members[i], // ID thành viên
        label: takeName(stateProject.members[i]), // Tên thành viên
      });
    }
  }
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
      fetchAllData();
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
      fetchAllData();
    } else {
      Message.error(res.message);
    }
  };
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
        fetchAllData();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      Message.error("An error occurred while adding the task.");
    }
  };
  return (
    <div className="board-container">
      <div className="board-header">
        <div className="breadcrumb">
          <span>Projects</span>
          <span>/</span>
          <span>{stateProject?.name}</span>
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            KAN board
          </Title>
        </div>
      </div>
      <div className="toolbar">
        <div className="toolbar-left">
          <div>Members: </div>
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
        </div>
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
        <div className="toolbar-right">
          {!isExpired && isManager && (
            <Button
              icon={<PlusOutlined />}
              className="action_button"
              onClick={showModal}
            >
              Add
            </Button>
          )}
        </div>
      </div>
      <DragDropContext onDragEnd={isExpired ? undefined : onDragEnd}>
        <div className="board-columns">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column
              key={columnId}
              columnId={columnId}
              column={column}
              fetchAllData={fetchAllData}
            />
          ))}
        </div>
      </DragDropContext>
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

export default BoardPage;

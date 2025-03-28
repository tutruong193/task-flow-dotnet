import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import * as ProjectService from "../../../services/ProjectService";
import * as UserService from "../../../services/UserService";
import * as ColumnService from "../../../services/ColumnService";
import AddPeopleModal from "../../../components/ModalAddPeople/ModelAddPeople";
import ModelAddColumn from "../../../components/ModelAddColumn/ModelAddColumn";
import ModalReorderColumn from "../../../components/ModalReorderColumn/ModalReorderColumn";
import { jwtTranslate } from "../../../ultilis";
import { useCookies } from "react-cookie";
import * as TaskService from "../../../services/TaskService";
import * as Message from "../../../components/MessageComponent/MessageComponent";
import {
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";

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

const { Title, Text } = Typography;
const BoardPage = () => {
  ///lấy dữ liệu để set name và avatar
  const [userList, setUserList] = useState([]);
  const takeAvatar = (id) => {
    const user = userData.find((user) => user.id === id);
    return user ? user.avatar : null;
  };
  const takeName = (id) => {
    const user = userData.find((user) => user.id === id);
    return user ? user.name : null;
  };
  const takeEmail = (id) => {
    const user = userData.find((user) => user.id === id);
    return user ? user.email : null;
  };

  const [columns, setColumns] = useState([]);
  const [stateProject, setStateProject] = useState([]);
  const [userData, setUserData] = useState([]);
  const [cookiesAccessToken] = useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const projectId = localStorage.getItem("projectId");
  const isExpired = new Date() > new Date(stateProject?.endDate);
  const isManager = infoUser?.role === "Manager";
  const fetchAllData = async () => {
    try {
      const [projectRes, userRes, taskRes, columnRes] = await Promise.all([
        ProjectService.getDetailProjectProject(projectId),
        UserService.getAllUser(),
        TaskService.getAllTask(projectId),
        ColumnService.getColumnByProjectId(projectId),
      ]);

      if (columnRes.status === 200) {
        const columnsWithMeta = columnRes.data.map((col) => ({
          ...col,
          count: 0, // Ban đầu đặt count là 0
          items: [], // Ban đầu items là mảng rỗng
        }));

        setColumns(columnsWithMeta);

        if (taskRes.status === 200) {
          const taskData = taskRes.data;
          const updatedColumns = columnsWithMeta.map((col) => {
            const columnTasks = taskData.filter(
              (task) => task.columnId === col.id
            );

            return {
              ...col,
              items: columnTasks,
              count: columnTasks.length,
            };
          });

          // Cập nhật lại state columns với dữ liệu task đã được thêm vào
          setColumns(updatedColumns);
        } else {
          console.error("Error fetching task list");
        }
      } else {
        console.error("Error fetching column details");
      }

      if (projectRes.status === 200) {
        setStateProject(projectRes.data);
      } else {
        console.error("Error fetching project details");
      }

      if (userRes.status === 200) {
        const existingMemberIds = new Set(
          projectRes.data.members.map((member) => member.userId)
        );
        const filteredUserList = userRes.data
          .filter((user) => !existingMemberIds.has(user.id))
          .map((user) => ({
            label: user.name,
            value: user._id,
          }));
        setUserData(userRes?.data);
        setUserList(filteredUserList);
      } else {
        console.error("Error fetching user details");
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
      try {
        const res = await TaskService.updateStatusTask(
          movedItem.id,
          destColumn.id
        );
        if (res.status == 200) {
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
      } catch (error) {
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
        value: stateProject.members[i].userId,
        label: takeName(stateProject.members[i].userId),
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
  const showModal = () => {
    setIsModalVisible(true);
  };

  //add column
  const [isAddColumn, SetIsAddColumn] = useState(false);
  const [stateColumn, SetStateColumn] = useState({
    name: "",
  });
  const [formAddColumn] = Form.useForm();
  const handleCancelAddColumn = () => {
    SetIsAddColumn(stateColumn);
    formAddColumn.resetFields();
  };
  const onChangeName = (event) => {
    SetStateColumn((prev) => ({ ...prev, name: event.target.value }));
  };
  const handleAddColumn = async () => {
    const newData = {
      ...stateColumn,
      position: columns?.length + 1,
    };
    const res = await ColumnService.createColumn(projectId, newData);
    if (res.status == 201 || res.status == 200) {
      SetIsAddColumn(false);
      Message.success();
      fetchAllData();
      formAddColumn.resetFields();
    } else {
      Message.error(res.message);
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
            {stateProject.members?.map((member) =>
              takeAvatar(member?.userId) ? (
                <Avatar
                  key={member?.userId}
                  src={takeAvatar(member?.userId)} // Hiển thị avatar từ URL
                  alt={takeName(member?.userId)}
                  title={takeName(member?.userId)}
                  style={{
                    cursor: "pointer",
                  }}
                />
              ) : (
                <Avatar
                  key={member?.userId}
                  style={{
                    backgroundColor: "#87d068",
                    cursor: "pointer",
                  }}
                  alt={takeName(member?.userId)}
                  title={takeName(member?.userId)}
                >
                  {takeName(member?.userId)?.charAt(0).toUpperCase()}
                </Avatar>
              )
            )}
          </Avatar.Group>
          {!isExpired && isManager && (
            <Avatar icon={<PlusOutlined />} onClick={showModalAddPeople} />
          )}
        </div>
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
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <DragDropContext onDragEnd={isExpired ? undefined : onDragEnd}>
          <div className="board-columns">
            {Object.entries(columns).map(([columnId, column]) => (
              <Column
                key={columnId}
                columnId={columnId}
                column={column}
                fetchAllData={fetchAllData}
                options={options}
              />
            ))}
          </div>
        </DragDropContext>
        <div style={{ padding: "16px" }}>
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => SetIsAddColumn(true)}
          />
          <ModelAddColumn
            formAddColumn={formAddColumn}
            onChangeName={onChangeName}
            isModalAddColumn={isAddColumn}
            handleCancelAddColumn={handleCancelAddColumn}
            handleAddColumn={handleAddColumn}
          />
        </div>
      </div>
      <ModalAddProject
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        options={options}
        fetchAllData={fetchAllData}
      />
      <AddPeopleModal
        isVisible={isModalAddPeopleOpen}
        onCancel={handleCancelAddPeople}
        onAddPeople={handleOkAddPeople}
        userList={userList}
        currentMembers={stateProject.members}
        onChange={setValue}
        onRemoveMember={handleRemoveMember}
        value={value}
        takeAvatar={takeAvatar}
        takeName={takeName}
        takeEmail={takeEmail}
      />
      <ModalReorderColumn
        columns={columns}
        setColumns={setColumns}
        fetchAllData={fetchAllData}
      />
    </div>
  );
};

export default BoardPage;

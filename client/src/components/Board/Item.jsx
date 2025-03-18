import React, { useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import dayjs from "dayjs";
import {
  Typography,
  Avatar,
  Tag,
  Tooltip,
  Checkbox,
  Progress,
  Card,
  Space,
} from "antd";
import * as TaskService from "../../services/TaskService";
import {
  ClockCircleOutlined,
  DeploymentUnitOutlined,
  UserOutlined,
  FileTextOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import ModelDetailTask from "../ModelDetailTask/ModelDetailTask";
import * as UserService from "../../services/UserService";
import relativeTime from "dayjs/plugin/relativeTime";
import { jwtTranslate } from "../../ultilis";
import { useCookies } from "react-cookie";
import * as Message from "../../components/MessageComponent/MessageComponent";
dayjs.extend(relativeTime);
// Thay đổi mảng columns để phù hợp với dữ liệu mới
const dateFormatOptions = {
  day: "2-digit",
  month: "long", // Tháng dưới dạng chữ
  year: "numeric",
};
const renderDate = (date) => {
  if (!date) return "N/A"; // Nếu không có giá trị, trả về "N/A"
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "Invalid Date"; // Kiểm tra xem có phải là ngày hợp lệ không
  return new Intl.DateTimeFormat("en-US", dateFormatOptions).format(parsedDate);
};
const { Text, Paragraph } = Typography;
const itemPriority = [
  {
    label: "High",
    value: "high",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "Low",
    value: "low",
  },
];
const Item = ({ item, index, fetchAllData }) => {
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
  const fetchMemberList = async () => {
    try {
      const userRes = await UserService.getAllUser();

      if (userRes.status == 200) {
        setUserList(userRes.data);
      } else {
        console.error("Error fetching project details");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchMemberList();
  }, [index, item]);
  const [cookiesAccessToken] = useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  // Modal for task information
  const [isModalTaskInformation, setIsModalTaskInformation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const showModal = async (key) => {
    setIsModalTaskInformation(true);
    setSelectedTask(key);
  };
  return (
    <div>
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`task-card ${snapshot.isDragging ? "dragging" : ""}`}
            onClick={() => showModal(item._id)}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Tag color={"blue"} style={{ marginBottom: "4px" }}>
                    Task
                  </Tag>
                </div>

                {/* Due Date */}
                {item.dueDate && (
                  <Tooltip title="Due Date">
                    <Space>
                      <Text type="secondary" className="task-date">
                        {renderDate(item.dueDate)}
                      </Text>
                    </Space>
                  </Tooltip>
                )}
              </div>

              {/* Task Name */}
              <Text strong>{item.name}</Text>

              {/* Task Description */}

              <Paragraph
                ellipsis={{ rows: 2 }}
                type="secondary"
                style={{ marginBottom: 8 }}
              >
                <FileTextOutlined style={{ marginRight: 8 }} />
                {item.description || "None"}
              </Paragraph>

              {/* Assignee */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "20px",
                }}
              >
                {" "}
                {item.subtasks && item.subtasks.length > 0 ? (
                  <Tooltip
                    title={`${
                      item.subtasks.filter((s) => s.status === "done").length
                    } of ${item.subtasks.length} child issues done`}
                  >
                    <DeploymentUnitOutlined
                      style={{ opacity: 0.5, fontSize: 20 }}
                    />
                  </Tooltip>
                ) : null}
                {item.assignees ? (
                  <Tooltip title={`Assigned to: ${takeName(item.assignees)}`}>
                    {takeAvatar(item.assignees) ? (
                      <Avatar
                        src={takeAvatar(item.assignees)}
                        alt={takeName(item.assignees)}
                        title={takeName(item.assignees)}
                      />
                    ) : (
                      <Avatar
                        key={item.assignees}
                        style={{
                          backgroundColor: "#87d068",
                          cursor: "pointer",
                        }}
                        alt={takeName(item.assignees)}
                        title={takeName(item.assignees)}
                      >
                        {takeName(item.assignees)?.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </Tooltip>
                ) : (
                  <Tooltip title={`Assigned to: None`}>
                    <Avatar
                      src={takeAvatar(item.assignees)}
                      icon={<UserOutlined />}
                    />
                  </Tooltip>
                )}
              </div>
            </Space>
          </div>
        )}
      </Draggable>
      <ModelDetailTask
        taskID={selectedTask}
        isModalTaskInformation={isModalTaskInformation}
        handleCancelTaskInformation={() => {
          setSelectedTask(null);
          setIsModalTaskInformation(false);
        }}
        infoUser={infoUser}
        takeAvatar={takeAvatar}
        takeName={takeName}
        takeEmail={takeEmail}
        fetchAllData={fetchAllData}
      />
    </div>
  );
};

export default Item;

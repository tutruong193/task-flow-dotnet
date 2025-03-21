import React, { useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import dayjs from "dayjs";
import { Typography, Avatar, Tag, Tooltip, Card, Space } from "antd";
import * as TaskService from "../../services/TaskService";
import {
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import ModelDetailTask from "../ModelDetailTask/ModelDetailTask";
import * as UserService from "../../services/UserService";
import relativeTime from "dayjs/plugin/relativeTime";
import { jwtTranslate } from "../../ultilis";
import { useCookies } from "react-cookie";
import * as Message from "../../components/MessageComponent/MessageComponent";
dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

const priorityColors = {
  high: "#ff4d4f", // Red for high priority
  medium: "#faad14", // Orange for medium priority
  low: "#52c41a", // Green for low priority
};
const Item = ({ item, index, fetchAllData, columnId, options }) => {
  const [userList, setUserList] = useState([]);
  const [cookiesAccessToken] = useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const [isModalTaskInformation, setIsModalTaskInformation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  // Fetch user data for avatar and name
  const fetchMemberList = async () => {
    try {
      const userRes = await UserService.getAllUser();
      if (userRes.status === 200) {
        setUserList(userRes.data);
      } else {
        console.error("Error fetching user details");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchMemberList();
  }, [index, item]);

  const takeAvatar = (id) => {
    const user = userList.find((user) => user.id == id);
    return user ? user.avatar : null;
  };

  const takeName = (id) => {
    const user = userList.find((user) => user.id == id);
    return user ? user.name : null;
  };
  const showModal = async (key) => {
    setIsModalTaskInformation(true);
    setSelectedTask(key);
  };
  // Check if the task is in the "Done" column
  const isDone = columnId === "done";
  return (
    <div>
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`task-card ${snapshot.isDragging ? "dragging" : ""}`}
            onClick={() => showModal(item.id)}
          >
            <div
              style={{
                borderLeft: `4px solid ${priorityColors[item.priority]}`,
                padding: "12px",
                margin: "-10px",
                backgroundColor: "#fff",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                {/* Task Name with strikethrough if done */}
                <Text
                  strong
                  style={{
                    textDecoration: isDone ? "line-through" : "none",
                    fontSize: "16px",
                  }}
                >
                  {item.name}
                </Text>

                {/* Task Description */}
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  type="secondary"
                  style={{ marginBottom: 8 }}
                >
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  {item.description || "No description"}
                </Paragraph>

                {/* Assignee */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  {item.assignee ? (
                    <Tooltip
                      title={`Assigned to: ${takeName(item.assignee?.userId)}`}
                    >
                      {takeAvatar(item.assignee?.userId) ? (
                        <Avatar
                          src={takeAvatar(item.assignee?.userId)}
                          alt={takeName(item.assignee?.userId)}
                          title={takeName(item.assignee?.userId)}
                        />
                      ) : (
                        <Avatar
                          style={{
                            backgroundColor: "#87d068",
                            cursor: "pointer",
                          }}
                          alt={takeName(item?.assignee?.userId)}
                          title={takeName(item?.assignee?.userId)}
                        >
                          {takeName(item?.assignee?.userId)
                            ?.charAt(0)
                            .toUpperCase()}
                        </Avatar>
                      )}
                    </Tooltip>
                  ) : (
                    <Tooltip title="Unassigned">
                      <Avatar icon={<UserOutlined />} />
                    </Tooltip>
                  )}
                </div>
              </Space>
            </div>
          </div>
        )}
      </Draggable>

      {/* Task Detail Modal */}
      <ModelDetailTask
        taskID={selectedTask}
        isModalTaskInformation={isModalTaskInformation}
        handleCancelTaskInformation={() => {
          setSelectedTask(null);
          setIsModalTaskInformation(false);
        }}
        options={options}
        infoUser={infoUser}
        takeAvatar={takeAvatar}
        takeName={takeName}
        fetchAllData={fetchAllData}
      />
    </div>
  );
};

export default Item;

import React, { useState, useEffect } from "react";
import { Table, Avatar, Tag } from "antd";
import {
  DownOutlined,
  PaperClipOutlined,
  PlusOutlined,
  LinkOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as Message from "../../components/MessageComponent/MessageComponent";
import { jwtTranslate } from "../../ultilis";
import { useCookies } from "react-cookie";
import relativeTime from "dayjs/plugin/relativeTime";
import ModelDetailTask from "../ModelDetailTask/ModelDetailTask";
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
const tags = [
  {
    status: "todo",
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
const TableListView = ({
  taskQuery,
  data,
  onRowSelectionChange,
  takeAvatar,
  takeName,
  takeEmail,
  highlightText,
  searchValue,
}) => {
  const [cookiesAccessToken] = useCookies("");
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 350,
      render: (name) => highlightText(name, searchValue),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type) => {
        if (Array.isArray(type)) {
          return (
            <>
              {type.map((t) => (
                <Tag
                  key={t}
                  color={t === "Task" ? "blue" : "green"} // Màu xanh dương cho Task và xanh lá cho Subtask
                  style={{ marginBottom: "4px" }}
                >
                  {t}
                </Tag>
              ))}
            </>
          );
        }
        return (
          <Tag color="blue" style={{ marginBottom: "4px" }}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 350,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      filters: [
        { text: "To do", value: "todo" },
        { text: "Progress", value: "progress" },
        { text: "Done", value: "done" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const tag = tags.find((tag) => tag.status === status);
        return (
          <span
            style={{
              color: tag?.color || "black",
              backgroundColor: tag?.backgroundColor || "transparent",
              padding: "4px 8px",
              borderRadius: "4px",
              display: "inline-block",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      title: "Assignee",
      dataIndex: "assignees",
      key: "assignees",
      width: 100,
      render: (assignees) =>
        assignees?.length > 0 ? (
          <Avatar.Group count={2}>
            {takeAvatar(assignees) ? (
              <Avatar
                key={assignees}
                src={takeAvatar(assignees)}
                alt={takeName(assignees)}
                title={takeName(assignees)}
                style={{
                  cursor: "pointer",
                }}
              />
            ) : (
              <Avatar
                key={assignees}
                style={{
                  backgroundColor: "#87d068",
                  cursor: "pointer",
                }}
                alt={takeName(assignees)}
                title={takeName(assignees)}
              >
                {takeName(assignees)?.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Avatar.Group>
        ) : (
          "None"
        ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 200,
      render: (dueDate) => {
        return <div className="task-date">{renderDate(dueDate)}</div>;
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (createdAt) => {
        return <div className="task-date">{renderDate(createdAt)}</div>;
      },
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 200,
      render: (updatedAt) => {
        return <div className="task-date">{renderDate(updatedAt)}</div>;
      },
    },
  ];
  const formatTaskData = (data) => {
    return data.map((task) => {
      const formattedTask = {
        ...task,
        type:
          task.subtasks && task.subtasks.length > 0
            ? ["Task", "Subtask"]
            : ["Task"],
        key: task._id,
      };

      return formattedTask;
    });
  };

  const formattedTasks = data ? formatTaskData(data) : [];
  // Modal for task information
  const [isModalTaskInformation, setIsModalTaskInformation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const showModal = (key) => {
    setSelectedTask(key);
    setIsModalTaskInformation(true);
  };
  //delete
  const rowSelection = {
    onChange: (selectedRowKeys) => {
      onRowSelectionChange(selectedRowKeys);
    },
  };
  return (
    <>
      <Table
        bordered
        columns={columns}
        rowSelection={rowSelection}
        onRow={(record) => ({
          onClick: () => {
            setSelectedTask(record.key);
            showModal(record.key);
          },
        })}
        dataSource={formattedTasks}
        virtual
        scroll
        size={"small"}
        pagination={false}
      />
      <ModelDetailTask
        taskID={selectedTask}
        isModalTaskInformation={isModalTaskInformation}
        handleCancelTaskInformation={() => {
          setSelectedTask(null);
          setIsModalTaskInformation(false);
        }}
        taskQuery={taskQuery}
        infoUser={infoUser}
        takeAvatar={takeAvatar}
        takeName={takeName}
        takeEmail={takeEmail}
      />
    </>
  );
};

export default TableListView;

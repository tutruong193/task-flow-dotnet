import React, { useState, useEffect } from "react";
import {
  Select,
  Avatar,
  Modal,
  Button,
  Typography,
  Tabs,
  Input,
  Form,
  DatePicker,
  Spin,
  Tooltip,
  Col,
  Row,
} from "antd";
import { useLocation } from "react-router-dom";
import { TagOutlined, CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import * as TaskService from "../../services/TaskService";
import * as CommentService from "../../services/CommentService";
import * as ProjectService from "../../services/ProjectService";
import * as Message from "../../components/MessageComponent/MessageComponent";
const { TextArea } = Input;
const ModelDetailTask = ({
  taskID,
  isModalTaskInformation,
  handleCancelTaskInformation,
  infoUser,
  takeName,
  takeAvatar,
  takeEmail,
  taskQuery,
  fetchAllData,
}) => {
  const isManager = infoUser?.role === "manager";
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubtaskModalVisible, setIsSubtaskModalVisible] = useState(false);
  const [formSubtask] = Form.useForm();
  const dateFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };
  const renderDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "Invalid Date";
    return new Intl.DateTimeFormat("en-US", dateFormatOptions).format(
      parsedDate
    );
  };
  const location = useLocation();
  // const defaultSelectedKey = isAdmin ? "admin_dashboard" : "user_project_board";
  const lastpath = location.pathname.split("/").pop();

  //lấy dữ liệu
  const [selectedTask, setSelectedTask] = useState();
  const fetchComments = async (id) => {
    const res = await CommentService.getCommentbyTaskId(id);
    if (res.status === "OK") {
      setComments(res.data);
    }
  };
  const fetchTaskData = async (id) => {
    const res = await TaskService.getDetailTask(id);
    if (res.status === "OK") {
      setSelectedTask(res.data);
    }
  };
  const [project, setProject] = useState();
  const isExpired = new Date() > new Date(project?.endDate);
  const fetchProjects = async () => {
    const id = localStorage.getItem("projectId");
    const res = await ProjectService.getDetailProjectProject(id);
    if (res.status === "OK") {
      setProject(res.data);
    }
  };
  const options = [];
  project?.members.forEach((member) => {
    options.push({
      label: takeName(member),
      value: member,
    });
  });

  useEffect(() => {
    if (taskID) {
      fetchTaskData(taskID);
      fetchComments(taskID);
      fetchProjects();
    }
  }, [taskID]);
  //delete task and subtask
  const deleteTask = async () => {
    const res = await TaskService.deleteTaskSingle(taskID);
    if (res.status === "OK") {
      Message.success();
      if (lastpath === "board") {
        fetchAllData();
      }
      if (lastpath === "list") {
        taskQuery.refetch();
      }
      handleCancelTaskInformation();
    } else {
      Message.error(res.message);
    }
  };
  const deleteSubtask = async (id) => {
    const res = await TaskService.deleteSubTask(taskID, id);
    if (res.status === "OK") {
      Message.success();
      fetchTaskData(taskID);
      if (lastpath === "board") {
        fetchAllData();
      }
      if (lastpath === "list") {
        taskQuery.refetch();
      }
    } else {
      Message.error(res.message);
    }
  };
  //comment
  const handleSaveComment = async () => {
    const newCommentObject = {
      author: infoUser.id,
      taskId: selectedTask?._id,
      content: newComment,
    };
    const res = await CommentService.createComment(newCommentObject);
    if (res.status === "OK") {
      Message.success();
      fetchComments(selectedTask?._id);
      setNewComment("");
    } else {
      Message.error(res.message);
    }
  };

  const deleteComment = async (id) => {
    const res = await CommentService.deleteComment(id);
    if (res.status === "OK") {
      Message.success();
      fetchComments(selectedTask?._id);
    } else {
      Message.error(res.message);
    }
  };
  //subtask
  const showSubtaskModal = () => {
    setIsSubtaskModalVisible(true);
  };
  const handleAddSubtask = async () => {
    try {
      const values = await formSubtask.validateFields();
      const res = await TaskService.addSubTask(taskID, values);
      if (res.status === "OK") {
        Message.success(res.message);
        formSubtask.resetFields();
        setIsSubtaskModalVisible(false);
        fetchTaskData(taskID);
        if (lastpath === "board") {
          fetchAllData();
        }
        if (lastpath === "list") {
          taskQuery.refetch();
        }
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };
  //change status
  const onChangeStatusTask = async (value) => {
    const res = await TaskService.updateStatusTask(taskID, infoUser.id, value);
    if (res.status === "OK") {
      Message.success();
      fetchTaskData(taskID);
      if (lastpath === "board") {
        fetchAllData();
      }
      if (lastpath === "list") {
        taskQuery.refetch();
      }
    } else {
      Message.error(res.message);
    }
  };
  const onChangeStatusSubtask = async (subtaskId, newStatus) => {
    try {
      const res = await TaskService.updateStatusSubtask(
        taskID,
        subtaskId,
        infoUser.id,
        newStatus
      );
      if (res.status === "OK") {
        Message.success();
        fetchTaskData(taskID);
        if (lastpath === "board") {
          fetchAllData();
        }
        if (lastpath === "list") {
          taskQuery.refetch();
        }
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Error updating subtask status:", error);
      Message.error("Failed to update subtask status");
    }
  };
  //remove and add assignee
  const [isOpenSelect, setIsOpenSelect] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const handleRemoveAssignee = async (id) => {
    const res = await TaskService.removeassignee(taskID, id);
    if (res.status === "OK") {
      Message.success();
      fetchTaskData(taskID);
      if (lastpath === "board") {
        fetchAllData();
      }
      if (lastpath === "list") {
        taskQuery.refetch();
      }
    } else {
      Message.error(res.message);
    }
  };
  const handleAddAssignee = async () => {
    const res = await TaskService.assignedTask(taskID, selectedUser);
    if (res.status === "OK") {
      Message.success();
      fetchTaskData(taskID);
      if (lastpath === "board") {
        fetchAllData();
      }
      if (lastpath === "list") {
        taskQuery.refetch();
      }
      setIsOpenSelect(false);
      setSelectedUser("");
    } else {
      Message.error(res.message);
      setSelectedUser("");
    }
  };
  return (
    <>
      <Modal
        title={null}
        open={isModalTaskInformation}
        onCancel={handleCancelTaskInformation}
        footer={null}
        width={1000}
        className="task-modal"
      >
        <div className="modal-header">
          <div className="modal-title">
            <span style={{ fontSize: "20px" }}>Task Name</span>
            <span style={{ color: "#6B778C" }}>{selectedTask?.name}</span>
          </div>
          <div className="modal-actions">
            <Select
              disabled={isExpired}
              value={selectedTask?.status}
              style={{
                width: "fit-content",
              }}
              onChange={(value) => onChangeStatusTask(value)}
              className={`status-select ${selectedTask?.status}`}
              options={[
                {
                  value: "todo",
                  label: "Todo",
                },
                {
                  value: "progress",
                  label: "Progress",
                },
                {
                  value: "done",
                  label: "Done",
                },
              ]}
            />
            {!isExpired && isManager && (
              <Button onClick={deleteTask}>Delete</Button>
            )}
          </div>
        </div>

        <div className="modal-content">
          <div className="main-content">
            {!isExpired && isManager && (
              <div className="action-buttons">
                <button className="action-button" onClick={showSubtaskModal}>
                  <PlusOutlined /> Add a child issue
                </button>
              </div>
            )}
            <div>
              <Typography.Title level={5}>Description</Typography.Title>
              <Typography.Paragraph type="secondary">
                {selectedTask?.description || "None"}
              </Typography.Paragraph>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {selectedTask?.subtasks && selectedTask.subtasks.length > 0 && (
                <div>
                  <Typography.Title level={5}>Child issues</Typography.Title>
                  {selectedTask.subtasks.map((subtask) => (
                    <div
                      key={subtask._id} // Giả sử mỗi subtask có thuộc tính _id
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "4px",
                        alignItems: "center",
                        marginBottom: "5px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{subtask.name}</span>
                        <span className="task-date">
                          {renderDate(subtask.dueDate)}
                        </span>{" "}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Select
                          disabled={isExpired}
                          value={subtask?.status}
                          style={{
                            width: 120,
                          }}
                          onChange={(value) =>
                            onChangeStatusSubtask(subtask._id, value)
                          }
                          className={`status-select ${subtask?.status}`}
                          options={[
                            {
                              value: "todo",
                              label: "Todo",
                            },
                            {
                              value: "progress",
                              label: "Progress",
                            },
                            {
                              value: "done",
                              label: "Done",
                            },
                          ]}
                        />
                        {!isExpired && isManager && (
                          <Button onClick={() => deleteSubtask(subtask._id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="comment-section">
              <Typography.Title level={5}>Comments</Typography.Title>

              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "16px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "4px",
                }}
              >
                {!isExpired && (
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Input.TextArea
                        placeholder="Add a comment..."
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </div>
                    <Button
                      type="primary"
                      onClick={handleSaveComment}
                      disabled={!newComment.trim()} // Disable when input is empty
                    >
                      Save
                    </Button>
                  </div>
                )}
                {comments?.length > 0 && (
                  <div className="comment-container">
                    {comments.map((comment) => (
                      <div key={comment._id} className="comment">
                        <div className="comment-header">
                          <div className="user-avatar">
                            {takeAvatar(comment?.author) ? (
                              <Avatar src={takeAvatar(comment?.author)} />
                            ) : (
                              <Avatar style={{ backgroundColor: "#1890ff" }}>
                                {takeName(comment?.author)
                                  .charAt(0)
                                  .toUpperCase()}
                              </Avatar>
                            )}
                          </div>
                          <div className="comment-info">
                            <h3 className="user-name">
                              {comment?.author?.userName}
                            </h3>
                            <p className="comment-date">
                              {renderDate(comment?.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="comment-content">{comment.content}</div>
                        {!isExpired && infoUser.id === comment?.author && (
                          <div className="comment-actions">
                            <button
                              className="delete-btn"
                              onClick={() => deleteComment(comment._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="sidebar">
            <div className="field-group">
              <div className="field-label">Assignee</div>
              <div className={`field-value ${isExpired ? "disabled" : ""}`}>
                {selectedTask?.assignees ? (
                  <>
                    {takeAvatar(selectedTask?.assignees) ? (
                      <Avatar
                        key={selectedTask?.assignees}
                        src={takeAvatar(selectedTask?.assignees)}
                        alt={takeName(selectedTask?.assignees)}
                        title={takeName(selectedTask?.assignees)}
                        style={{
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <Avatar
                        key={selectedTask?.assignees}
                        style={{
                          backgroundColor: "#87d068",
                          cursor: "pointer",
                        }}
                        alt={takeName(selectedTask?.assignees)}
                        title={takeName(selectedTask?.assignees)}
                      >
                        {takeName(selectedTask?.assignees)
                          ?.charAt(0)
                          .toUpperCase()}
                      </Avatar>
                    )}

                    <div>
                      <span>{takeName(selectedTask?.assignees)}</span>
                      {!isExpired && isManager && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent modal from opening
                            handleRemoveAssignee(selectedTask?.assignees);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </>
                ) : isOpenSelect ? (
                  <>
                    <Select
                      showSearch
                      allowClear
                      style={{
                        flex: 1,
                      }}
                      value={selectedUser}
                      onChange={(value) => setSelectedUser(value)}
                      placeholder="Search by name"
                      optionFilterProp="label"
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? "")
                          .toLowerCase()
                          .localeCompare((optionB?.label ?? "").toLowerCase())
                      }
                      options={options}
                    />
                    <Button
                      type="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddAssignee();
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenSelect(false);
                        setSelectedUser("");
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      cursor: !isManager ? "not-allowed" : "pointer",
                    }}
                    onClick={(e) => {
                      if (!isManager) return; // Nếu disable thì không cho click
                      e.stopPropagation(); // Prevent modal from opening
                      setIsOpenSelect(true);
                    }}
                  >
                    <Avatar size="small">+</Avatar>
                    <span>Unassigned</span>
                  </div>
                )}
              </div>
            </div>
            <div className="field-group">
              <div className="field-label">Due Date</div>
              <div className="field-value task-date">
                {renderDate(selectedTask?.dueDate)}
              </div>
            </div>
            <div className="field-group">
              <div className="field-label">Reporter</div>
              <div className="field-value">
                {JSON.parse(localStorage.getItem("manage_project_info"))
                  ?.avatar ? (
                  <Avatar
                    src={
                      JSON.parse(localStorage.getItem("manage_project_info"))
                        ?.avatar
                    }
                  />
                ) : (
                  <Avatar style={{ backgroundColor: "#1890ff" }}>
                    {JSON.parse(localStorage.getItem("manage_project_info"))
                      ?.name.charAt(0)
                      .toUpperCase()}
                  </Avatar>
                )}

                <span>
                  {
                    JSON.parse(localStorage.getItem("manage_project_info"))
                      ?.name
                  }
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#6B778C",
                marginTop: "24px",
              }}
            >
              <div>Created {dayjs(selectedTask?.createdAt).fromNow()}</div>
              <div>Updated {dayjs(selectedTask?.updatedAt).fromNow()}</div>
              <div>Resolved {dayjs().fromNow()}</div>{" "}
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Add Subtask"
        open={isSubtaskModalVisible}
        onCancel={() => setIsSubtaskModalVisible(false)}
        onOk={handleAddSubtask}
      >
        <Form form={formSubtask} layout="vertical">
          <Form.Item
            name="name"
            label="Subtask Name"
            rules={[
              { required: true, message: "Please input the subtask name!" },
            ]}
          >
            <Input placeholder="Enter subtask name" prefix={<TagOutlined />} />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: "Please input the due date!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select due date"
              prefix={<CalendarOutlined />}
              disabledDate={(current) => {
                // Kiểm tra nếu current nằm ngoài khoảng startDate và endDate
                return (
                  current &&
                  (current < moment(project?.startDate) ||
                    current > moment(selectedTask?.dueDate))
                );
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModelDetailTask;

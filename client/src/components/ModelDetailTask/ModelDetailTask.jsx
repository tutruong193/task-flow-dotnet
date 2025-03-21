import React, { useState, useEffect } from "react";
import {
  Select,
  Avatar,
  Drawer,
  Button,
  Typography,
  Input,
  Row,
  Image,
  Dropdown,
  Spin,
  Tooltip,
  Col,
  Menu,
  Card,
  Divider,
  Tag,
  Upload,
  List,
  Space,
  Popconfirm,
} from "antd";
import { useLocation } from "react-router-dom";
import {
  TagOutlined,
  CalendarOutlined,
  MoreOutlined,
  FileOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import * as TaskService from "../../services/TaskService";
import * as CommentService from "../../services/CommentService";
import * as ProjectService from "../../services/ProjectService";
import * as AttachmentService from "../../services/AttachmentService";
import * as Message from "../../components/MessageComponent/MessageComponent";
const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

const ModelDetailTask = ({
  taskID,
  isModalTaskInformation,
  handleCancelTaskInformation,
  infoUser,
  takeName,
  takeAvatar,
  taskQuery,
  fetchAllData,
  options,
}) => {
  const isManager = infoUser?.role === "Manager";

  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const location = useLocation();

  //tasks
  const [selectedTask, setSelectedTask] = useState();
  const fetchTaskData = async (id) => {
    try {
      setLoading(true);
      const res = await TaskService.getDetailTask(id);
      if (res.status >= 200 && res.status <= 205) {
        setSelectedTask(res.data);
      }
    } catch (error) {
      Message.error("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    try {
      setLoading(true);
      const res = await TaskService.deleteTask(taskID);
      if (res.status == 200 || res.status == 201) {
        Message.success();
        fetchAllData();
        handleCancelTaskInformation();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  //comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const fetchComments = async (id) => {
    try {
      setLoading(true);
      const res = await CommentService.getCommentbyTaskId(id);
      if (res.status == 200 || res.status == 201) {
        setComments(res.data);
      }
    } catch (error) {
      Message.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveComment = async () => {
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      const newCommentObject = {
        userId: infoUser.sub,
        taskId: taskID,
        content: newComment,
      };
      const res = await CommentService.createComment(taskID, newCommentObject);
      if (res.status == 200 || res.status == 201) {
        Message.success();
        fetchComments(taskID);
        setNewComment("");
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to save comment");
    } finally {
      setLoading(false);
    }
  };
  const deleteComment = async (id) => {
    try {
      setLoading(true);
      const res = await CommentService.deleteComment(taskID, id);
      if (res.status == 201 || res.status == 200) {
        Message.success();
        fetchComments(selectedTask?.id);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };
  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
  };
  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    try {
      setLoading(true);
      const newReply = {
        userId: infoUser.sub,
        taskId: taskID,
        content: replyContent,
        replyId: replyingTo,
      };
      const res = await CommentService.createComment(taskID, newReply);
      if (res.status === 200 || res.status === 201) {
        Message.success("Reply added successfully");
        fetchComments(taskID);
        setReplyContent("");
        setReplyingTo(null);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to add reply");
    } finally {
      setLoading(false);
    }
  };
  console.log(attachments);
  //attachemnt
  const fetchAttachments = async (id) => {
    try {
      setLoading(true);
      const res = await AttachmentService.getAttachmentsByTaskId(id);
      console.log(res);
      if (res.status == 200 || res.status == 201) {
        setAttachments(res.data);
      }
    } catch (error) {
      Message.error("Failed to load attachments");
    } finally {
      setLoading(false);
    }
  };
  const deleteAttachment = async (id) => {
    try {
      setLoading(true);
      const res = await AttachmentService.deleteAttachment(taskID, id);
      if (res.status == 200 || res.status == 201) {
        Message.success();
        fetchAttachments(taskID);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to delete attachment");
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (filename) => {
    try {
      setLoading(true);
      const res = await AttachmentService.downloadAttachment(filename);
      if (res.status == 200 || res.status == 201) {
        console.log(res);
        // const blob = new Blob([res.data], {
        //   type: res.headers["content-type"],
        // });
        // const url = window.URL.createObjectURL(blob);
        // const link = document.createElement("a");
        // link.href = url;
        // link.download = filename;
        // document.body.appendChild(link);
        // link.click();
        // window.URL.revokeObjectURL(url);
        // document.body.removeChild(link);
        Message.success();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to delete attachment");
    } finally {
      setLoading(false);
    }
  };
  const getFileIcon = (fileName) => {
    if (!fileName) return <FileUnknownOutlined />;

    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#f5222d" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImageOutlined style={{ color: "#1890ff" }} />;
      case "doc":
      case "docx":
        return <FileWordOutlined style={{ color: "#2f54eb" }} />;
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ color: "#52c41a" }} />;
      case "zip":
      case "rar":
        return <FileZipOutlined style={{ color: "#faad14" }} />;
      default:
        return <FileOutlined />;
    }
  };
  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await AttachmentService.uploadAttachment(taskID, formData);

      if (res.status == 200 || res.status == 201) {
        Message.success("File uploaded successfully");
        fetchAttachments(selectedTask?.id);
        onSuccess();
      } else {
        Message.error(res.message || "Upload failed");
        onError();
      }
    } catch (error) {
      Message.error("Failed to upload file");
      onError();
    } finally {
      setUploadLoading(false);
    }
  };
  //asignee
  const [isOpenSelect, setIsOpenSelect] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const handleRemoveAssignee = async (id) => {
    try {
      setLoading(true);
      const res = await TaskService.removeassignee(taskID, id);
      if (res.status == 200 || res.status == 1) {
        Message.success();
        fetchTaskData(taskID);
        fetchAllData();
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      Message.error("Failed to remove assignee");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignee = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const res = await TaskService.assignedTask(taskID, selectedUser);
      if (res.status == 200 || res.status == 201) {
        Message.success();
        fetchTaskData(taskID);
        fetchAllData();
        setIsOpenSelect(false);
        setSelectedUser("");
      } else {
        Message.error(res.message);
        setSelectedUser("");
      }
    } catch (error) {
      Message.error("Failed to add assignee");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (taskID) {
      fetchTaskData(taskID);
      fetchComments(taskID);
      fetchAttachments(taskID);
    }
  }, [taskID]);

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Space size="middle">
            <Title level={4} style={{ margin: 0 }}>
              {selectedTask?.name} {selectedTask?.priority}
            </Title>
          </Space>
          {isManager && (
            <Button danger icon={<DeleteOutlined />} onClick={deleteTask}>
              Delete Task
            </Button>
          )}
        </div>
      }
      placement="right"
      onClose={handleCancelTaskInformation}
      open={isModalTaskInformation}
      width={800}
      className="task-drawer"
    >
      <Spin spinning={loading}>
        <div
          className="drawer-content"
          style={{ display: "flex", flexDirection: "row", gap: "20px" }}
        >
          <div className="main-content" style={{ flex: 3 }}>
            <Card
              title={
                <Space>
                  <PaperClipOutlined /> Attachments
                </Space>
              }
              bordered={false}
              style={{ marginBottom: "16px" }}
              extra={
                <Upload
                  customRequest={handleUpload}
                  showUploadList={false}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.rar"
                >
                  <Button icon={<UploadOutlined />} loading={uploadLoading}>
                    Upload
                  </Button>
                </Upload>
              }
            >
              {attachments?.length > 0 ? (
                <div className="attachment-container">
                  <Row gutter={[16, 16]} wrap={false}>
                    {attachments.map((item) => {
                      const isImage = [
                        ".jpg",
                        ".jpeg",
                        ".png",
                        ".gif",
                        ".bmp",
                        ".webp",
                      ].includes(item?.fileType);
                      return (
                        <Col key={item.id}>
                          <Card
                            hoverable
                            cover={
                              isImage ? (
                                <Image
                                  className="attachment-image"
                                  src={`${process.env.REACT_APP_API_URL}/api/tasks/attachments/${item.fileName}`}
                                  preview={{
                                    mask: `${item?.fileName.split("-").pop()}`,
                                  }}
                                />
                              ) : (
                                <div className="file-preview">
                                  {getFileIcon(item.fileType)}
                                  <div className="file-mask">
                                    {item?.fileName.split("-").pop()}
                                  </div>
                                </div>
                              )
                            }
                            actions={[
                              <Button
                                type="primary"
                                ghost
                                icon={<DownloadOutlined />}
                                onClick={() =>
                                  downloadAttachment(item.fileName)
                                }
                              />,
                              isManager && (
                                <Popconfirm
                                  title="Delete the attachment"
                                  description="Are you sure to delete this attachment?"
                                  onConfirm={() => deleteAttachment(item.id)}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <Button danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              ),
                            ]}
                          ></Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ) : (
                <Text type="secondary">No attachments</Text>
              )}
            </Card>
            <Card
              title={
                <Space>
                  <FileOutlined /> Description
                </Space>
              }
              bordered={false}
              style={{ marginBottom: "16px" }}
            >
              <Paragraph>
                {selectedTask?.description || (
                  <Text type="secondary">No description provided</Text>
                )}
              </Paragraph>
            </Card>
            <Card
              title={
                <Space>
                  <CommentOutlined /> Comments
                </Space>
              }
              bordered={false}
            >
              {/* Ô nhập bình luận chính */}
              <div style={{ marginBottom: "16px" }}>
                <TextArea
                  placeholder="Add a comment..."
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ marginBottom: "8px" }}
                />
                <Button
                  type="primary"
                  onClick={handleSaveComment}
                  disabled={!newComment.trim()}
                >
                  Comment
                </Button>
              </div>

              {/* Danh sách bình luận */}
              {comments?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={comments.filter((comment) => !comment.replyId)} // Chỉ hiển thị các bình luận gốc
                  renderItem={(comment) => {
                    const menu = (
                      <Menu>
                        <Menu.Item
                          key="delete"
                          danger
                          onClick={() => deleteComment(comment.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    );

                    return (
                      <React.Fragment key={comment.id}>
                        <List.Item
                          actions={[
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item
                                    key="delete"
                                    danger
                                    onClick={() => deleteComment(comment.id)} // Truyền đúng ID của reply
                                  >
                                    Delete
                                  </Menu.Item>
                                </Menu>
                              }
                              trigger={["click"]}
                            >
                              <Button type="text" icon={<MoreOutlined />} />
                            </Dropdown>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              takeAvatar(comment?.userId) ? (
                                <Avatar src={takeAvatar(comment?.userId)} />
                              ) : (
                                <Avatar style={{ backgroundColor: "#1890ff" }}>
                                  {takeName(comment?.userId)
                                    .charAt(0)
                                    .toUpperCase()}
                                </Avatar>
                              )
                            }
                            title={
                              <Space>
                                <Text strong>{takeName(comment?.userId)}</Text>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "12px" }}
                                >
                                  {dayjs(comment?.createdAt).fromNow()}
                                </Text>
                              </Space>
                            }
                            description={
                              <div>
                                <Typography.Text
                                  style={{
                                    fontSize: "14px",
                                    color: "#333",
                                    paddingRight: "20px",
                                  }}
                                >
                                  {comment.content}
                                </Typography.Text>
                                <Space size="small">
                                  <Button
                                    type="link"
                                    size="small"
                                    style={{
                                      fontSize: "12px",
                                      padding: 0,
                                      color: "#b5b3ac",
                                    }}
                                    onClick={() => handleReplyClick(comment.id)}
                                  >
                                    Reply
                                  </Button>
                                </Space>
                              </div>
                            }
                          />
                        </List.Item>

                        {/* Hiển thị các phản hồi của bình luận này */}
                        {comments
                          .filter((reply) => reply.replyId === comment.id) // Lấy các phản hồi của bình luận hiện tại
                          .map((reply) => (
                            <List.Item
                              key={reply.id}
                              style={{ marginLeft: "24px" }} // Thụt lề để hiển thị phân cấp
                              actions={[
                                <Dropdown
                                  overlay={
                                    <Menu>
                                      <Menu.Item
                                        key="delete"
                                        danger
                                        onClick={() => deleteComment(reply.id)} // Truyền đúng ID của reply
                                      >
                                        Delete
                                      </Menu.Item>
                                    </Menu>
                                  }
                                  trigger={["click"]}
                                >
                                  <Button type="text" icon={<MoreOutlined />} />
                                </Dropdown>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  takeAvatar(reply.userId) ? (
                                    <Avatar src={takeAvatar(reply.userId)} />
                                  ) : (
                                    <Avatar
                                      style={{ backgroundColor: "#1890ff" }}
                                    >
                                      {takeName(reply.userId)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </Avatar>
                                  )
                                }
                                title={
                                  <Space>
                                    <Text strong>{takeName(reply.userId)}</Text>
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {dayjs(reply.createdAt).fromNow()}
                                    </Text>
                                  </Space>
                                }
                                description={reply.content}
                              />
                            </List.Item>
                          ))}

                        {/* Ô nhập liệu phản hồi */}
                        {replyingTo === comment.id && (
                          <div style={{ marginLeft: "24px", marginTop: "8px" }}>
                            <TextArea
                              placeholder="Write a reply..."
                              rows={2}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              style={{ marginBottom: "8px" }}
                            />
                            <Button
                              type="primary"
                              onClick={handleSubmitReply}
                              disabled={!replyContent.trim()}
                            >
                              Reply
                            </Button>
                            <Button
                              type="text"
                              onClick={() => setReplyingTo(null)} // Hủy phản hồi
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  }}
                />
              ) : (
                <Text type="secondary">No comments yet</Text>
              )}
            </Card>
          </div>

          <div className="sidebar" style={{ flex: 1 }}>
            <Card bordered={false} style={{ marginBottom: "16px" }}>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div>
                  <Text type="secondary">Assignee</Text>
                  <div
                  // className={`field-value ${isExpired ? "disabled" : ""}`}
                  >
                    {selectedTask?.assignee ? (
                      <Space>
                        {takeAvatar(selectedTask?.assignee?.userId) ? (
                          <Avatar
                            src={takeAvatar(selectedTask?.assignee?.userId)}
                            alt={takeName(selectedTask?.assignee?.userId)}
                          />
                        ) : (
                          <Avatar style={{ backgroundColor: "#87d068" }}>
                            {takeName(selectedTask?.assignee?.userId)
                              ?.charAt(0)
                              .toUpperCase()}
                          </Avatar>
                        )}

                        <div>
                          <Text>
                            {takeName(selectedTask?.assignee?.userId)}
                          </Text>
                          {isManager && (
                            <Button
                              type="text"
                              danger
                              size="small"
                              onClick={() =>
                                handleRemoveAssignee(
                                  selectedTask?.assignee?.userId
                                )
                              }
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </Space>
                    ) : isOpenSelect ? (
                      <>
                        <Select
                          showSearch
                          allowClear
                          style={{ width: "100%", marginBottom: "8px" }}
                          value={selectedUser}
                          onChange={(value) => setSelectedUser(value)}
                          placeholder="Search by name"
                          optionFilterProp="label"
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? "")
                              .toLowerCase()
                              .localeCompare(
                                (optionB?.label ?? "").toLowerCase()
                              )
                          }
                          options={options}
                        />
                        <Space>
                          <Button
                            type="primary"
                            onClick={handleAddAssignee}
                            disabled={!selectedUser}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setIsOpenSelect(false);
                              setSelectedUser("");
                            }}
                          >
                            Cancel
                          </Button>
                        </Space>
                      </>
                    ) : (
                      <Button
                        icon={<UserOutlined />}
                        type="dashed"
                        disabled={!isManager}
                        onClick={() => setIsOpenSelect(true)}
                        style={{ width: "100%" }}
                      >
                        Unassigned
                      </Button>
                    )}
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div>
                  <Text type="secondary">Reporter</Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    {takeAvatar(selectedTask?.reporterId) ? (
                      <Avatar src={takeAvatar(selectedTask?.reporterId)} />
                    ) : (
                      <Avatar style={{ backgroundColor: "#1890ff" }}>
                        {takeName(selectedTask?.reporterId) &&
                          takeName(selectedTask?.reporterId)
                            .charAt(0)
                            .toUpperCase()}
                      </Avatar>
                    )}
                    <Text>{takeName(selectedTask?.reporterId)}</Text>
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div>
                  <Text type="secondary">Activity</Text>
                  <List size="small" style={{ marginTop: "4px" }}>
                    <List.Item>
                      <Space>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <Text type="secondary">
                          Created {dayjs(selectedTask?.createdAt).fromNow()}
                        </Text>
                      </Space>
                    </List.Item>
                    <List.Item>
                      <Space>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <Text type="secondary">
                          Updated {dayjs(selectedTask?.updatedAt).fromNow()}
                        </Text>
                      </Space>
                    </List.Item>
                  </List>
                </div>
              </Space>
            </Card>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default ModelDetailTask;

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Image,
  Select,
  Button,
  Radio,
  Typography,
  Space,
  Upload,
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  UserOutlined,
  FileOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { jwtTranslate, getBase64 } from "../../ultilis";
import { useCookies } from "react-cookie";
import * as TaskService from "../../services/TaskService";
import * as Message from "../../components/MessageComponent/MessageComponent";
const { Text } = Typography;
const { TextArea } = Input;

const priorityColors = {
  low: "#52c41a",
  medium: "#faad14",
  high: "#ff4d4f",
};

const AddProjectModal = ({
  isModalVisible,
  setIsModalVisible,
  options,
  fetchAllData,
}) => {
  const [cookiesAccessToken] = useCookies("");
  const [form] = Form.useForm();
  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const projectId = localStorage.getItem("projectId");
  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleCancel = () => {
    setIsModalVisible(false);
    setPreviewImage(false);
    setFileList([]);
    form.resetFields(); // Reset the form fields
  };
  const handleAddTask = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("projectId", projectId);
      formData.append("assignee", values.assignees);
      formData.append("description", values.description || "");
      formData.append("priority", values.priority);
      formData.append("reporterId", infoUser.sub);
      console.log(values.description);
      fileList.forEach((file) => {
        formData.append("attachment", file.originFileObj);
      });
      const res = await TaskService.createTask(projectId, formData);
      if (res.status == 200 || res.status == 201) {
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
  // Xử lý khi người dùng tải lên file
  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  // Xử lý khi người dùng xóa file
  const handleRemove = (file) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFileList);
  };
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };
  return (
    <Modal
      title={"Create New Task"}
      open={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={520}
      centered
    >
      <Form form={form} onFinish={handleAddTask} layout="vertical">
        {/* Task Name */}
        <Form.Item
          label="Task Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the task name!",
            },
          ]}
        >
          <Input
            placeholder="Enter task name"
            prefix={<TagOutlined />}
            allowClear
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label="Description"
          name="description"
          extra={
            <Text type="secondary" className="text-xs">
              Optional: Add more details about the task
            </Text>
          }
        >
          <TextArea placeholder="Provide task details" rows={3} allowClear />
        </Form.Item>

        {/* Members */}
        <Form.Item
          label="Members"
          name="assignees"
          rules={[
            {
              required: true,
              message: "Please select at least one member!",
            },
          ]}
        >
          <Select
            placeholder="Select team members"
            style={{ width: "100%" }}
            options={options}
            prefix={<UserOutlined />}
            allowClear
          />
        </Form.Item>
        <Form.Item
          label="Priority"
          name="priority"
          rules={[
            {
              required: true,
              message: "Please select the priority!",
            },
          ]}
        >
          <Radio.Group>
            <Radio.Button value="low" style={{ color: priorityColors.low }}>
              Low
            </Radio.Button>
            <Radio.Button
              value="medium"
              style={{ color: priorityColors.medium }}
            >
              Medium
            </Radio.Button>
            <Radio.Button value="high" style={{ color: priorityColors.high }}>
              High
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* File Upload */}
        <Form.Item label="Attachments" name="attachments">
          <Upload
            fileList={fileList}
            onChange={handleUpload}
            listType="picture-card"
            onRemove={handleRemove}
            beforeUpload={() => false}
            onPreview={handlePreview}
            icon={<UploadOutlined />}
          >
            {fileList.length >= 4 ? null : (
              <button
                style={{
                  border: 0,
                  background: "none",
                }}
                type="button"
              >
                <PlusOutlined />
                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  Upload
                </div>
              </button>
            )}
          </Upload>

          {/* Hiển thị danh sách file */}
          {previewImage && (
            <Image
              wrapperStyle={{
                display: "none",
              }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectModal;

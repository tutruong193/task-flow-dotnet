import React from "react";
import { Modal, Space, Form, Input, Switch, Button } from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";
const ModelAddColumn = ({
  isModalAddColumn,
  handleCancelAddColumn,
  handleAddColumn,
  formAddColumn,
  onChangeFileRequired,
}) => {
  return (
    <Modal
      title={
        <Space>
          <span>Create New Column</span>
        </Space>
      }
      open={isModalAddColumn}
      onCancel={handleCancelAddColumn}
      footer={null}
      width={520}
      centered
    >
      <Form
        form={formAddColumn}
        onFinish={handleAddColumn}
        layout="vertical"
        initialValues={{
          priority: "high",
          description: "",
        }}
      >
        <Form.Item
          label="Colum Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the Colum name!",
            },
          ]}
        >
          <Input placeholder="Enter Colum name" allowClear />
        </Form.Item>
        <Form.Item label="File Required" name="fileRequired">
          <Switch defaultChecked onChange={onChangeFileRequired} />
        </Form.Item>
      </Form>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
          <Button onClick={handleCancelAddColumn}>Cancel</Button>
        </Space>
      </Form.Item>
    </Modal>
  );
};

export default ModelAddColumn;

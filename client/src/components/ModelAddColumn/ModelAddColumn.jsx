import React from "react";
import { Modal, Space, Form, Input, Switch, Button } from "antd";

const ModelAddColumn = ({
  onChangeName,
  isModalAddColumn,
  handleCancelAddColumn,
  handleAddColumn,
  formAddColumn,
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
      footer={[
        <Button key="cancel" onClick={handleCancelAddColumn}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => formAddColumn.submit()} // Submit form khi nhấn OK
        >
          Add Column
        </Button>,
      ]}
      width={520}
      centered
    >
      <Form
        form={formAddColumn}
        layout="vertical"
        initialValues={{
          name: "",
          fileRequired: true,
        }}
        onFinish={handleAddColumn} // Gọi khi form hợp lệ
      >
        <Form.Item
          label="Column Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the Column name!",
            },
          ]}
        >
          <Input
            placeholder="Enter Column name"
            allowClear
            onChange={onChangeName}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelAddColumn;

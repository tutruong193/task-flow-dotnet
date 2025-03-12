import React, { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Table,
  Tag,
  Input,
  Modal,
  Form,
  Checkbox,
  Popconfirm,
  Radio,
} from "antd";
import * as UserService from "../../../services/UserService";
import { useQuery } from "@tanstack/react-query";
import * as Message from "../../../components/MessageComponent/MessageComponent";
const AccountPage = () => {
  //setup table
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => highlightText(name, searchValue),
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => highlightText(email, searchValue),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (phone ? phone : "None"),
    },
    {
      title: "Roles",
      key: "roles",
      dataIndex: "roles",
      filters: [
        { text: "Manager", value: "manager" },
        { text: "Member", value: "member" },
      ],
      onFilter: (value, record) => record.roles === value,
      render: (role) => {
        // Xác định màu dựa trên vai trò
        let color =
          role === "member" ? "green" : role === "manager" ? "gold" : "default";
        return (
          <Tag color={color} key={role}>
            {role.toUpperCase()} {/* Chuyển đổi role thành chữ hoa */}
          </Tag>
        );
      },
    },

    {
      title: "Data Added",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Data Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (_, record) => {
        return dataTable.length > 0 ? (
          <div>
            <EditOutlined
              style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
              onClick={() => showModalEditUser(record?.key)}
            />
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              onConfirm={() => confirmDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined
                style={{ color: "orange", fontSize: "30px", cursor: "pointer" }}
              />
            </Popconfirm>
          </div>
        ) : null;
      },
    },
  ];
  //fetch user data
  const fetchUserAll = async () => {
    const res = await UserService.getAllUser();
    return res;
  };
  const userQuerry = useQuery({
    queryKey: ["users"],
    queryFn: fetchUserAll,
    config: { retry: 3, retryDelay: 1000 },
  });
  const { data: users } = userQuerry;
  const dataTable =
    users?.data
      ?.filter((user) => user.role !== "admin")
      .map((user) => ({
        key: user._id,
        name: user.name,
        email: user.email,
        roles: user.role,
        phone: user.phone,
        createdAt: new Date(user.createdAt).toLocaleString(),
        updatedAt: new Date(user.updatedAt).toLocaleString(),
      })) || [];
  ///model add user
  const [isModalAddUser, setIsModalAddUser] = useState(false);
  const showModalAddUser = () => {
    setIsModalAddUser(true);
  };
  const isFormValid = () => {
    const { name, email, role } = stateAddUser;
    return name && email && role;
  };
  //add user
  const [form] = Form.useForm();
  const [stateAddUser, setStateAddUser] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
  });
  const handleOnChangeAddUser = (e) => {
    setStateAddUser({
      ...stateAddUser,
      [e.target.name]: e.target.value,
    });
  };
  const handleOnChangeRole = (e) => {
    setStateAddUser({
      ...stateAddUser,
      role: e.target.value, // Cập nhật role là mảng các giá trị được chọn
    });
  };
  const handleAddUser = async () => {
    const res = await UserService.createUser(stateAddUser);
    if (res.status === "OK") {
      Message.success();
      form.resetFields();
      setIsModalAddUser(false);
      setStateAddUser({
        name: "",
        email: "",
        phone: "",
        role: "",
      });
      userQuerry.refetch();
    } else if (res.status === "ERR") {
      Message.error(res.message);
    }
  };
  const handleCancelAddUser = () => {
    form.resetFields();
    setIsModalAddUser(false);
  };
  ///delete single user
  const confirmDelete = async (record) => {
    const res = await UserService.deleteUser(record?.key);
    if (res.status === "OK") {
      Message.success();
      userQuerry.refetch();
    } else if (res.status === "ERR") {
      Message.error(res.message);
    }
  };
  //delete many
  const [selectedManyKeys, setSelectedManyKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedManyKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedManyKeys,
    onChange: onSelectChange,
  };
  const handleDeleteMany = async () => {
    if (selectedManyKeys.length > 0) {
      const res = await UserService.deleteManyUser(selectedManyKeys);
      if (res.status === "OK") {
        Message.success("Deleted successfully!");
        userQuerry.refetch();
        setSelectedManyKeys([]);
      } else {
        Message.error(res.message || "Failed to delete users");
      }
    }
  };
  //edit user
  const [formEdit] = Form.useForm();
  const [isModalEditUser, setIsModalEditUser] = useState(false);
  const [stateEditUser, setStateEditUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const showModalEditUser = async (id) => {
    setIsModalEditUser(true);
    const res = await UserService.getDetailsUser(id);
    if (res.status === "OK") {
      const userData = res.data;
      setStateEditUser(userData);
      formEdit.setFieldsValue({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
      });
    } else {
      Message.error(res.message);
    }
  };
  const handleCancelEditUser = () => {
    formEdit.resetFields();
    setIsModalEditUser(false);
  };
  const handleEditUser = async () => {
    const updatedUser = {
      ...stateEditUser,
      ...formEdit.getFieldsValue(),
    };
    console.log(updatedUser);
    const res = await UserService.updateUser(stateEditUser?._id, updatedUser);
    if (res.status === "OK") {
      Message.success("User updated successfully!");
      formEdit.resetFields();
      setIsModalEditUser(false);
      setStateEditUser({
        name: "",
        email: "",
        phone: "",
        role: "",
      });
      userQuerry.refetch();
    } else {
      Message.error(res.message || "Failed to update user");
    }
  };
  //search user
  const [searchValue, setSearchValue] = useState("");
  const handleSearch = (e) => {
    setSearchValue(e.target.value); // Cập nhật giá trị tìm kiếm theo từng ký tự
  };
  const filteredDataTable = dataTable?.filter((user) =>
    user.name.toLowerCase().includes(searchValue.toLowerCase())
  );
  const highlightText = (text, searchValue) => {
    if (!searchValue) return text;
    const parts = text.split(new RegExp(`(${searchValue})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchValue.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };
  return (
    <div style={{ width: "100%" }}>
      <div className="container_admin_account">
        <div className="container_admin_account_title">
          <h2>User management</h2>
        </div>
        <div className="container_admin_account_header">
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Enter the name or email"
              prefix={<SearchOutlined />}
              onChange={handleSearch}
            />
            <div className="container_admin_account_action">
              <Button type="primary" onClick={showModalAddUser}>
                Add
              </Button>
              <Button
                type="primary"
                disabled={selectedManyKeys.length === 0}
                onClick={handleDeleteMany}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Table
            dataSource={searchValue ? filteredDataTable : dataTable}
            columns={columns}
            rowSelection={rowSelection}
            pagination={{ className: "table-pagination" }}
            bordered
            virtual
            scroll
          />
        </div>
      </div>
      <Modal
        title="Create a new account"
        open={isModalAddUser}
        onOk={handleAddUser}
        onCancel={handleCancelAddUser}
        okButtonProps={{ disabled: !isFormValid() }}
      >
        <Form
          form={form}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name",
              },
            ]}
          >
            <Input onChange={handleOnChangeAddUser} name="name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input onChange={handleOnChangeAddUser} name="email" />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone">
            <Input onChange={handleOnChangeAddUser} name="phone" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please input your role!",
              },
            ]}
          >
            <Radio.Group onChange={handleOnChangeRole} value={"manager"}>
              <Radio value={"manager"}>Manager</Radio>
              <Radio value={"member"}>Member</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit account information"
        open={isModalEditUser}
        onOk={handleEditUser}
        onCancel={handleCancelEditUser}
      >
        <Form
          form={formEdit}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name",
              },
            ]}
          >
            <Input name="name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input name="email" />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone">
            <Input name="phone" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please input your role!",
              },
            ]}
          >
            <Radio.Group>
              <Radio value={"manager"}>Manager</Radio>
              <Radio value={"member"}>Member</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default AccountPage;

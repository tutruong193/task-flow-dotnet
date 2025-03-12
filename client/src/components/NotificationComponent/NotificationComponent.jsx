import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import hook để lấy đường dẫn
import { BellOutlined } from "@ant-design/icons";
import { Dropdown, List, Typography } from "antd";
import * as NotificationService from "../../services/NotificationService";

const { Text } = Typography;

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const projectId = localStorage.getItem("projectId");
  const location = useLocation(); // Hook để lấy thông tin đường dẫn hiện tại

  // Định dạng ngày
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

  // Hàm fetch thông báo
  const fetchNotifications = async () => {
    const res = await NotificationService.getAllNotificationByIdProject(
      projectId
    );
    if (res.status === "OK") {
      const sortedNotifications = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);
    }
  };

  // Kiểm tra đường dẫn và gọi fetch
  useEffect(() => {
    if (location.pathname !== "/system/user/your-work") {
      fetchNotifications();
    }
  }); // Chạy lại khi đường dẫn thay đổi

  // Nội dung thông báo
  const NotificationContent = (
    <div
      style={{
        width: 350,
        maxHeight: 500,
        overflowY: "auto",
        backgroundColor: "white",
        border: "1px solid",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 15px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Text strong>Notifications</Text>
      </div>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor: "#f0f8ff",
              padding: "10px 15px",
              cursor: "pointer",
            }}
          >
            <List.Item.Meta
              title={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {renderDate(item.createdAt)}
                  </Text>
                </div>
              }
              description={item.content}
            />
          </List.Item>
        )}
      />

      {notifications.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#999",
          }}
        >
          No notifications
        </div>
      )}
    </div>
  );

  // Kiểm tra và hiển thị icon chuông
  if (location.pathname === "/system/user/your-work") {
    return null; // Không hiển thị nếu đang ở đường dẫn này
  }

  return (
    <Dropdown
      overlay={NotificationContent}
      trigger={["click"]}
      placement="bottomRight"
      overlayStyle={{ width: 400 }}
    >
      <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
    </Dropdown>
  );
};

export default NotificationComponent;

import React, { useEffect, useState } from "react";
import { Select, Card, Typography, Tag, Empty, Divider } from "antd";
import {
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import * as ProjectService from "../../../services/ProjectService";
import * as NotificationService from "../../../services/NotificationService";

const { Option } = Select;
const { Text, Title } = Typography;
const dateFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

const renderDate = (date) => {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", dateFormatOptions).format(parsedDate);
};
const ActivityPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState({});
  const fetchNotifications = async (projectId) => {
    try {
      const res = await NotificationService.getAllNotificationByIdProject(
        projectId
      );
      if (res.status === "OK" && res.data) {
        const sortedNotifications = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications((prevNotifications) => ({
          ...prevNotifications,
          [projectId]: sortedNotifications,
        }));
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
      setNotifications((prevNotifications) => ({
        ...prevNotifications,
        [projectId]: [],
      }));
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectRes = await ProjectService.getAllProject();
        if (projectRes.status === "OK" && projectRes.data) {
          setProjects(projectRes.data);
          if (projectRes.data.length > 0) {
            const firstProjectId = projectRes.data[0]._id;
            setSelectedProject(firstProjectId);
            await fetchNotifications(firstProjectId);
          }
        }
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectChange = async (value) => {
    setSelectedProject(value);
    if (!notifications[value]) {
      await fetchNotifications(value);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="container_admin_account">
        <h2 style={{ margin: 0 }}>Activity</h2>
      </div>
      <div style={{ padding: "20px" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Select
            placeholder="Select a project"
            style={{
              width: "100%",
              marginBottom: "20px",
            }}
            size="large"
            value={selectedProject}
            onChange={handleProjectChange}
            suffixIcon={<FileSearchOutlined />}
          >
            {projects &&
              projects.map((project) => (
                <Option key={project._id} value={project._id}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    {project.name}
                  </div>
                </Option>
              ))}
          </Select>

          {selectedProject && notifications[selectedProject]?.length > 0 ? (
            notifications[selectedProject].map((notification) => (
              <Card
                key={notification._id}
                hoverable
                style={{
                  marginBottom: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>{notification.content}</Text>
                </div>
                <Divider style={{ margin: "10px 0" }} />
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: "8px" }} />
                  {renderDate(notification.createdAt)}
                </Text>
              </Card>
            ))
          ) : (
            <Empty
              description="No activities found for this project"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ActivityPage;

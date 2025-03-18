import React, { useState, useEffect } from "react";
import { Card, Row, Col, Progress, Statistic, Space, Divider } from "antd";
import { ProjectOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import * as UserService from "../../../services/UserService";
import * as ProjectService from "../../../services/ProjectService";
const DashboardPage = () => {
  const [projectStats, setProjectStats] = useState({
    pending: 0,
    progress: 0,
    done: 0,
    incompleted: 0,
  });
  const [totalUsers, setTotalUsers] = useState({
    manager: 0,
    member: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, userRes] = await Promise.all([
          ProjectService.getAllProject(),
          UserService.getAllUser(),
        ]);
        if (projectRes?.status === "200") {
          const projects = projectRes.data;
          const stats = {
            pending: 0,
            progress: 0,
            done: 0,
            incompleted: 0,
          };
          projects.forEach((project) => {
            if (stats.hasOwnProperty(project.status)) {
              stats[project.status]++;
            }
          });

          setProjectStats(stats);
        } else {
          console.error("Error fetching project details");
        }
        if (userRes?.status == "200") {
          const userCounts = {
            Manager: 0,
            Member: 0,
          };
          userRes.data.forEach((user) => {
            if (userCounts.hasOwnProperty(user.role)) {
              userCounts[user.role]++;
            }
          });

          setTotalUsers(userCounts);
        } else {
          console.error("Error fetching user details");
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const totalProjects =
    projectStats.pending +
    projectStats.progress +
    projectStats.done +
    projectStats.incompleted;
  const totalAccount = totalUsers.Manager + totalUsers.Member;
  return (
    <div style={{ width: "100%" }}>
      <div className="container_admin_account">
        <h2 style={{ margin: 0 }}>Dashboard</h2>
      </div>
      <div style={{ padding: "20px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} lg={12}>
            <Card
              hoverable
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  <ProjectOutlined style={{ marginRight: "10px" }} />
                  Project Status Distribution
                </h3>
              </div>

              <Divider />

              <Row align="middle" justify="space-around" gutter={[16, 16]}>
                {Object.entries(projectStats).map(([status, value]) => {
                  const colorMap = {
                    pending: "#fadb14",
                    progress: "#1890ff",
                    done: "#52c41a",
                    incompleted: "#ff4d4f",
                  };
                  return (
                    <Col xs={24} sm={12} key={status}>
                      <Statistic
                        title={status.charAt(0).toUpperCase() + status.slice(1)}
                        value={value}
                        suffix={`(${Math.round(
                          (value / totalProjects) * 100
                        )}%)`}
                        valueStyle={{ color: colorMap[status] }}
                      />
                      <Progress
                        percent={Math.round((value / totalProjects) * 100)}
                        strokeColor={colorMap[status]}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={24} lg={12}>
            <Card
              hoverable
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  <TeamOutlined style={{ marginRight: "10px" }} />
                  User Distribution
                </h3>
              </div>

              <Divider />
              <Row align="middle" justify="space-around" gutter={[16, 16]}>
                {Object.entries(totalUsers).map(([role, value]) => {
                  const colorMap = {
                    Manager: "#fadb14",
                    Member: "#52c41a",
                  };
                  return (
                    <Col xs={24} sm={12} key={role}>
                      <Statistic
                        title={role.charAt(0).toUpperCase() + role.slice(1)}
                        value={value}
                        suffix={`(${Math.round(
                          (value / totalAccount) * 100
                        )}%)`}
                        valueStyle={{ color: colorMap[role] }}
                      />
                      <Progress
                        percent={Math.round((value / totalAccount) * 100)}
                        strokeColor={colorMap[role]}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardPage;

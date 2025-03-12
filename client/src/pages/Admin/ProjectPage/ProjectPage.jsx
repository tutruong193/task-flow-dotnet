import React, { useEffect, useState } from "react";
import { Card, Row, Col, Progress, Statistic, Tag, Select } from "antd";
import { TeamOutlined, FileSearchOutlined } from "@ant-design/icons";
import * as ProjectService from "../../../services/ProjectService";
import * as TaskService from "../../../services/TaskService";

const ProjectPage = () => {
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

  const [projects, setProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectRes = await ProjectService.getAllProject();

        if (projectRes.status === "OK" && projectRes.data) {
          const projects = projectRes.data;
          setProjects(projects);
          const detailedProjects = [];

          for (const project of projects) {
            const taskRes = await TaskService.getAllTask(project._id);

            const totalTasks = taskRes?.data?.length || 0;
            const completedTasks =
              taskRes?.data?.filter((task) => task?.status === "done")
                ?.length || 0;

            const projectDetail = {
              id: project._id,
              name: project.name,
              members: project?.members?.length || 0,
              totalTasks,
              completedTasks,
              startDate: renderDate(project?.startDate),
              endDate: renderDate(project?.endDate),
              status: project?.status,
            };

            detailedProjects.push(projectDetail);
          }

          setProjectDetails(detailedProjects);

          // Set the first project as default selected if projects exist
          if (detailedProjects.length > 0) {
            setSelectedProject(detailedProjects[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching projects or tasks", error);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "progress":
        return "processing";
      case "done":
        return "green";
      case "pending":
        return "warning";
      case "incompleted":
        return "red";
      default:
        return "default";
    }
  };

  const handleProjectChange = (value) => {
    const project = projectDetails.find((p) => p.id === value);
    setSelectedProject(project);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="container_admin_account">
        <h2 style={{ margin: 0 }}>Project Management</h2>
      </div>
      <div style={{ padding: "20px" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {/* Project Selection Dropdown */}
          <Select
            placeholder="Select a project"
            onChange={handleProjectChange}
            style={{
              width: "100%",
              marginBottom: "20px",
            }}
            suffixIcon={<FileSearchOutlined />}
            value={selectedProject?.id}
          >
            {projectDetails.map((project) => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>

          {/* Project Details Display */}
          {selectedProject && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} lg={24}>
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
                      marginBottom: "15px",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "#1890ff" }}>
                      {selectedProject.name}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "15px",
                    }}
                  >
                    <Statistic
                      title="Members"
                      value={selectedProject.members}
                      prefix={<TeamOutlined />}
                    />
                    <Statistic
                      title="Total Tasks"
                      value={selectedProject.totalTasks}
                    />
                  </div>

                  <Progress
                    percent={Math.round(
                      (selectedProject.completedTasks /
                        selectedProject.totalTasks) *
                        100
                    )}
                    status="active"
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                    style={{ marginBottom: "10px" }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "15px",
                    }}
                  >
                    <Statistic
                      title="Completed"
                      value={`${
                        Math.round(
                          (selectedProject.completedTasks /
                            selectedProject.totalTasks) *
                            100
                        ) || 0
                      }%`}
                      valueStyle={{ color: "#3f8600" }}
                    />
                    <Statistic
                      title="Remaining"
                      value={`${
                        100 -
                          Math.round(
                            (selectedProject.completedTasks /
                              selectedProject.totalTasks) *
                              100
                          ) || 0
                      }%`}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Tag color={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Tag>
                    <div style={{ textAlign: "right" }}>
                      <small>
                        <strong>Start:</strong> {selectedProject.startDate}
                        <br />
                        <strong>End:</strong> {selectedProject.endDate}
                      </small>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProjectPage;

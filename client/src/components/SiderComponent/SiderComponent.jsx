import React, { useState, useEffect } from "react";
import { Layout, Menu, Drawer } from "antd";
import {
  ReadOutlined,
  SearchOutlined,
  UserOutlined,
  TableOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
  DashboardOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useCookies } from "react-cookie";
import { jwtTranslate } from "../../ultilis";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const SiderComponent = () => {
  const navigate = useNavigate();
  const [cookiesAccessToken] = useCookies("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const infoUser = jwtTranslate(cookiesAccessToken.access_token);
  const isManager = infoUser?.role?.includes("manager");
  const isAdmin = infoUser?.role?.includes("admin");
  const location = useLocation();
  // const defaultSelectedKey = isAdmin ? "admin_dashboard" : "user_project_board";
  const lastpath = location.pathname.split("/").pop();
  // const [defaultSelectedKey, setdefaultSelectedKey] = useState("");
  const defaultSelectedKey = lastpath;
  // Check screen size and update mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const items = isAdmin
    ? [
        {
          key: "dashboard",
          icon: <DashboardOutlined />,
          label: "Dashboard",
        },
        {
          key: "account",
          icon: <UserOutlined />,
          label: "Account",
        },
        {
          key: "project",
          icon: <ProjectOutlined />,
          label: "Project",
        },
        {
          key: "activity",
          icon: <ReadOutlined />,
          label: "Activity",
        },
      ]
    : [
        {
          icon: <ProjectOutlined />,
          label: isManager ? "Manage Project" : "Project",
          type: "group",
          children: [
            {
              key: "board",
              label: "Board",
              icon: <TableOutlined />,
            },
            {
              key: "list",
              label: "List",
              icon: <UnorderedListOutlined />,
            },
          ],
        },
      ];

  // Handle menu item click
  const handleMenuClick = (e) => {
    switch (e.key) {
      case "account":
        navigate("/system/admin/account");
        break;
      case "project":
        navigate("/system/admin/project");
        break;
      case "activity":
        navigate("/system/admin/activity");
        break;
      case "dashboard":
        navigate("/system/admin/dashboard");
        break;
      case "board":
        navigate("/system/user/project/board");
        break;
      case "list":
        navigate("/system/user/project/list");
        break;
      default:
        break;
    }
    // Close menu after navigation on mobile
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Render mobile menu button
  const renderMobileMenuButton = () => {
    return isMobile ? (
      <div className="mobile-menu-button" onClick={() => setIsMenuOpen(true)}>
        <MenuOutlined />
      </div>
    ) : null;
  };

  return (
    <>
      {renderMobileMenuButton()}

      {isMobile ? (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setIsMenuOpen(false)}
          open={isMenuOpen}
          className="mobile-menu-drawer"
        >
          <Menu
            selectedKeys={[defaultSelectedKey]}
            mode="inline"
            items={items}
            className="custom-mobile-menu"
            onClick={handleMenuClick}
          />
        </Drawer>
      ) : (
        <Sider width="17%" className="container-sider">
          <div style={{ height: "70px" }}></div>
          <Menu
            defaultSelectedKeys={defaultSelectedKey}
            mode="inline"
            items={items}
            className="custom-menu"
            onClick={handleMenuClick}
          />
        </Sider>
      )}
    </>
  );
};

export default SiderComponent;

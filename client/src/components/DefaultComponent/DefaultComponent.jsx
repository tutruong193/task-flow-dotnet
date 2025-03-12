import React from "react";
import { Layout } from "antd";
import HeaderComponent from "../HeaderComponent/HeaderComponent";
import SiderComponent from "../SiderComponent/SiderComponent";

const DefaultComponent = ({ children, style, showHeader = true, showSider = true }) => {
  return (
    <div style={{ overflow: "hidden" }}>
      {showSider && <SiderComponent />} {/* Hiển thị Sider nếu showSider là true */}
      <Layout style={style}>
        {showHeader && <HeaderComponent />} {/* Hiển thị Header nếu showHeader là true */}
        {children}
      </Layout>
    </div>
  );
};

export default DefaultComponent;

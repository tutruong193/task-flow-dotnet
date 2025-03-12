import React from "react";
import logoImage from "../../assets/logo.png"; // Đảm bảo đường dẫn đúng tới ảnh logo
import { MenuFoldOutlined } from "@ant-design/icons";
const LogoComponent = ({style}) => {
  return (
    <div className="container-logo" style={style}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <img src={logoImage} alt="GymMate Logo" className="logo-image" />
        <div className="logo-text">TaskFlow</div>
      </div>
    </div>
  );
};

export default LogoComponent;

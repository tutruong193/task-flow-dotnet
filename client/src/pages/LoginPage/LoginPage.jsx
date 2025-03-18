import React, { useState } from "react";
import LogoComponent from "../../components/LogoComponent/LogoComponent";
import { Form, Button, Input } from "antd";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom
import * as UserService from "../../services/UserService";
import * as Message from "../../components/MessageComponent/MessageComponent";
import { jwtTranslate } from "../../ultilis";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const [cookiesAccessToken, setCookieAccessToken] = useCookies([
    "access_token",
  ]);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleOnChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    const res = await UserService.loginUser({ email, password });
    if (res?.status === "200") {
      Message.success("Login successful");
      setCookieAccessToken(
        "access_token",
        "Bearer " + res?.token.split(" ")[1],
        {
          path: "/",
          maxAge: 3600,
          secure: true,
          sameSite: "strict",
        }
      );
      const user = jwtTranslate(res?.token);
      if (user?.role.toLowerCase() == "admin") {
        navigate("/system/admin/dashboard");
      } else if (!user?.role.includes("admin")) {
        navigate("/system/user/your-work");
      } else {
        navigate("/login");
      }
    } else {
      Message.error(res?.message);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-content">
          <LogoComponent className="login-logo" />

          <div className="login-header">
            <h5>Welcome Back!</h5>
            <p>Sign in to continue to TaskFlow</p>
          </div>

          <Form
            name="login-form"
            layout="vertical"
            onFinish={handleLogin}
            autoComplete="off"
            className="login-form"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input onChange={handleOnChangeEmail} />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password onChange={handleOnChangePassword} />
            </Form.Item>

            <Form.Item className="login-button-container">
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                disabled={!email || !password}
              >
                Login
              </Button>
            </Form.Item>

            <Form.Item className="forgot-password-button">
              <Link to="/forgotpassword" className="forgot-password-link">
                Forgot Password?
              </Link>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

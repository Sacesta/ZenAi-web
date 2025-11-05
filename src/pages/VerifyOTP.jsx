import React, { useState, useRef } from "react";
import { Form, Input, Button, Typography } from "antd";
import { LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoImage from "../assets/Logo.jpg";
import "../style/Common.scss";
import "../style/Login.scss";

const { Title, Text } = Typography;

const VerifyOTP = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { email, userId } = location.state || {};

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      const otp = values.otp1 + values.otp2 + values.otp3 + values.otp4;
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        user_id: userId,
        otp: otp,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/chat");
      } else {
        toast.error(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      // Show proper error message from API response
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
      });

      if (response.data.success) {
        toast.success("OTP resent successfully!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleInputChange = (index, value) => {
    // Update form value
    form.setFieldsValue({ [`otp${index + 1}`]: value });

    // Move to next input if a digit is entered
    if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const currentValue = form.getFieldValue(`otp${index + 1}`);
      if (!currentValue && index > 0) {
        // Move to previous input and clear it
        inputRefs[index - 1].current.focus();
        form.setFieldsValue({ [`otp${index}`]: '' });
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    paste.split('').forEach((digit, i) => {
      if (i < 4) {
        form.setFieldsValue({ [`otp${i + 1}`]: digit });
        if (i < 3) inputRefs[i + 1].current.focus();
      }
    });
  };

  const onFinish = (values) => {
    handleVerifyOTP(values);
  };

  return (
    <div className="common-container">
      <div className="common-silhouette">
        <div className="common-silhouette-head" />
      </div>

      <div className="common-circle" />

      <img src={logoImage} alt="Zenn Logo" className="common-logo" />

      <div className="common-card-center">
        <Title level={3} className="common-title">
          Verify Your Email
        </Title>

        <Text className="common-text">
          Check {email}for the 4-digit code and enter it below.
        </Text>

        <Form
          form={form}
          name="verify-otp"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "8px",
              background: "transparent",
            }}
          >
            {[1, 2, 3, 4].map((index) => (
              <Form.Item
                key={index}
                name={`otp${index}`}
                rules={[
                  { required: true, message: "Required" },
                  { len: 1, message: "1 digit" },
                  { pattern: /^[0-9]$/, message: "Number only" },
                ]}
                style={{ margin: 0, background: "transparent" }}
              >
                <Input
                  ref={inputRefs[index - 1]}
                  maxLength={1}
                  style={{
                    textAlign: "center",
                    fontSize: "24px",
                    background: "transparent",
                  }}
                  onChange={(e) => handleInputChange(index - 1, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index - 1, e)}
                  onPaste={index === 1 ? handlePaste : undefined}
                />
              </Form.Item>
            ))}
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ marginTop: "10px" }}
              className="common-button"
            >
              Verify OTP
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginBottom: "16px",  color: "#ffffff" }}>
            <Text style={{color:"white"}}>
              Didn't receive the code?{" "}
              <a onClick={handleResendOTP} style={{ cursor: "pointer" , color:"#f93324" }}>
                Resend
              </a>
            </Text>
          </div>

          <Form.Item>
            <Button
              type="text"
              onClick={() => navigate("/login")}
              style={{
                padding: 0,
                height: "auto",
                border: "none",
                background: "transparent",
                color: "#ffffffff",
              }}
            >
              <ArrowLeftOutlined style={{ marginRight: "8px" }} />
              Back to login
            </Button>
          </Form.Item>
        </Form>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default VerifyOTP;

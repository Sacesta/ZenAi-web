import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/Logo.jpg';
import '../style/Common.scss';
import '../style/Login.scss';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSendOTP = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: values.email,
      });

      if (response.data.success) {
        message.success(response.data.message);
        navigate('/verify-otp', { state: { email: values.email, userId: response.data.user_id } });
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values) => {
    handleSendOTP(values);
  };

  return (
    <div className="common-container">
      {/* Silhouette Figure */}
      <div className="common-silhouette">
        {/* Head */}
        <div className="common-silhouette-head" />
      </div>

      <div className="common-circle" />

      <img
        src={logoImage}
        alt="Zenn Logo"
        className="common-logo"
      />

      <div className="common-card-center">
        <Title level={3} className="common-title">
          Welcome to Drona AI
          
        </Title>

        <Text className="common-text">
          Please sign in to continue
        </Text>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="login-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="common-button"
            >
              Send OTP
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;

import React from "react";
import { Button, Typography } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/Logo.jpg";
import "../style/Common.scss";

const { Title, Text } = Typography;

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
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

      <div className="common-card">
        <Title level={3} className="common-title">
          Path to your Inner Zenn
        </Title>

        <Text className="common-text">
          In a world filled with noise, stress, and constant motion, we
          envisioned a space of stillness – where AI-powered therapy and
          mindful practices blend seamlessly into daily life.
        </Text>

        <Button
          type="primary"
          size="large"
          onClick={handleGetStarted}
          className="common-button"
          icon={<PlayCircleOutlined />}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Landing;

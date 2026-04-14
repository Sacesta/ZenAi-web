import React from "react";
import { Button, Typography } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/Logo.png";
import desktopBg from "../assets/Desktop.png";
import "../style/Common.scss";

const { Title, Text } = Typography;

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="common-container" style={{ background: 'none' }}>
      {/* Sharp Desktop Background used at all places */}
      <img
        src={desktopBg}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          imageRendering: '-webkit-optimize-contrast'
        }}
      />

      <div className="common-silhouette" style={{ zIndex: 5 }}>
        <div className="common-silhouette-head" />
      </div>

      <div className="common-circle" style={{ zIndex: 5 }} />

      <img src={logoImage} alt="Zenn Logo" className="common-logo" style={{ zIndex: 10 }} />

      <div className="common-card" style={{ zIndex: 15 }}>
        <Title level={3} className="common-title">
          Path to your Inner Drona
        </Title>

        <Text className="common-text">
          In a world filled with noise, stress, and constant motion, we
          envisioned a space of stillness – where AI-powered therapy and mindful
          practices blend seamlessly into daily life.
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

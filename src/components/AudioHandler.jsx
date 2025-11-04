import React, { useState, useRef } from 'react';
import { Button, message } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import logoImage from '../assets/AiIcon.jpg';

const AudioHandler = ({ onAudioRecorded, isLoading, onRecordingStart, onRecordingStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onAudioRecorded(blob);
        setIsRecording(false);
        if (onRecordingStop) onRecordingStop();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (onRecordingStart) onRecordingStart();
    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="audio-handler">
      <Button
        type="text"
        className={`audio-record-button ${isRecording ? 'recording' : ''}`}
        size="large"
        disabled={isLoading}
        onClick={isRecording ? stopRecording : startRecording}
      >
        <img
          src={logoImage}
          alt="Voice"
          className={`audio-logo ${isRecording ? 'listening' : ''} ${isLoading ? 'loading' : ''}`}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      </Button>
    </div>
  );
};

export default AudioHandler;

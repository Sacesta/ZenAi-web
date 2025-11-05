import React, { useState, useRef } from 'react';
import { Button } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import logoImage from '../assets/AiIcon.jpg';

const AudioHandler = ({ onAudioRecorded, isLoading, isPlaying, onRecordingStart, onRecordingStop }) => {
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

      // Provide specific error messages based on the error type
      if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.name === 'NotReadableError') {
        toast.error('Microphone is already in use by another application.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.name === 'OverconstrainedError') {
        toast.error('Microphone does not meet the required constraints.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.name === 'SecurityError') {
        toast.error('Microphone access blocked due to security restrictions.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (error.name === 'AbortError') {
        toast.error('Microphone access was interrupted.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error('Failed to access microphone. Please check your device and permissions.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
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
          className={`audio-logo ${isRecording ? 'listening' : ''} ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`}
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

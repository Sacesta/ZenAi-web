import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Modal } from 'antd';
import { AudioOutlined, AudioMutedOutlined, PlayCircleOutlined, PauseCircleOutlined, CloseOutlined } from '@ant-design/icons';

const AudioHandler = ({ onAudioRecorded, onAudioPlay, isPlaying }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioRecorded(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };



  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      onAudioPlay(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      onAudioPlay(false);
    }
  };

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => onAudioPlay(false);
    }
  }, [audioUrl, onAudioPlay]);

  return (
    <>
      <div className="audio-handler">
        <Button
          type="text"
          icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
          onClick={isRecording ? stopRecording : startRecording}
          className={`audio-record-button ${isRecording ? 'recording' : ''}`}
          size="large"
        />
        {audioUrl && (
          <Button
            type="text"
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={isPlaying ? pauseAudio : playAudio}
            className="audio-play-button"
            size="large"
          />
        )}
      </div>
      <Modal
        open={isRecording}
        footer={null}
        closable={false}
        centered
        className="audio-recording-modal"
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="audio-recording-content">
          <div className="audio-animation-container">
            <div className="waveform-container">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    width: '3px',
                    height: '10px',
                    backgroundColor: '#ff4d4f',
                    borderRadius: '2px',
                    margin: '0 1px'
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ color: 'white', fontSize: '16px', textAlign: 'center', marginTop: '20px' }}>
            Recording...
          </div>
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
            onClick={stopRecording}
            className="audio-cancel-button"
            size="large"
          />
        </div>
      </Modal>
    </>
  );
};

export default AudioHandler;

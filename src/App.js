import React, { useState, useRef, useEffect } from "react";
import * as facemesh from "@tensorflow-models/facemesh";
import { motion } from "framer-motion";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { createTalkingAvatar, generateSpeech, generateSubtitles } from "./api";
import * as tf from "@tensorflow/tfjs";
import "./App.css";
import { API_KEY, OPENAI_KEY } from "./api";

console.log("✅ API_KEY из api.js:", API_KEY);
console.log("✅ OPENAI_KEY из api.js:", OPENAI_KEY);

export default function App() {
  useEffect(() => {
    tf.setBackend("webgl").then(() => console.log("✅ TensorFlow.js backend set to WebGL"));
  }, []);

  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [speechUrl, setSpeechUrl] = useState(null);
  const [subtitles, setSubtitles] = useState(null);
  const [filter, setFilter] = useState("none");

  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        const model = await facemesh.load();
        console.log("✅ FaceMesh загружен", model);
      } catch (error) {
        console.error("❌ Ошибка загрузки FaceMesh:", error);
      }
    }
    loadModel();
  }, []);

  const processImage = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("❌ Ошибка: контекст canvas не найден");
      return;
    }

    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.5;

    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;

    if (newWidth > maxWidth) {
      const scale = maxWidth / newWidth;
      newWidth *= scale;
      newHeight *= scale;
    }
    if (newHeight > maxHeight) {
      const scale = maxHeight / newHeight;
      newWidth *= scale;
      newHeight *= scale;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.filter = filter;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="app-container">
      <motion.h1 className="title">Talking Photo AI</motion.h1>

      <Card className="card">
        <CardContent>
          <input
            key="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const imageUrl = URL.createObjectURL(file);
                setImage(imageUrl);
              }
            }}
          />
          {image && (
            <>
              <img ref={imageRef} src={image} onLoad={processImage} className="uploaded-image" alt="Uploaded" />
              <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="card">
        <CardContent>
          <input
            key="audio-upload"
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setAudio(URL.createObjectURL(file));
              }
            }}
          />
          {audio && <audio ref={audioRef} controls src={audio} />}
        </CardContent>
      </Card>

      <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Введите текст" />

      <Button onClick={() => generateSpeech(text, setSpeechUrl)}>🗣️ Произнести текст</Button>
      <Button onClick={() => generateSubtitles(text, setSubtitles)}>📝 Сгенерировать субтитры</Button>

      <Button
        onClick={() => {
          if (!image) {
            alert("Пожалуйста, загрузите изображение!");
            return;
          }
          createTalkingAvatar(image, audio || speechUrl, setLoading, setVideoUrl);
        }}
      >
        🎥 Создать AI-видео
      </Button>

      {loading && <p>⏳ Генерация видео...</p>}
      {videoUrl && <video controls src={videoUrl}></video>}
    </div>
  );
}

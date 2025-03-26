import React, { useState, useRef, useEffect } from "react";
import * as facemesh from "@tensorflow-models/facemesh"; // Импорт модели анализа лица
import { motion } from "framer-motion"; // Для анимаций
import { Button } from "./components/ui/button"; // Кастомная кнопка
import { Card, CardContent } from "./components/ui/card"; // Карточки
import { createTalkingAvatar, generateSpeech } from "./api"; // API функции
import * as tf from "@tensorflow/tfjs";

export default function App() {
  tf.setBackend("webgl")
    .then(() => console.log("✅ TensorFlow.js backend set to WebGL"))
    .catch((err) => console.error("❌ Ошибка установки backend:", err));

  // Состояния приложения
  const [image, setImage] = useState(null); // Хранит загруженное изображение
  const [audio, setAudio] = useState(null); // Хранит загруженный аудиофайл
  const [text, setText] = useState(""); // Введенный пользователем текст
  const [loading, setLoading] = useState(false); // Флаг загрузки
  const [videoUrl, setVideoUrl] = useState(null); // URL сгенерированного видео
  const [speechUrl, setSpeechUrl] = useState(null); // URL сгенерированного аудио

  // Ссылки на DOM-элементы
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Загружаем модель FaceMesh при монтировании компонента
  useEffect(() => {
    async function loadModel() {
      try {
        await facemesh.load();
        console.log("✅ Модель FaceMesh загружена");
      } catch (error) {
        console.error("❌ Ошибка загрузки модели:", error);
      }
    }
    loadModel();
  }, []);

  // Обрабатываем изображение и адаптируем его под экран
  const processImage = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Устанавливаем максимальные размеры изображения
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.5;

    let newWidth = img.naturalWidth;
    let newHeight = img.naturalHeight;

    // Масштабируем изображение, если оно больше допустимых размеров
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

    // Устанавливаем размеры canvas и рисуем изображение
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-500 text-white p-1">
      {/* Заголовок */}
      <motion.h1 className="text-3xl font-bold mb-4" animate={{ scale: 1.1 }}>
        Talking Photo AI
      </motion.h1>

      {/* Карточка загрузки изображения */}
      <Card className="p-4 mb-4 w-full max-w-[800px]">
        <CardContent className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
            className="w-full"
          />
          {image && (
            <div className="relative flex justify-center w-full mt-2">
              <img
                ref={imageRef}
                src={image}
                onLoad={processImage}
                alt="Uploaded"
                className="uploaded-image"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Карточка загрузки аудио */}
      <Card className="p-4 mb-4 w-full max-w-[800px]">
        <CardContent>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(URL.createObjectURL(e.target.files[0]))}
            className="w-full"
          />
          {audio && <audio ref={audioRef} controls src={audio} className="mt-2 w-full" />}
        </CardContent>
      </Card>

      {/* Поле ввода текста */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-4 p-2 w-full max-w-[800px] rounded bg-gray-800 border border-gray-700"
        placeholder="Введите текст для генерации речи"
      />

      {/* Кнопки */}
      <div className="flex flex-wrap gap-4 justify-center w-full max-w-[800px] mt-4">
        <Button
          className="bg-green-500 hover:bg-green-600 w-full"
          onClick={() => generateSpeech(text, setSpeechUrl)}
          disabled={!text}
        >
          🗣️ Произнести текст
        </Button>

        <Button
          className="bg-blue-500 hover:bg-blue-600 w-full"
          onClick={() => createTalkingAvatar(image, audio || speechUrl, setLoading, setVideoUrl)}
          disabled={loading || !image}
        >
          {loading ? "⏳ Генерация..." : "🎥 Создать AI-видео"}
        </Button>
      </div>

      {/* Воспроизведение сгенерированного голоса */}
      {speechUrl && (
        <audio controls className="mt-4 w-full max-w-[800px]">
          <source src={speechUrl} type="audio/mp3" />
        </audio>
      )}

      {/* Воспроизведение видео, если оно создано */}
      {videoUrl && (
        <div className="mt-4 w-full max-w-[800px]">
          <h2 className="text-xl mb-2">Ваше AI-видео:</h2>
          <video controls className="w-full">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}

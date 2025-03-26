const API_URL = "http://localhost:5000/talks"; // Используем локальный прокси
export const API_KEY = process.env.REACT_APP_DID_API_KEY || "";
export const OPENAI_KEY = process.env.REACT_APP_OPENAI_API_KEY || "";

if (!API_KEY || !OPENAI_KEY) {
  console.warn("⚠️ ВНИМАНИЕ: API-ключи не найдены! Проверь .env файл.");
}

console.log("D-ID API KEY:", API_KEY);
console.log("OpenAI API KEY:", OPENAI_KEY);

/**
 * 🏆 Функция для создания говорящего аватара
 */
export const createTalkingAvatar = async (image, audio, setLoading, setVideoUrl) => {
  if (!API_KEY) {
    alert("Ошибка: API_KEY не найден!");
    return;
  }

  if (!image || !audio) {
    alert("Загрузите изображение и аудиофайл!");
    return;
  }

  setLoading(true);

  const requestData = {
    source_url: image,
    audio_url: audio,
    driver_url: "bank://lively",
  };

  try {
    console.log("📤 Отправляем запрос в D-ID через прокси...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();
    setLoading(false);

    if (result.id) {
      const videoUrl = `http://localhost:5000/talks/${result.id}`;
      console.log("✅ Видео создано:", videoUrl);
      setVideoUrl(videoUrl);
    } else {
      console.error("❌ Ошибка генерации видео:", result);
      alert("Не удалось создать видео.");
    }
  } catch (error) {
    setLoading(false);
    console.error("❌ Ошибка:", error);
    alert("Ошибка при отправке запроса.");
  }
};

/**
 * 🔥 Функция генерации речи (OpenAI TTS) с ограничением запросов
 */
let lastRequestTime = 0;

export const generateSpeech = async (text, setSpeechUrl) => {
  if (!text) {
    alert("Введите текст для озвучки!");
    return;
  }

  const now = Date.now();
  if (now - lastRequestTime < 5000) { // Ограничение: 1 запрос в 5 секунд
    alert("⏳ Подожди 5 секунд перед следующим запросом.");
    return;
  }
  lastRequestTime = now;

  try {
    console.log("📤 Генерация речи...");

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "alloy",
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка генерации речи: ${response.status}`);
    }

    const data = await response.json();
    setSpeechUrl(data.audio_url);
    console.log("✅ Аудио создано:", data.audio_url);
  } catch (error) {
    console.error("❌ Ошибка генерации речи:", error);
    alert("Ошибка при генерации речи.");
  }
};

/**
 * 🎬 Функция генерации субтитров
 */
export const generateSubtitles = async (text, setSubtitles) => {
  if (!text) {
    alert("Введите текст для генерации субтитров!");
    return;
  }

  try {
    console.log("📜 Генерация субтитров...");

    const subtitles = text.split(". ").map((sentence, index) => ({
      start: index * 2,
      end: (index + 1) * 2,
      text: sentence,
    }));

    setSubtitles(subtitles);
    console.log("✅ Субтитры созданы:", subtitles);
  } catch (error) {
    console.error("❌ Ошибка генерации субтитров:", error);
    alert("Ошибка при генерации субтитров.");
  }
};

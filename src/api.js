const API_URL = "https://api.d-id.com/talks";
const API_KEY = process.env.REACT_APP_DID_API_KEY; // Загружаем API-ключ

/**
 * 🏆 Функция для создания говорящего аватара
 * @param {string} image - URL загруженного изображения
 * @param {string} audio - URL аудиофайла или сгенерированного голоса
 * @param {Function} setLoading - Функция для обновления состояния загрузки
 * @param {Function} setVideoUrl - Функция для установки ссылки на сгенерированное видео
 */
export const createTalkingAvatar = async (image, audio, setLoading, setVideoUrl) => {
  if (!image || !audio) {
    alert("Загрузите изображение и аудиофайл!");
    return;
  }

  setLoading(true);

  const requestData = {
    source_url: image, // URL изображения
    audio_url: audio, // URL аудио
    driver_url: "bank://lively", // Анимация лица (можно менять)
  };

  try {
    console.log("📤 Отправляем запрос в D-ID...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    setLoading(false);

    if (result.id) {
      const videoUrl = `https://api.d-id.com/talks/${result.id}`;
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
 * 🔥 Функция генерации речи на основе текста
 * @param {string} text - Входной текст
 * @param {Function} setSpeechUrl - Функция для обновления состояния сгенерированного аудио
 */
export const generateSpeech = async (text, setSpeechUrl) => {
  if (!text) {
    alert("Введите текст для озвучки!");
    return;
  }

  try {
    console.log("📤 Генерация речи...");

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // OpenAI API Key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // Новый TTS движок
        input: text,
        voice: "alloy" // Можно выбрать другой голос
      }),
    });

    if (!response.ok) {
      throw new Error("Ошибка генерации речи");
    }

    const data = await response.json();
    setSpeechUrl(data.audio_url);
    console.log("✅ Аудио создано:", data.audio_url);
  } catch (error) {
    console.error("❌ Ошибка генерации речи:", error);
    alert("Ошибка при генерации речи.");
  }
};






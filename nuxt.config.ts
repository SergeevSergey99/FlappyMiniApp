// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Basic Nuxt configuration
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false, // Выключаем серверный рендеринг
  runtimeConfig: {
    public: {
      //telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '', // Токен бота
    },
  },
  app: {
    //baseURL: 'https://github.com/SergeevSergey99/FlappyMiniApp', // Замените <repo-name> на имя вашего репозитория
    head: {
      script: [
        {
          src: "https://telegram.org/js/telegram-web-app.js",
          async: true,
        },
      ],
    },
  },
  generate: {
    routes: ["/"], // Добавьте сюда все маршруты, которые нужно сгенерировать
  },
});
<template>
  <div id="app">
    <!-- Начальный экран -->
    <div v-if="gameState === 'start'" class="start-screen">
      <h1>Flappy Bird</h1>
      <button @click="startGame">Start Game</button>
    </div>

    <!-- Игра -->
    <div v-if="gameState === 'playing'">
      <canvas
          ref="gameCanvas"
          id="gameCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
      ></canvas>
      <div class="score">Score: {{ score }}</div>
      <div class="high-score">High Score: {{ highScore }}</div>
    </div>

    <!-- Экран поражения -->
    <div v-if="gameState === 'gameover'" class="gameover-screen">
      <h1>Game Over</h1>
      <p>Your Score: {{ score }}</p>
      <p>High Score: {{ highScore }}</p>
      <button @click="restartGame">Play Again</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvasWidth: 320,
      canvasHeight: 480,
      gravity: 0.1,
      lift: -3,
      pipeGap: 150,
      pipeWidth: 50,
      birdSize: 20,
      score: 0,
      highScore: 0,
      bird: { x: 50, y: 200, velocity: 0 },
      pipes: [],
      gameInterval: null,
      gameState: "start", // Возможные состояния: start, playing, gameover
    };
  },
  methods: {
    // Запуск игры
    startGame() {
      this.gameState = "playing";
      this.setupGame();
    },
    // Настройка игры
    setupGame() {
      this.pipes = this.generatePipes();
      this.bird = { x: 50, y: 200, velocity: 0 };
      this.score = 0;

      this.gameInterval = setInterval(() => {
        this.updateGame();
        this.drawGame();
      }, 20);
    },
    // Обновление состояния игры
    updateGame() {
      this.bird.velocity += this.gravity;
      this.bird.y += this.bird.velocity;

      // Проверка столкновений с верхом/низом
      if (
          this.bird.y + this.birdSize > this.canvasHeight ||
          this.bird.y < 0
      ) {
        this.endGame();
      }

      // Обновление труб
      this.pipes.forEach((pipe, index) => {
        pipe.x -= 2;
        if (pipe.x + this.pipeWidth < 0) {
          this.pipes.splice(index, 1);
          this.pipes.push(this.generatePipe());
          this.score++;
        }

        // Проверка столкновений с трубами
        if (
            this.bird.x + this.birdSize > pipe.x &&
            this.bird.x < pipe.x + this.pipeWidth &&
            (this.bird.y < pipe.top || this.bird.y + this.birdSize > pipe.bottom)
        ) {
          this.endGame();
        }
      });
    },
    // Рисование игры
    drawGame() {
      const canvas = this.$refs.gameCanvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.fillStyle = "skyblue";
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.fillStyle = "green";
      this.pipes.forEach((pipe) => {
        ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.top);
        ctx.fillRect(
            pipe.x,
            pipe.bottom,
            this.pipeWidth,
            this.canvasHeight - pipe.bottom
        );
      });

      ctx.fillStyle = "yellow";
      ctx.fillRect(
          this.bird.x,
          this.bird.y,
          this.birdSize,
          this.birdSize
      );

      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText(`Score: ${this.score}`, 10, 20);
    },
    // Генерация труб
    generatePipes() {
      const pipes = [];
      for (let i = 0; i < 3; i++) {
        pipes.push(this.generatePipe(i * 200 + 300));
      }
      return pipes;
    },
    generatePipe(x = this.canvasWidth) {
      const top =
          Math.random() * (this.canvasHeight - this.pipeGap - 100) + 50;
      const bottom = top + this.pipeGap;
      return { x, top, bottom };
    },
    // Завершение игры
    endGame() {
      clearInterval(this.gameInterval);
      this.checkHighScore();
      this.gameState = "gameover";
    },
    // Перезапуск игры
    restartGame() {
      this.gameState = "start";
    },
    // Проверка и сохранение рекорда
    checkHighScore() {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem("flappyBirdHighScore", this.highScore);
      }
    },
    // Загрузка рекорда
    loadHighScore() {
      const savedScore = localStorage.getItem("flappyBirdHighScore");
      if (savedScore) {
        this.highScore = parseInt(savedScore, 10);
      }
    },
    // Обработка прыжков
    handleJump() {
      event.preventDefault(); // Prevent default click/touch behavior
      this.bird.velocity = this.lift;
    },
    handleKeydown(event) {
      if (event.code === "Space" && this.gameState === "playing") {
        event.preventDefault(); // Prevent scrolling
        this.handleJump();
      }
    },
  },
  mounted() {

    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.error('Telegram WebApp not initialized');
      return;
    }
    tg.expand();
    // Ждём, пока canvas полностью загрузится
    this.$nextTick(() => {
      const canvas = this.$refs.gameCanvas;
      if (canvas) {
        canvas.addEventListener('touchstart', this.handleJump);
        canvas.addEventListener("click", this.handleJump); // Обработка прыжка по клику
      }
    });

    window.addEventListener("keydown", this.handleKeydown); // Обработка прыжка по пробелу
    this.loadHighScore(); // Загрузка рекорда при старте
  },
  beforeUnmount() {
    const canvas = this.$refs.gameCanvas;
    if (canvas) {
      canvas.removeEventListener('touchstart', this.handleJump);
      canvas.removeEventListener("click", this.handleJump);
    }
    window.removeEventListener("keydown", this.handleKeydown);
  },
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #70c5ce;
  margin: 0;
  overflow: hidden;
}

canvas {
  border: 2px solid black;
}

.score {
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
  color: white;
}

.high-score {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
  color: gold;
}

.start-screen,
.gameover-screen {
  text-align: center;
  color: white;
}

.start-screen button,
.gameover-screen button {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  background: green;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.start-screen button:hover,
.gameover-screen button:hover {
  background: darkgreen;
}
</style>

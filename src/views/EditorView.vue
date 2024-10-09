<template>
  <div>
    <input type="file" @change="loadImage" accept="image/*" />
    <input type="color" v-model="strokeColor" @change="updateColor" />
    <button @click="toggleMode">
      {{ isBlurMode ? "Переключиться на рисование" : "Переключиться на блюр" }}
    </button>
    <canvas
      ref="canvas"
      width="800"
      height="600"
      style="border: 1px solid black"
    ></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      ctx: null,
      strokeColor: "#ff0000", // Начальный цвет рисования
      isBlurMode: false, // Режим размытия по умолчанию выключен
    };
  },
  methods: {
    loadImage(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.ctx.drawImage(
            img,
            0,
            0,
            this.$refs.canvas.width,
            this.$refs.canvas.height
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    startDrawing(event) {
      this.isDrawing = true;
      [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
    },
    draw(event) {
      if (!this.isDrawing) return;

      if (this.isBlurMode) {
        // Применяем размытие
        this.applyBlur(event.offsetX, event.offsetY);
      } else {
        // Рисуем линию
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(event.offsetX, event.offsetY);
        this.ctx.stroke();
      }

      [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
    },
    stopDrawing() {
      this.isDrawing = false;
    },
    updateColor() {
      // Обновляем цвет линии
      this.ctx.strokeStyle = this.strokeColor;
    },
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext("2d");
      this.ctx.strokeStyle = this.strokeColor; // Устанавливаем начальный цвет линии
      this.ctx.lineWidth = 5; // Толщина линии
    },
    applyBlur(x, y) {
      const radius = 100; // Радиус размытия
      const imageData = this.ctx.getImageData(
        x - radius,
        y - radius,
        radius * 2,
        radius * 2
      );

      // Создаем временный canvas для размытия
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = radius * 2;
      tempCanvas.height = radius * 2;

      const tempCtx = tempCanvas.getContext("2d");

      // Рисуем на временном canvas
      tempCtx.putImageData(imageData, 0, 0);

      // Применяем размытие (например, Gaussian Blur)
      tempCtx.globalAlpha = 0.5; // Уровень прозрачности для эффекта размытия
      tempCtx.drawImage(
        tempCanvas,
        -radius / 4,
        -radius / 4,
        radius * 2.5,
        radius * 2.5
      );

      // Получаем данные изображения с размытого canvas и накладываем их обратно на основной canvas
      const blurredData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

      // Накладываем размытие на основной canvas
      this.ctx.putImageData(blurredData, x - radius, y - radius);
    },
    toggleMode() {
      this.isBlurMode = !this.isBlurMode; // Переключаем режим
    },
  },
  mounted() {
    this.initCanvas();
    const canvas = this.$refs.canvas;
    canvas.addEventListener("mousedown", this.startDrawing);
    canvas.addEventListener("mousemove", this.draw);
    canvas.addEventListener("mouseup", this.stopDrawing);
    canvas.addEventListener("mouseout", this.stopDrawing);
  },
};
</script>

<style scoped>
canvas {
  cursor: crosshair;
}
</style>

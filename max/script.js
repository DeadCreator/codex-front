const saveBtn = document.querySelector("#save");
const brushTool = document.getElementById("brush-tool");
const blurTool = document.getElementById("blur-tool");
const colorScheme = document.querySelector(".color-scheme");
const colorBtns = document.querySelectorAll(".col-btn");
const sizeInput = document.getElementById("tool-size");
const fileInput = document.getElementById("file-input");
const ground = document.querySelector(".ground");
const canvas = document.getElementById("canvas");

let color = "black";
let size = 50;
let isBrushing = true;
drawOnImage();

blurTool.addEventListener("click", () => {
  colorScheme.classList.add("hide");
  isBrushing = false;
});

brushTool.addEventListener("click", () => {
  colorScheme.classList.remove("hide");
  isBrushing = true;
});

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    color = btn.classList[1];
  });
});

sizeInput.addEventListener("change", () => {
  size = sizeInput.value;
});

saveBtn.addEventListener("click", () => {
  saveBtn.href = canvas.toDataURL("image/png");
  saveBtn.download = "EternalImage";
});

function fileToDataUri(field) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(reader.result);
    });

    reader.readAsDataURL(field);
  });
}

fileInput.addEventListener("change", async (e) => {
  const [file] = fileInput.files;

  // displaying the uploaded image
  const image = document.createElement("img");
  image.src = await fileToDataUri(file);

  image.addEventListener("load", () => {
    drawOnImage(image);
  });
});

function drawOnImage(image = null) {
  const context = canvas.getContext("2d");

  // if an image is present,
  // the image passed as a parameter is drawn in the canvas
  if (image) {
    const ratio = image.width / image.height;
    const imageHeight = ground.clientHeight;
    const imageWidth = imageHeight * ratio;
    console.log(ground.clientHeight, canvas.height);
    // rescaling the canvas element
    console.log(imageHeight, imageWidth);
    canvas.height = imageHeight;
    canvas.width = imageWidth;

    context.drawImage(image, 0, 0, imageWidth, imageHeight);

    let isDrawing;

    ground.onmousedown = (e) => {
      const posX = e.pageX - canvas.offsetLeft;
      const posY = e.pageY - canvas.offsetTop;

      // const blurSpace = context.getImageData(posX - 10, posY - 10, 21, 21);
      // const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      // const data = imageData.data
      // const blurData = blurSpace.data
      // console.log(blurData.length, posX, posY)
      // const arr = new Array(21)
      // for (let subarr in arr) {
      //     subarr = new Array(21)
      // }
      // console.log(arr)
      // for (let row= 0; row < 21; row++) {
      //     for (let col= 1; col < 22; col++)
      //     {
      //         arr[row][col] = 'f'
      //     }
      //     console.log(arr)
      // }
      //
      // context.putImageData(blurSpace, posX - 10, posY - 10);
      isDrawing = true;
      context.beginPath();
      context.lineWidth = size / 5;
      context.strokeStyle = color;
      context.lineJoin = "round";
      context.lineCap = "round";

      context.moveTo(posX, posY);
    };

    document.onmousemove = (e) => {
      if (isDrawing) {
        const posX = e.pageX - canvas.offsetLeft;
        const posY = e.pageY - canvas.offsetTop;

        context.lineTo(posX, posY);
        context.stroke();
        if (!isBrushing) {
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const data = imageData.data;
          console.log(data);
        }
      }
    };

    ground.onmouseup = function () {
      isDrawing = false;
      context.closePath();
    };
  }
}

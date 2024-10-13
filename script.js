const saveBtn = document.querySelector('#save');
const brushTool = document.getElementById('brush-tool');
const blurTool = document.getElementById('blur-tool');
const colorScheme = document.querySelector('.color-scheme');
const colorBtns = document.querySelectorAll('.col-btn');
const sizeInput = document.getElementById('tool-size')
const fileInput = document.getElementById('file-input');
const ground = document.querySelector('.ground');
const canvas = document.getElementById('canvas');

const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');

let color = "black"
let size = 50
let isBrushing = true
let iteration = 0

let isDrawing;
const context = canvas.getContext("2d");

canvas.willReadFrequently = true
drawOnImage()

undoBtn.addEventListener('click', () => {
    iteration--
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const prevImageData = localStorage.getItem(`edit-${iteration}`)
    console.log(prevImageData);
    context.putImageData(prevImageData, 0, 0);

    localStorage.setItem(`edit-${iteration}`, imageData);
})

redoBtn.addEventListener('click', () => {
    iteration++
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    context.putImageData(localStorage.getItem(`edit-${iteration}`), 0, 0);

})

blurTool.addEventListener('click', () => {
    colorScheme.classList.add('hide');
    isBrushing = false
})

brushTool.addEventListener('click', () => {
    colorScheme.classList.remove('hide');
    isBrushing = true
})

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        color = btn.classList[1]
    })
})

sizeInput.addEventListener('change', () => {
    size = sizeInput.value;
})

saveBtn.addEventListener('click', () => {
    saveBtn.href = canvas.toDataURL("image/png")
    saveBtn.download = "EternalImage"

})

function fileToDataUri(field) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        reader.readAsDataURL(field);
    });
}

fileInput.addEventListener('change', async (e) => {
    const [file] = fileInput.files;
    // displaying the uploaded image
    const image = document.createElement("img");
    image.src = await fileToDataUri(file);

    image.addEventListener("load", () => {
        drawOnImage(image);
    });
})



function drawOnImage(image = null) {

    // if an image is present,
    // the image passed as a parameter is drawn in the canvas
    if (image) {
        const ratio = image.width / image.height;
        const imageHeight = ground.clientHeight
        const imageWidth = imageHeight * ratio;
        console.log(ground.clientHeight, canvas.height);
        // rescaling the canvas element
        console.log(imageHeight, imageWidth);
        canvas.height = imageHeight
        canvas.width = imageWidth;

        context.drawImage(image, 0, 0, imageWidth, imageHeight);
    }

}

ground.onmousedown = (e) => {

    const posX = e.pageX - canvas.offsetLeft;
    const posY = e.pageY - canvas.offsetTop;

    isDrawing = true;
    if (isBrushing) {
        context.beginPath();
        context.lineWidth = size / 5;
        context.strokeStyle = color;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.moveTo(posX, posY);
    }
};

document.onmousemove = (e) => {
    const posX = e.pageX - canvas.offsetLeft;
    const posY = e.pageY - canvas.offsetTop;

    if (isDrawing) {
        if (!isBrushing) {
            applyBlur(posX, posY)
        } else {
            context.lineTo(posX, posY);
            context.stroke();
        }
    } else {
        isDrawing = false
    }
};

const applyBlur = (x, y) => {

    const radius = size / 16; // Радиус размытия
    const imageData = context.getImageData(
        x - radius,
        y - radius,
        radius * 2 + 1,
        radius * 2 + 1
    );

    // Создаем временный canvas для размытия
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = radius * 2 + 1;
    tempCanvas.height = radius * 2 + 1;

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

    const r = radius * 2 + 1

    const centerX = Math.floor(r / 2);
    const centerY = Math.floor(r / 2);
    const blurData = blurredData.data
    const imagePixels = imageData.data

    for (let i = 0, j = 0; i < blurData.length; i+=4, j++) {
        const px_x = j % r
        const px_y = Math.floor(j / r)
        if (!((px_x - centerX) ** 2 + (px_y - centerY) ** 2 <= radius ** 2)) {
            blurData[i] = imagePixels[i]
            blurData[i + 1] = imagePixels[i + 1]
            blurData[i + 2] = imagePixels[i + 2]
            blurData[i + 3] = imagePixels[i + 3]
        }
    }

    // Накладываем размытие на основной canvas
    context.putImageData(blurredData, x - radius, y - radius);
}

document.onmouseup = function () {
    if (isDrawing) {
        isDrawing = false;
        context.closePath();
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        localStorage.setItem(`edit-${iteration}`, imageData.data)
        iteration++
    }
};
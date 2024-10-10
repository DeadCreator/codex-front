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
drawOnImage()

undoBtn.addEventListener('click', () => {
    iteration--
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(localStorage.getItem(`edit-${iteration}`), 0, 0, canvas.width, canvas.height);
    localStorage.setItem(`edit-${iteration}`, imageData);
})

redoBtn.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(localStorage.getItem("edit-prev"), 0, 0, canvas.width, canvas.height);

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
    const context = canvas.getContext("2d");

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

        let isDrawing;


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
            if (isDrawing) {
                const posX = e.pageX - canvas.offsetLeft;
                const posY = e.pageY - canvas.offsetTop;


                if (!isBrushing) {
                    applyBlur(posX, posY)
                } else {
                    context.lineTo(posX, posY);
                    context.stroke();
                }
            }
        };

        const applyBlur = (x, y) => {
            const radius = size / 3.5; // Радиус размытия
            const imageData = context.getImageData(
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
            context.putImageData(blurredData, x - radius, y - radius);
        }

        ground.onmouseup = function () {
            isDrawing = false;
            context.closePath();
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            localStorage.setItem("edit-last", imageData)
        };
    }

}
let upcInput;
let generateButton;
let outputSVG;
let outputPNG;
let canvas;

function setup() {
    noCanvas();
    upcInput = createInput('');
    upcInput.attribute('placeholder', 'Enter 11-digit UPC');
    generateButton = createButton('Generate Checksum');
    generateButton.mousePressed(generateAndDisplay);

    outputSVG = createDiv('<h2>SVG Output:</h2>');
    outputPNG = createDiv('<h2>PNG Output:</h2>');
}

function generateAndDisplay() {
    let upc = upcInput.value();
    if (upc.length !== 11 || !/^\d+$/.test(upc)) {
        alert('Please enter an 11-digit numeric UPC.');
        return;
    }

    let checksum = calculateChecksum(upc);
    let fullUpc = upc + checksum;

    displaySVG(fullUpc);
    displayPNG(fullUpc);
}

function calculateChecksum(upc) {
    let sumOdd = 0;
    let sumEven = 0;

    for (let i = 0; i < 11; i++) {
        let digit = parseInt(upc.charAt(i));
        if (i % 2 === 0) {
            sumOdd += digit;
        } else {
            sumEven += digit;
        }
    }

    let total = sumOdd * 3 + sumEven;
    let checksum = (10 - (total % 10)) % 10;
    return checksum;
}

function displaySVG(fullUpc) {
    let svgString = `<svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">`;
    svgString += `<text x="10" y="20">${fullUpc}</text>`;

    let barWidth = 2;
    let xPos = 10;
    let barHeight = 100;

    let leftPatterns = {
        '0': '0001101',
        '1': '0011001',
        '2': '0010011',
        '3': '0111101',
        '4': '0100011',
        '5': '0110001',
        '6': '0101111',
        '7': '0111011',
        '8': '0110111',
        '9': '0001011',
    };

    let rightPatterns = {
        '0': '1110010',
        '1': '1100110',
        '2': '1101100',
        '3': '1000010',
        '4': '1011100',
        '5': '1001110',
        '6': '1010000',
        '7': '1000100',
        '8': '1001000',
        '9': '1110100',
    };

    // Guard bars
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
    xPos += barWidth;

    for (let i = 0; i < 6; i++) {
        let pattern = leftPatterns[fullUpc[i]];
        for (let j = 0; j < pattern.length; j++) {
            if (pattern[j] === '1') {
                svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
            } else {
                svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
            }
            xPos += barWidth;
        }
    }

    // Middle Guard bars
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
    xPos += barWidth;

    for (let i = 6; i < 12; i++) {
        let pattern = rightPatterns[fullUpc[i]];
        for (let j = 0; j < pattern.length; j++) {
            if (pattern[j] === '1') {
                svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
            } else {
                svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
            }
            xPos += barWidth;
        }
    }

    // End Guard bars
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="white" />`;
    xPos += barWidth;
    svgString += `<rect x="${xPos}" y="30" width="${barWidth}" height="${barHeight}" fill="black" />`;

    let svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`; 
    outputSVG.html(`<h2>SVG Output:</h2><a href="${svgData}" download="barcode.svg">${svgString}</a>`);
}

function displayPNG(fullUpc) {
    if (canvas) {
        canvas.remove();
    }
    canvas = createCanvas(300, 150);
    background(255);
    textSize(16);
    text(fullUpc, 10, 20);

    let barWidth = 2;
    let xPos = 10;
    let barHeight = 100;

    let leftPatterns = {
        '0': '0001101',
        '1': '0011001',
        '2': '0010011',
        '3': '0111101',
        '4': '0100011',
        '5': '0110001',
        '6': '0101111',
        '7': '0111011',
        '8': '0110111',
        '9': '0001011',
    };

    let rightPatterns = {
        '0': '1110010',
        '1': '1100110',
        '2': '1101100',
        '3': '1000010',
        '4': '1011100',
        '5': '1001110',
        '6': '1010000',
        '7': '1000100',
        '8': '1001000',
        '9': '1110100',
    };

    // Guard bars
    fill(0);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(255);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(0);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;

    for (let i = 0; i < 6; i++) {
        let pattern = leftPatterns[fullUpc[i]];
        for (let j = 0; j < pattern.length; j++) {
            if (pattern[j] === '1') {
                fill(0);
            } else {
                fill(255);
            }
            rect(xPos, 30, barWidth, barHeight);
            xPos += barWidth;
        }
    }

    // Middle Guard bars
    fill(255);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(0);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(255);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(0);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(255);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;

    for (let i = 6; i < 12; i++) {
        let pattern = rightPatterns[fullUpc[i]];
        for (let j = 0; j < pattern.length; j++) {
            if (pattern[j] === '1') {
                fill(0);
            } else {
                fill(255);
            }
            rect(xPos, 30, barWidth, barHeight);
            xPos += barWidth;
        }
    }

    // End Guard bars
    fill(0);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(255);
    rect(xPos, 30, barWidth, barHeight);
    xPos += barWidth;
    fill(0);
    rect(xPos, 30, barWidth, barHeight);

    let pngImage = canvas.elt.toDataURL('image/png');

    // Create a temporary link element
    let downloadLink = document.createElement('a');
    downloadLink.href = pngImage;
    downloadLink.download = 'barcode.png';

    // Programmatically click the link to trigger the download
    downloadLink.click();

    // Clean up (optional)
    downloadLink.remove(); 

    // Display the image as before
    outputPNG.html(`<h2>PNG Output:</h2><img src="${pngImage}">`); 
}

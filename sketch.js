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
  // Clear previous output
  outputSVG.html('<h2>SVG Output:</h2>'); 

  // Create a new SVG element
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); 
  outputSVG.child(svg);

  // Generate the barcode using JsBarcode
  JsBarcode(svg, fullUpc, {
    format: "upc",
    displayValue: true, // Show the barcode digits
    fontSize: 10,
    textPosition: "bottom", // Position the digits at the bottom
    width: 2, // Adjust bar width as needed
    height: 100, // Adjust bar height as needed
    margin: 10 // Add margin around the barcode
  });

  // Create download link (using Blob as before)
  let svgBlob = new Blob([svg.outerHTML], {type: "image/svg+xml;charset=utf-8"});
  let svgUrl = URL.createObjectURL(svgBlob);
  outputSVG.html(`<h2>SVG Output:</h2><a href="${svgUrl}" download="barcode.svg">${svg.outerHTML}</a>`);
}

function displayPNG(fullUpc) {
  if (canvas) {
    canvas.remove();
  }
  canvas = createCanvas(300, 150); // Adjust canvas size as needed
  JsBarcode(canvas.elt, fullUpc, {
    format: "upc",
    displayValue: true,
    fontSize: 10,
    textPosition: "bottom",
    width: 2,
    height: 100,
    margin: 10
  });

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

let upcInput;
let generateButton;
let outputSVG;
let outputPNG;
let canvas;

function setup() {
  noCanvas();
  upcInput = document.getElementById('upcInput');
  generateButton = document.getElementById('generateButton');
  outputSVG = document.getElementById('barcodeOutput');
  outputPNG = document.getElementById('barcodeDetails');

  generateButton.addEventListener('click', generateAndDisplay);
  upcInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      generateAndDisplay();
    }
  });
}

function generateAndDisplay() {
  let upc = upcInput.value; // Use .value property, not .value()
  if (upc.length !== 11 || !/^\d+$/.test(upc)) {
      alert('Please enter an 11-digit numeric UPC.');
      return;
  }

  let checksum = calculateChecksum(upc);
  let fullUpc = upc + checksum;

  displaySVG(fullUpc);
  displayPNG(fullUpc);
  document.getElementById('barcodeSection').style.display = 'block'; 
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
  outputSVG.innerHTML = ''; // Clear the container first

  // Create a new SVG element
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); 

  // Generate the barcode using JsBarcode
  JsBarcode(svg, fullUpc, {
    format: "upc",
    displayValue: true, // Show the barcode digits
    fontSize: 12,
    textPosition: "bottom", // Position the digits at the bottom
    width: 2, // Adjust bar width as needed
    height: 100, // Adjust bar height as needed
    margin: 10 // Add margin around the barcode
  });

  // Add the SVG element to the output container
  outputSVG.appendChild(svg);

  // Create download link (using Blob)
  let svgBlob = new Blob([svg.outerHTML], {type: "image/svg+xml;charset=utf-8"});
  let svgUrl = URL.createObjectURL(svgBlob);

  // Create a download link element
  let downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = 'barcode.svg';
  downloadLink.textContent = 'Download SVG'; // Add text to the link
  downloadLink.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block'); // Add Tailwind classes

  // Add the download link to the output container
  outputSVG.appendChild(downloadLink);
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

  // Clear previous output
  outputPNG.innerHTML = '';

  // Create an image element
  let img = document.createElement('img');
  img.src = pngImage;
  img.alt = 'Barcode';

  // Add the image to the output container
  outputPNG.appendChild(img);

  // Create a download link element
  let downloadLink = document.createElement('a');
  downloadLink.href = pngImage;
  downloadLink.download = 'barcode.png';
  downloadLink.textContent = 'Download PNG';
  downloadLink.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');

  // Add the download link to the output container
  outputPNG.appendChild(downloadLink);
}

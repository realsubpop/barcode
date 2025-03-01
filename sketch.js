let upcInput;
let generateButton;
let outputSVG;
let outputPNG;
let canvas;
let batchInput;
let batchGenerateButton;
let batchBarcodeOutput;

function setup() {
  noCanvas();
  upcInput = document.getElementById('upcInput');
  generateButton = document.getElementById('generateButton');
  outputSVG = document.getElementById('barcodeOutput');
  outputPNG = document.getElementById('barcodeDetails');
  batchInput = document.getElementById('batchInput');
  batchGenerateButton = document.getElementById('batchGenerateButton');
  batchBarcodeOutput = document.getElementById('batchBarcodeOutput');

  generateButton.addEventListener('click', generateAndDisplay);
  batchGenerateButton.addEventListener('click', generateBatchBarcodes);

  upcInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      generateAndDisplay();
    }
  });

  // Tab switching functionality
  const tabButtons = document.querySelectorAll('button[data-tab]');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
      });
      document.getElementById(tabId).classList.remove('hidden');
    });
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
  
  // Clear previous UPC details if they exist
  let existingDetails = document.getElementById('upcDetails');
  if (existingDetails) {
    existingDetails.remove();
  }

  // Just below 'Your Barcode', we need to just output the UPC+checksum
  let upcDetails = document.createElement('div');
  upcDetails.id = 'upcDetails'; // Set an ID for easy reference
  upcDetails.textContent = `Full Barcode: ${fullUpc}`;
  upcDetails.style.fontSize = '14px'; // Set smaller font size
  
  // Insert upcDetails right after the 'Your Barcode' element
  let barcodeSection = document.getElementById('barcodeSection');
  barcodeSection.insertBefore(upcDetails, barcodeSection.children[1]); // Adjust index as needed

}

function generateBatchBarcodes() {
  const upcList = batchInput.value.split('\n').map(line => line.trim()).filter(line => line !== '');
  batchBarcodeOutput.innerHTML = ''; // Clear previous barcodes

  upcList.forEach(upc => {
    if (upc.length !== 11 || !/^\d+$/.test(upc)) {
      alert(`Invalid UPC: ${upc}. Please enter 11 digits.`);
      return;
    }

    let checksum = calculateChecksum(upc);
    let fullUpc = upc + checksum;
    displayBatchBarcode(fullUpc);
  });

  // Show the batch barcode section *after* adding the barcodes
  document.getElementById('batchBarcodeSection').style.display = 'block'; 
  setTimeout(() => {
    document.getElementById('batchBarcodeSection').style.display = 'block'; 
  }, 0); 
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
  fontSize: 16,
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
downloadLink.download = `UPC_${fullUpc}.svg`;
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
  fontSize: 16,
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
downloadLink.download = `UPC_${fullUpc}.png`;
downloadLink.textContent = 'Download PNG';
downloadLink.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');

// Add the download link to the output container
outputPNG.appendChild(downloadLink);
}

function displayBatchBarcode(fullUpc) {
  let barcodeContainer = document.createElement('div');
  barcodeContainer.classList.add('mb-4', 'p-4', 'border', 'border-gray-300', 'rounded-md');

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, fullUpc, {
    format: "upc",
    displayValue: true,
    fontSize: 16,
    textPosition: "bottom",
    width: 2,
    height: 100,
    margin: 10
  });
  barcodeContainer.appendChild(svg);

  let upcText = document.createElement('p');
  upcText.textContent = `Full Barcode: ${fullUpc}`;
  upcText.classList.add('text-sm', 'mt-2');
  barcodeContainer.appendChild(upcText);

  // Add margin bottom to the upcText
  upcText.style.marginBottom = '10px'; // Adjust the value as needed

  // Create download link for SVG
  let svgBlob = new Blob([svg.outerHTML], {type: "image/svg+xml;charset=utf-8"});
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLinkSVG = document.createElement('a');
  downloadLinkSVG.href = svgUrl;
  downloadLinkSVG.download = `UPC_${fullUpc}.svg`;
  downloadLinkSVG.textContent = 'Download SVG';
  downloadLinkSVG.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded', 'mr-2');
  barcodeContainer.appendChild(downloadLinkSVG); // Add SVG download link

  // Create download link for PNG
  if (!canvas) {
    canvas = createCanvas(300, 150); // Create a new canvas if it doesn't exist
  }
  JsBarcode(canvas.elt, fullUpc, {
    format: "upc",
    displayValue: true,
    fontSize: 16,
    textPosition: "bottom",
    width: 2,
    height: 100,
    margin: 10
  });

  let pngImage = canvas.elt.toDataURL('image/png');
  let downloadLinkPNG = document.createElement('a');
  downloadLinkPNG.href = pngImage;
  downloadLinkPNG.download = `UPC_${fullUpc}.png`;
  downloadLinkPNG.textContent = 'Download PNG';
  downloadLinkPNG.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded');
  barcodeContainer.appendChild(downloadLinkPNG); // Add PNG download link

  batchBarcodeOutput.appendChild(barcodeContainer);
}

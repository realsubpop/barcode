let upcInput;
let generateButton;
let outputSVG;
let outputPNG;
let canvas;
let batchInput;
let batchGenerateButton;
let batchBarcodeOutput;
let exportFormatSelect;

function setup() {
  noCanvas();
  upcInput = document.getElementById('upcInput');
  generateButton = document.getElementById('generateButton');
  outputSVG = document.getElementById('barcodeSVGOutput');
  outputPNG = document.getElementById('barcodePNGOutput');
  outputPDF = document.getElementById('barcodePDFOutput');
  batchInput = document.getElementById('batchInput');
  batchGenerateButton = document.getElementById('batchGenerateButton');
  batchBarcodeOutput = document.getElementById('batchBarcodeOutput');
  exportFormatSelect = document.getElementById('exportFormat'); // Get the select element

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
  let upc = upcInput.value;
  if (upc.length !== 11 || !/^\d+$/.test(upc)) {
    alert('Please enter an 11-digit numeric UPC.');
    return;
  }

  let checksum = calculateChecksum(upc);
  let fullUpc = upc + checksum;

  const exportFormat = exportFormatSelect.value; // Get the selected format

  if (exportFormat === 'svg') {
    displaySVG(fullUpc);
  } else if (exportFormat === 'png') {
    displayPNG(fullUpc);
  } else if (exportFormat === 'pdf') {
    displayPDF(fullUpc);
  }

  document.getElementById('barcodeSection').style.display = 'block';

  // Clear previous UPC details if they exist
  let existingDetails = document.getElementById('upcDetails');
  if (existingDetails) {
    existingDetails.remove();
  }

  // Just below 'Your Barcode', we need to just output the UPC+checksum
  let upcDetails = document.createElement('div');
  upcDetails.id = 'upcDetails';
  upcDetails.textContent = `Full Barcode: ${fullUpc}`;
  upcDetails.style.fontSize = '14px';

  // Insert upcDetails right after the 'Your Barcode' element
  let barcodeSection = document.getElementById('barcodeSection');
  barcodeSection.insertBefore(upcDetails, barcodeSection.children[1]);
}

function generateBatchBarcodes() {
  const upcList = batchInput.value.split('\n').map(line => line.trim()).filter(line => line !== '');
  batchBarcodeOutput.innerHTML = '';

  const exportFormat = exportFormatSelect.value; // Get the selected format

  upcList.forEach(upc => {
    if (upc.length !== 11 || !/^\d+$/.test(upc)) {
      alert(`Invalid UPC: ${upc}. Please enter 11 digits.`);
      return;
    }

    // Call the appropriate display function based on the export format
    if (exportFormat === 'png') {
      displayBatchBarcodePNG(upc); // Generate PNGs
    } else if (exportFormat === 'pdf') {
      displayBatchBarcodePDF(upc); // Generate PDFs
    } else if (exportFormat === 'svg') {
      displayBatchBarcodeSVG(upc); // Generate SVGs
    }
  });

  // Call the corresponding zip method after generating all barcodes
  if (exportFormat === 'png') {
    zipBatchPNGs(upcList); // Call the method to zip PNGs
  } else if (exportFormat === 'pdf') {
    zipBatchPDF(upcList); // Call the method to zip PDFs
  } else if (exportFormat === 'svg') {
    zipBatchSVG(upcList); // Call the method to zip SVGs
  }

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
  let svgBlob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
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

function displayPDF(fullUpc) {
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
  outputPDF.innerHTML = '';

  // Create an image element
  let img = document.createElement('img');
  img.src = pngImage;
  img.alt = 'Barcode';

  // Add the image to the output container
  outputPDF.appendChild(img);

  // PDF Generation
  let pdf = new jspdf.jsPDF();

  // Add the image to the PDF with calculated width and desired height
  pdf.addImage(img, 'PNG', 10, 10, 50, 25);

  // Create PDF download link
  let pdfBlob = pdf.output('blob');
  let pdfUrl = URL.createObjectURL(pdfBlob);

  let pdfDownloadLink = document.createElement('a');
  pdfDownloadLink.href = pdfUrl;
  pdfDownloadLink.download = `UPC_${fullUpc}.pdf`;
  pdfDownloadLink.textContent = 'Download PDF';
  pdfDownloadLink.classList.add('bg-blue-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');
  outputPDF.appendChild(pdfDownloadLink);
}

function displayBatchBarcodeSVG(fullUpc) {
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
  upcText.textContent = `UPC-A: ${fullUpc}`;
  upcText.classList.add('text-sm', 'mt-2', 'mb-4'); // Add margin-bottom to upcText
  barcodeContainer.appendChild(upcText);

  let svgBlob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = `UPC_${fullUpc}.svg`;
  downloadLink.textContent = 'Download SVG';
  downloadLink.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded');
  barcodeContainer.appendChild(downloadLink);

  batchBarcodeOutput.appendChild(barcodeContainer);
}

function displayBatchBarcodePNG(fullUpc) {
  let barcodeContainer = document.createElement('div');
  barcodeContainer.classList.add('mb-4', 'p-4', 'border', 'border-gray-300', 'rounded-md');

  if (!canvas) {
    canvas = createCanvas(300, 150);
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

  let img = document.createElement('img');
  img.src = pngImage;
  img.alt = 'Barcode';
  barcodeContainer.appendChild(img);

  let upcText = document.createElement('p');
  upcText.textContent = `UPC-A: ${fullUpc}`;
  upcText.classList.add('text-sm', 'mt-2', 'mb-4');
  barcodeContainer.appendChild(upcText);

  let downloadLink = document.createElement('a');
  downloadLink.href = pngImage;
  downloadLink.download = `UPC_${fullUpc}.png`;
  downloadLink.textContent = 'Download PNG';
  downloadLink.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-1', 'px-2', 'rounded');
  barcodeContainer.appendChild(downloadLink);

  batchBarcodeOutput.appendChild(barcodeContainer);
}

function displayBatchBarcodePDF(fullUpc) {
  let pdf = new jspdf.jsPDF(); // Create a new PDF document

  // Generate the barcode image
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
    height: 100, // This height is used for the barcode
    margin: 10
  });

  let pngImage = canvas.elt.toDataURL('image/png');

  // Create an image element to display on the web page
  let img = document.createElement('img');
  img.src = pngImage;
  img.alt = 'Barcode';
  batchBarcodeOutput.appendChild(img); // Append the image to the output

  let upcText = document.createElement('p');
  upcText.textContent = `UPC-A: ${fullUpc}`;
  upcText.classList.add('text-sm', 'mt-2', 'mb-4');
  batchBarcodeOutput.appendChild(upcText);

  // Add the image to the PDF
  pdf.addImage(img, 'PNG', 10, 10, 50, 25);

  // Create PDF download link after all images are added
  let pdfBlob = pdf.output('blob');
  let pdfUrl = URL.createObjectURL(pdfBlob);

  let pdfDownloadLink = document.createElement('a');
  pdfDownloadLink.href = pdfUrl;
  pdfDownloadLink.download = `UPC_${fullUpc}.pdf`;
  pdfDownloadLink.textContent = 'Download PDF';
  pdfDownloadLink.classList.add('bg-blue-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');

  // Append the download link to the output container
  batchBarcodeOutput.appendChild(pdfDownloadLink);
}

function zipBatchPNGs(upcList) {
  const zip = new JSZip(); // Create a new JSZip instance
  const pngPromises = []; // Array to hold promises for PNG generation
  const pdfDownloadLink = document.getElementById('pdfDownloadLink');
  if (pdfDownloadLink) {
    pdfDownloadLink.remove();
  }

  upcList.forEach(upc => {
    let checksum = calculateChecksum(upc);
    let fullUpc = upc + checksum;

    // Generate the barcode image
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

    // Convert the PNG data URL to a Blob
    pngPromises.push(fetch(pngImage)
      .then(res => res.blob())
      .then(blob => {
        zip.file(`UPC_${fullUpc}.png`, blob); // Add the PNG blob to the zip
      }));
  });

  // Wait for all PNGs to be added to the zip
  Promise.all(pngPromises).then(() => {
    zip.generateAsync({ type: "blob" }).then(content => {
      // Create a download link for the zip file
      const zipUrl = URL.createObjectURL(content);
      const downloadLink = document.createElement('a');
      downloadLink.href = zipUrl;
      downloadLink.download = 'Batch_UPC_Barcodes.zip';
      downloadLink.textContent = 'Download ZIP';
      downloadLink.classList.add('bg-blue-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');

      // Append the download link to the output container
      batchBarcodeOutput.appendChild(downloadLink); // Ensure this is the same container as other formats
    });
  });
}

function zipBatchSVG(upcList) {
  const zip = new JSZip(); // Create a new JSZip instance
  const svgPromises = []; // Array to hold promises for SVG generation
  const pdfDownloadLink = document.getElementById('pdfDownloadLink');
  if (pdfDownloadLink) {
    pdfDownloadLink.remove();
  }

  upcList.forEach(upc => {
    let checksum = calculateChecksum(upc);
    let fullUpc = upc + checksum;

    // Generate the barcode SVG
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

    // Convert the SVG to a Blob
    svgPromises.push(new Promise((resolve) => {
      const svgBlob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
      zip.file(`UPC_${fullUpc}.svg`, svgBlob); // Add the SVG blob to the zip
      resolve();
    }));
  });

  // Wait for all SVGs to be added to the zip
  Promise.all(svgPromises).then(() => {
    zip.generateAsync({ type: "blob" }).then(content => {
      // Create a download link for the zip file
      const zipUrl = URL.createObjectURL(content);
      const downloadLink = document.createElement('a');
      downloadLink.href = zipUrl;
      downloadLink.download = 'Batch_UPC_Barcodes.zip';
      downloadLink.textContent = 'Download ZIP';
      downloadLink.classList.add('bg-blue-500', 'hover:bg-green-700', 'text-whte', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');

      // Append the download link to the output container
      batchBarcodeOutput.appendChild(downloadLink);
    });
  });
}

function zipBatchPDF(upcList) {
  const zip = new JSZip(); // Create a new JSZip instance
  const pdfPromises = []; // Array to hold promises for PDF generation
  const pdfDownloadLink = document.getElementById('pdfDownloadLink');
  if (pdfDownloadLink) {
    pdfDownloadLink.remove();
  }

  upcList.forEach(upc => {
    let checksum = calculateChecksum(upc);
    let fullUpc = upc + checksum;

    // Generate the barcode image
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

    // Create a new PDF document
    let pdf = new jspdf.jsPDF();
    pdf.addImage(pngImage, 'PNG', 10, 10, 100, 50); // Add the image to the PDF

    // Convert the PDF to a Blob and add it to the zip
    pdfPromises.push(new Promise((resolve) => {
      const pdfBlob = pdf.output('blob'); // Get the PDF as a Blob
      zip.file(`UPC_${fullUpc}.pdf`, pdfBlob); // Add the PDF blob to the zip
      resolve(); // Resolve the promise
    }));
  });

  // Wait for all PDFs to be added to the zip
  Promise.all(pdfPromises).then(() => {
    zip.generateAsync({ type: "blob" }).then(content => {
      // Create a download link for the zip file
      const zipUrl = URL.createObjectURL(content);
      const downloadLink = document.createElement('a');
      downloadLink.href = zipUrl;
      downloadLink.download = 'Batch_UPC_Barcodes.zip';
      downloadLink.textContent = 'Download ZIP';
      downloadLink.classList.add('bg-blue-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'mt-4', 'inline-block');
      downloadLink.id = 'pdfDownloadLink';
      // Append the download link to the output container
      batchBarcodeOutput.parentElement.appendChild(downloadLink); // Ensure this is the same container as other formats
    });
  });
}

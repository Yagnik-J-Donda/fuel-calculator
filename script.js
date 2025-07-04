// === Fuel Cost Calculation ===
function calculateCost() {
    // Get user inputs
    let distance = parseFloat(document.getElementById('tripDistance').value);
    let mileage = parseFloat(document.getElementById('tripAverage').value);
    let price = parseFloat(document.getElementById('price').value);

    // Validate inputs
    if (isNaN(distance) || isNaN(mileage) || isNaN(price)) {
        document.getElementById('result').innerHTML = "⚠️ Please fill all fields correctly.";
        return;
    }

    // Calculate fuel used and total cost
    let fuelUsed = (distance * mileage) / 100;
    let totalCost = fuelUsed * price;

    // Display result
    document.getElementById('result').innerHTML = `
        <strong>Fuel Used:</strong> ${fuelUsed.toFixed(2)} liters<br>
        <strong>Total Cost:</strong> $${totalCost.toFixed(2)}
    `;
}

// === Dark Mode Toggle ===
const toggle = document.getElementById('darkModeToggle');
const themeLabel = document.getElementById('themeLabel');

toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    themeLabel.textContent = document.body.classList.contains('dark-mode') ? "Dark Mode" : "Light Mode";
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
        themeLabel.textContent = "Dark Mode";
    }
});

// === OCR: Extract Text from Uploaded Image ===
const uploadInput = document.getElementById('upload');
const progressOverlay = document.getElementById('progressOverlay');
const progressText = document.getElementById('progressText');

uploadInput.addEventListener('change', () => {
    if (uploadInput.files && uploadInput.files[0]) {
        const imageFile = uploadInput.files[0];

        // Show overlay
        progressOverlay.classList.add('show');
        progressText.textContent = "🔄 Extracting data… 0%";


        async function cropDashboardArea(imageFile) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set canvas size to cropped area
                    // Adjust these values as per your dashboard screen position
                    canvas.width = img.width * 0.5;  // width of the cropped box (50%)
                    canvas.height = img.height * 0.3; // height of the cropped box (30%)

                    // Start crop at X=25%, Y=35% of original image
                    const cropX = img.width * 0.25;
                    const cropY = img.height * 0.35;

                    ctx.drawImage(
                        img,
                        cropX, cropY, // start point
                        canvas.width, canvas.height, // crop width/height
                        0, 0, canvas.width, canvas.height // destination
                    );

                    canvas.toBlob(resolve, 'image/jpeg');
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(imageFile);
            });
        }

        Tesseract.recognize(
            imageFile,
            'eng',
            {
                logger: m => {
                    if (m.status === "recognizing text") {
                        const percent = Math.round(m.progress * 100);
                        progressText.textContent = `🔄 Extracting data… ${percent}%`;
                    }
                }
            }
        ).then(({ data: { text } }) => {
            console.log("Extracted Text:", text);

            // Display raw extracted text in debug box
            document.getElementById('rawText').textContent = text.trim() || "No data extracted.";

            let cleanText = text.toLowerCase().replace(/\s+/g, ' ');
            console.log("Cleaned Text:", cleanText);

            let filled = false;

            const distanceMatch = cleanText.match(/tripdistance\s*[:=]?\s*([\d.]+)/);
            if (distanceMatch) {
                document.getElementById('tripDistance').value = parseFloat(distanceMatch[1]);
                filled = true;
            }

            const mileageMatch = cleanText.match(/tripaverage\s*[:=]?\s*([\d.]+)/);
            if (mileageMatch) {
                document.getElementById('tripAverage').value = parseFloat(mileageMatch[1]);
                filled = true;
            }

            const timeMatch = cleanText.match(/triptime\s*[:=]?\s*([\d:]+)/);
            if (timeMatch) {
                document.getElementById('tripTime').value = timeMatch[1];
            }

            if (filled) {
                progressText.textContent = "✅ Data extracted successfully!";
                calculateCost();
            } else {
                progressText.textContent = "⚠️ Data extracted but no matching fields found.";
            }

        }).catch(err => {
            console.error(err);
            progressText.textContent = "❌ Failed to extract data from photo.";
        }).finally(() => {
            setTimeout(() => {
                progressOverlay.classList.remove('show'); // Hide overlay smoothly
                uploadInput.value = ''; // Clear file input
            }, 2000); // Wait 2s before fading out
        });
    }
});

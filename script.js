// === Fuel Cost Calculation Function ===
function calculateCost() {
    // Get user inputs and convert them to numbers
    let distance = parseFloat(document.getElementById('distance').value);
    let mileage = parseFloat(document.getElementById('mileage').value);
    let price = parseFloat(document.getElementById('price').value);

    // Validate inputs (check if all fields are filled correctly)
    if (isNaN(distance) || isNaN(mileage) || isNaN(price)) {
        document.getElementById('result').innerHTML = "⚠️ Please fill all fields correctly.";
        return;
    }

    // Calculate fuel used and total cost
    let fuelUsed = (distance * mileage) / 100;
    let totalCost = fuelUsed * price;

    // Display the result
    document.getElementById('result').innerHTML = `
        <strong>Fuel Used:</strong> ${fuelUsed.toFixed(2)} liters<br>
        <strong>Total Cost:</strong> $${totalCost.toFixed(2)}
    `;
}

// === Dark Mode Toggle ===
const toggle = document.getElementById('darkModeToggle'); // Get the toggle switch
const themeLabel = document.getElementById('themeLabel'); // Get label to show current mode

// When toggle is changed
toggle.addEventListener('change', () => {
    // Toggle dark-mode class on body
    document.body.classList.toggle('dark-mode');

    // Update label text
    themeLabel.textContent = document.body.classList.contains('dark-mode') ? "Dark Mode" : "Light Mode";

    // Save user preference in localStorage
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// === Load Saved Theme on Page Load ===
window.addEventListener('load', () => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme if it exists
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true; // Set toggle to ON
        themeLabel.textContent = "Dark Mode";
    }
});

// === OCR: Extract Text from Uploaded Image ===
const uploadInput = document.getElementById('upload');

uploadInput.addEventListener('change', () => {
    if (uploadInput.files && uploadInput.files[0]) {
        const imageFile = uploadInput.files[0];

        // Use Tesseract.js to recognize text from image
        Tesseract.recognize(
            imageFile,           // Image file
            'eng',               // Language: English
            { logger: m => console.log(m) } // Progress logger
        ).then(({ data: { text } }) => {
            console.log("Extracted Text:", text);

            // Try to parse Distance, Mileage, and Time from text
            const distanceMatch = text.match(/distance[:\s]*([\d.]+)/i);
            const mileageMatch = text.match(/mileage[:\s]*([\d.]+)/i);
            const timeMatch = text.match(/time[:\s]*([\d:]+)/i);

            if (distanceMatch) {
                document.getElementById('distance').value = parseFloat(distanceMatch[1]);
            }
            if (mileageMatch) {
                document.getElementById('mileage').value = parseFloat(mileageMatch[1]);
            }
            if (timeMatch) {
                alert(`Trip Time Detected: ${timeMatch[1]}`);
            }

            // Notify user
            document.getElementById('result').innerHTML = "✅ Details extracted. Review and click Calculate!";
        }).catch(err => {
            console.error(err);
            alert("❌ Failed to extract text from image.");
        });
    }
});

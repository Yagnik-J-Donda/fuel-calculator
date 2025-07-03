function calculateCost() {
    let distance = parseFloat(document.getElementById('distance').value);
    let mileage = parseFloat(document.getElementById('mileage').value);
    let price = parseFloat(document.getElementById('price').value);

    if (isNaN(distance) || isNaN(mileage) || isNaN(price)) {
        document.getElementById('result').innerHTML = "⚠️ Please fill all fields correctly.";
        return;
    }

    let fuelUsed = (distance * mileage) / 100;
    let totalCost = fuelUsed * price;

    document.getElementById('result').innerHTML = `
        <strong>Fuel Used:</strong> ${fuelUsed.toFixed(2)} liters<br>
        <strong>Total Cost:</strong> $${totalCost.toFixed(2)}
    `;
}

const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const taskText = document.getElementById("taskText");
const exportBtn = document.getElementById("exportBtn");

let currentInput = "";
let expectedInput = "";
let lastClickTime = null;
let lastButtonCenter = null;
let logData = [];

const W = 60; // Buttonbreite in px

function generateRandomNumber() {
    return (Math.floor(Math.random() * 10) + Math.random()).toFixed(2);
}

function getButtonCenter(btn) {
    const rect = btn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function calculateDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function startTask() {
    const num1 = generateRandomNumber();
    const num2 = generateRandomNumber();
    expectedInput = num1 + "*" + num2 + "=";
    taskText.textContent = "Bitte eingeben: " + num1 + " * " + num2;
    currentInput = "";
    display.value = "";
    lastClickTime = null;
    lastButtonCenter = null;
    logData = [];
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const val = button.textContent;
        const expectedChar = expectedInput[currentInput.length];
        if (val === expectedChar) {
            const now = Date.now();
            const center = getButtonCenter(button);

            if (lastClickTime && lastButtonCenter) {
                const MT = now - lastClickTime;
                const D = calculateDistance(lastButtonCenter, center);
                const ID = Math.log2((2 * D) / W);

                logData.push({
                    char: val,
                    MT: MT,
                    ID: ID.toFixed(4),
                    D: D.toFixed(2)
                });
            }

            lastClickTime = now;
            lastButtonCenter = center;

            currentInput += val;
            display.value += val;

            if (currentInput === expectedInput) {
                const duration = Date.now() - logData[0]?.MT - lastClickTime + now;
                alert("Ergebnis: " + eval(expectedInput.slice(0, -1)) +
                    "\nEingabezeit: " + Math.round(duration) + " ms");
                console.table(logData);
                startTask();
            }
        }
    });
});

exportBtn?.addEventListener("click", () => {
    const csvRows = [
        "char,MT(ms),ID,D(px)",
        ...logData.map(row => `${row.char},${row.MT},${row.ID},${row.D}`)
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fitts_experiment_data.csv";
    link.click();
});

startTask();

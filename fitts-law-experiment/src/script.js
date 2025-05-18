const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const taskText = document.getElementById("taskText");
const exportBtn = document.getElementById("exportBtn");
const taskCounter = document.getElementById("taskCounter");

let currentInput = "";
let expectedInput = "";
let lastClickTime = null;
let lastButtonCenter = null;
let taskStartTime = null;

let taskCount = 1;
const maxTasks = 20;

let allLogData = [];

function generateRandomNumber() {
    return (Math.floor(Math.random() * 10) + Math.random()).toFixed(2);
}

function getButtonCenter(btn) {
    const rect = btn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width };
}

function calculateDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function startTask() {
    if (taskCount > maxTasks) {
        alert("Experiment abgeschlossen. Bitte exportiere die CSV-Datei.");
        return;
    }

    const num1 = generateRandomNumber();
    const num2 = generateRandomNumber();
    expectedInput = num1 + "*" + num2 + "=";
    taskText.textContent = `Bitte eingeben: ${num1} * ${num2}`;
    taskCounter.textContent = `Aufgabe: ${taskCount} / ${maxTasks}`;

    currentInput = "";
    display.value = "";
    lastClickTime = null;
    lastButtonCenter = null;
    taskStartTime = Date.now();
    currentLog = [];
}

let currentLog = [];

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
                const ID = Math.log2((2 * D) / center.w);
                currentLog.push({
                    char: val,
                    MT: MT,
                    ID: ID.toFixed(4),
                    D: D.toFixed(2)
                });
            } else {
                currentLog.push({ char: val, MT: "-", ID: "-", D: "-" });
            }

            lastClickTime = now;
            lastButtonCenter = center;
            currentInput += val;
            display.value += val;

            if (currentInput === expectedInput) {
                taskCount++;
                allLogData.push(...currentLog);
                setTimeout(() => {
                    startTask();
                }, 500);
            }
        }
    });
});

exportBtn?.addEventListener("click", exportCSV);

function exportCSV() {
    const csvRows = [
        "char,MT(ms),ID,D(px)",
        ...allLogData.map(r => `${r.char},${r.MT},${r.ID},${r.D}`)
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");


    let filename = "fitts_experiment_data.csv";
    if (window.location.pathname.includes("layout1")) {
        filename = "fitts_layout1.csv";
    } else if (window.location.pathname.includes("layout2")) {
        filename = "fitts_layout2.csv";
    }

    link.href = url;
    link.download = filename;
    link.click();
}

startTask();
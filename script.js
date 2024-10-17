let startTime, updatedTime, difference;
let timerInterval;
let isRunning = false;

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const saveButton = document.getElementById('saveButton');
const exportButton = document.getElementById('exportButton');
const languageSelector = document.getElementById('languageSelector');
const stopwatchDisplay = document.getElementById('stopwatch');
const transcriptionDisplay = document.getElementById('transcription');
const statusMessage = document.getElementById('statusMessage');

let savedTranscriptions = [];

// Stopwatch functions
function startStopwatch() {
    if (!isRunning) {
        startTime = new Date().getTime();
        timerInterval = setInterval(updateStopwatch, 1000);
        isRunning = true;
        statusMessage.innerText = "Stopwatch is running...";
    }
    startButton.disabled = true;
    stopButton.disabled = false;
    resetButton.disabled = false;
}

function stopStopwatch() {
    clearInterval(timerInterval);
    isRunning = false;
    statusMessage.innerText = "Stopwatch stopped.";
    startButton.disabled = false;
    stopButton.disabled = true;
}

function resetStopwatch() {
    clearInterval(timerInterval);
    isRunning = false;
    stopwatchDisplay.innerText = "00:00:00";
    statusMessage.innerText = "Stopwatch reset.";
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = true;
}

function updateStopwatch() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    stopwatchDisplay.innerHTML =
        (hours < 10 ? '0' + hours : hours) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds);
}

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onstart = () => {
    statusMessage.innerText = "Speech recognition started. Speak now!";
};

recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
    transcriptionDisplay.innerText = transcript;
    saveButton.disabled = transcript.trim() === '';
    exportButton.disabled = savedTranscriptions.length === 0;
};

recognition.onspeechend = () => {
    statusMessage.innerText = "Speech recognition ended.";
};

recognition.onerror = (event) => {
    statusMessage.innerText = `Speech recognition error: ${event.error}`;
    console.error('Speech recognition error:', event.error);
};

// Update language based on selection
languageSelector.addEventListener('change', () => {
    recognition.lang = languageSelector.value;
});

// Save transcription
saveButton.addEventListener('click', () => {
    const currentText = transcriptionDisplay.innerText;
    if (currentText.trim()) {
        savedTranscriptions.push(currentText);
        statusMessage.innerText = "Transcription saved.";
        exportButton.disabled = false;
    }
});

// Export transcriptions as a .txt file
exportButton.addEventListener('click', () => {
    if (savedTranscriptions.length === 0) {
        statusMessage.innerText = "No transcriptions to export.";
        return;
    }

    const blob = new Blob([savedTranscriptions.join('\n\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transcriptions.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    statusMessage.innerText = "Transcriptions exported.";
});

// Button event listeners
startButton.addEventListener('click', () => {
    startStopwatch();
    recognition.start();
});

stopButton.addEventListener('click', () => {
    stopStopwatch();
    recognition.stop();
});

resetButton.addEventListener('click', () => {
    resetStopwatch();
    transcriptionDisplay.innerText = "Speak now, and your words will appear here...";
    savedTranscriptions = [];
    saveButton.disabled = true;
    exportButton.disabled = true;
    statusMessage.innerText = "";
});

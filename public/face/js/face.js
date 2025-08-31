const video = document.getElementById("video");
let faceMatcher = null;
let modelsLoaded = false;

async function loadModels() {
    try {
        console.log('Loading face detection models...');

        // Load ALL required models first
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/face/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/face/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/face/models"),
            faceapi.nets.ssdMobilenetv1.loadFromUri("/face/models") // Add this if needed
        ]);

        console.log('All models loaded successfully');
        modelsLoaded = true;

        // Now load labeled images for recognition
        await loadLabeledImages();

    } catch (error) {
        console.error('Error loading models:', error);
    }
}

async function loadLabeledImages() {
    try {
        //const labels = ['chan_tai_man', 'john_doe', 'jane_smith'];
        const labels = ['chan_tai_man'];

        const labeledFaceDescriptors = await Promise.all(
            labels.map(async label => {
                const descriptions = [];

                // Try multiple image numbers and extensions
                for (let i = 1; i <= 6; i++) {
                    try {
                        const img = await faceapi.fetchImage(`/face/images/${label}/${label}${i}.jpg`);
                        const detections = await faceapi.detectSingleFace(img)
                            .withFaceLandmarks()
                            .withFaceDescriptor();

                        if (detections) {
                            descriptions.push(detections.descriptor);
                            console.log(`✓ Loaded image for ${label}`);
                        }
                    } catch (error) {
                        console.warn(`Could not load image ${i} for ${label}:`, error);
                    }
                }

                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );

        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        console.log('Face recognition ready');

    } catch (error) {
        console.error('Error loading labeled images:', error);
    }
}

async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        // Start loading models as soon as video access is granted
        loadModels();

    } catch (err) {
        console.error("Error accessing webcam:", err);
    }
}

video.addEventListener("play", () => {
    if (!modelsLoaded) {
        console.log('Models not loaded yet, waiting...');
        return;
    }

    startFaceDetection();
});

function startFaceDetection() {
    const canvas = document.getElementById("overlay");
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        if (!modelsLoaded) return; // Don't run if models aren't ready

        try {
            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            )
                .withFaceLandmarks()
                .withFaceDescriptors();

            const resized = faceapi.resizeResults(detections, displaySize);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (faceMatcher) {
                resized.forEach(result => {
                    const bestMatch = faceMatcher.findBestMatch(result.descriptor);

                    const box = result.detection.box;
                    const drawBox = new faceapi.draw.DrawBox(box, {
                        label: bestMatch.toString(),
                        boxColor: bestMatch.distance < 0.6 ? 'green' : 'red'
                    });
                    drawBox.draw(canvas);

                    //console.log(`Recognized: ${bestMatch.label} with distance: ${bestMatch.distance}`);

                    // Only trigger login once per recognition session to avoid spamming
                    if (!window.recognitionTriggered) {
                        window.recognitionTriggered = true;
                        handleRecognizedUser(bestMatch.label, bestMatch.distance);

                        // Reset after 5 seconds to allow re-recognition
                        setTimeout(() => {
                            window.recognitionTriggered = false;
                            //console.log(`Recognized: ${bestMatch.label}`);

                        }, 5000);
                    }
                });
            } else {
                faceapi.draw.drawDetections(canvas, resized);
            }
        } catch (error) {
            console.error('Detection error:', error);
        }
    }, 100);
}

// Add a manual check button for testing
function addTestButton() {
    const button = document.createElement('button');
    button.textContent = 'Check Model Status';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = '1000';
    button.onclick = () => {
        console.log('Models loaded:', modelsLoaded);
        console.log('FaceMatcher ready:', faceMatcher !== null);
        if (faceMatcher) {
            console.log('Available labels:', faceMatcher.labeledDescriptors.map(d => d.label));
        }
    };
    document.body.appendChild(button);
}

async function handleRecognizedUser(username, confidence) {

    try {
        //console.log(`Recognized user: ${username} with confidence: ${confidence}`);

        const response = await fetch('/face/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: `${username}`,
                confidence: `${confidence}`
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Face recognition login passed: ' + result.message);
            window.location.href = '/dashboard';
        } else {
            alert('Face recognition login failed: ' + result.message);
            window.location.href = '/auth/login';
        }
    } catch (error) {
        console.error('Error sending recognition data:', error);
    }
}

// Start everything
startVideo();
//addTestButton();

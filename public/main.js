// Get Geolation onLoad()
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
    $(document).ready(function() {
        $("#location").val(position.coords.longitude + ", " + position.coords.latitude);
    });
    console.log(position.coords.longitude + ", " + position.coords.latitude);
}

// Get sound from HTML Audio element
var audio = document.getElementById("censor");

// Bacode Scanner
var _scannerIsRunning = false;

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                width: 480,
                height: 320,
                facingMode: "environment"
            },
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader"
            ],
            debug: {
                showCanvas: true,
                showPatches: true,
                showFoundPatches: true,
                showSkeleton: true,
                showLabels: true,
                showPatchLabels: true,
                showRemainingPatchLabels: true,
                boxFromPatches: {
                    showTransformed: true,
                    showTransformedBox: true,
                    showBB: true
                }
            }
        },

    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function(box) {
                    return box !== result.box;
                }).forEach(function(box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1
                    }, drawingCtx, {
                        color: "green",
                        lineWidth: 2
                    });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {
                    x: 0,
                    y: 1
                }, drawingCtx, {
                    color: "#00F",
                    lineWidth: 2
                });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y'
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }
        }
    });

    // On barcode detection: play sound, alert success message, send data to spreadsheet, stop scanner
    Quagga.onDetected(function(result) {
        audio.play();
        document.getElementById('alert').innerHTML = "<div class=\"alert\"><div class=\"closebtn\" onclick=\"this.parentElement.style.display='none';\">&times;</div> Attendance Signed!</div>";
        console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
        $(document).ready(function() {
            var studentID = $('#userLocalStudentID').text();
            $('#studentID').val(studentID);
            $('#barcode').val(result.codeResult.code);
            $('#send').trigger('click');
            $('#btn').trigger('click');
        });
    });
}


// Start/stop scanner
document.getElementById("btn").addEventListener("click", function() {
    if (_scannerIsRunning) {
        Quagga.stop();
    } else {
        startScanner();
    }
}, false);
const video = document.querySelector("video");
const recordBtnContainer = document.querySelector(".record-btn-container");
const recordBtn = document.querySelector(".record-btn");
const captureBtnContainer = document.querySelector(".capture-btn-container");
const captureBtn = document.querySelector(".capture-btn");
let transparentColor = "transparent";
let recordFlag = false;
let recorder;
let chunks = []; //media data in chunks
const constraints = {
  audio: true,
  video: true,
};

//stream
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  video.srcObject = stream;
  recorder = new MediaRecorder(stream);

  recorder.addEventListener("start", (e) => {
    chunks = []; //making sure array video is empty to start with
  });

  recorder.addEventListener("dataavailable", (e) => {
    chunks.push(e.data);
  });

  recorder.addEventListener("stop", (e) => {
    //conversion of media chunks into a video format
    let blob = new Blob(chunks, { type: "video/mp4" });
    //let videoURL = URL.createObjectURL(blob);
    if (db) {
      let videoId = shortid();
      let dbTransaction = db.transaction("video", "readwrite");
      let videoStore = dbTransaction.objectStore("video");
      let videoEntry = {
        id: `vid-${videoId}`,
        blobData: blob,
      };
      videoStore.add(videoEntry);
    }

    //download

    // let a = document.createElement("a");
    // a.href = videoURL;
    // a.download = "Recording.mp4";
    // a.click();
  });
});

recordBtnContainer.addEventListener("click", (e) => {
  if (!recorder) return; //if promise is not resolved, simply return
  recordFlag = !recordFlag;
  if (recordFlag) {
    //start recording
    recorder.start();
    recordBtn.classList.add("scale-record");
    startTimer();
  } else {
    //stop recording
    recorder.stop();
    recordBtn.classList.remove("scale-record");
    stopTimer();
  }
});

captureBtn.addEventListener("click", (e) => {
  captureBtn.classList.add("scale-capture");

  let canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  let tool = canvas.getContext("2d");

  tool.drawImage(video, 0, 0, canvas.width, canvas.height);

  

  //Filter colors
  tool.fillStyle = transparentColor;
  tool.fillRect(0, 0, canvas.width, canvas.height);

  let imageUrl = canvas.toDataURL();
  // //download
  // let a = document.createElement("a");
  // a.href = imageUrl;
  // a.download = "Image.jpg";
  // a.click();
  if (db) {
    let imageId = shortid();
    let dbTransaction = db.transaction("image", "readwrite");
    let imageStore = dbTransaction.objectStore("image");
    let imageEntry = {
      id: `img-${imageId}`,
      url: imageUrl,
    };
    imageStore.add(imageEntry);
  }
  setTimeout(() => {
    captureBtn.classList.remove("scale-capture");
  }, 500);
});

//For timer
let timerID;
let counter = 0; // Represents total seconds
let timer = document.querySelector(".timer-container");
function startTimer() {
  timer.style.display = "flex";
  function displayTimer() {
    let totalSeconds = counter;

    let hours = Number.parseInt(totalSeconds / 3600);
    totalSeconds = totalSeconds % 3600; // remaining value

    let minutes = Number.parseInt(totalSeconds / 60);
    totalSeconds = totalSeconds % 60; // remaining value

    let seconds = totalSeconds;

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    timer.innerText = `${hours}:${minutes}:${seconds}`;

    counter++;
  }

  timerID = setInterval(displayTimer, 1000);
}
function stopTimer() {
  clearInterval(timerID);
  timer.innerText = "00:00:00";
  timer.style.display = "none";
}

// Filters logic
let allFilters = document.querySelectorAll(".filter");
let filterLayer = document.querySelector(".filter-layer");

allFilters.forEach((filterItem) => {
  filterItem.addEventListener("click", (e) => {
    transparentColor =
      getComputedStyle(filterItem).getPropertyValue("background-color");
    filterLayer.style.backgroundColor = transparentColor;
  });
});

navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        let video = document.querySelector("video");
        video.srcObject = stream;
    })
    .catch((err) => {
        alert("Kamera tidak dapat diakses. Pastikan menggunakan HTTPS dan memberi izin kamera.");
        console.error(err);
    });
  captureBtn.addEventListener("click", (e) => {
    captureBtn.classList.add("scale-capture");

    // Membuat canvas sesuai ukuran video
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let tool = canvas.getContext("2d");

    // 1. Gambar video kamera ke canvas
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Gambar Filter Warna
    if (transparentColor && transparentColor !== "transparent") {
        tool.fillStyle = transparentColor;
        tool.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 3. Tambahkan Banner Atas (Template)
    let bannerHeight = canvas.height * 0.12;
    tool.fillStyle = "#00796b"; 
    tool.fillRect(0, 0, canvas.width, bannerHeight);

    // 4. Tambahkan Timestamp (Wajib di sini agar pasti muncul)
    let now = new Date();
    let dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
    let timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let fullTimestamp = `${dateStr}  ${timeStr}`;

    // Gaya teks timestamp (Retro Orange)
    tool.shadowColor = "black";
    tool.shadowBlur = 5;
    tool.fillStyle = "#ff8c00"; 
    tool.font = `bold ${Math.floor(canvas.height * 0.04)}px Courier New`;
    tool.textAlign = "right";
    tool.fillText(fullTimestamp, canvas.width - 20, canvas.height - 30);
    tool.shadowBlur = 0; // Reset shadow

    // 5. Gambar Tulisan Masjid
    tool.fillStyle = "white";
    tool.font = `bold ${Math.floor(bannerHeight * 0.35)}px Arial`;
    tool.textAlign = "left";
    tool.textBaseline = "middle";
    // Geser teks agak ke kanan untuk ruang logo
    tool.fillText("Masjid Jami Al Makmur Tanah Abang", (bannerHeight * 1.2), bannerHeight / 2);

    // 6. Gambar Logo (Secara Async agar tidak menghambat penyimpanan)
    let logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "./images/logo2.png";

    logo.onload = function() {
        let logoSize = bannerHeight * 0.8;
        let margin = (bannerHeight - logoSize) / 2;
        tool.drawImage(logo, margin * 2, margin, logoSize, logoSize);
        
        // Simpan ke DB setelah logo berhasil digambar
        saveToDB(canvas.toDataURL("image/jpeg", 1.0));
    };

    logo.onerror = function() {
        // Jika logo gagal dimuat (masalah koneksi), tetap simpan foto + timestamp
        console.warn("Logo gagal dimuat, menyimpan foto tanpa logo.");
        saveToDB(canvas.toDataURL("image/jpeg", 1.0));
    };

    function saveToDB(imageUrl) {
        if (db) {
            let imageId = shortid();
            let dbTransaction = db.transaction("image", "readwrite");
            let imageStore = dbTransaction.objectStore("image");
            let imageEntry = { id: `img-${imageId}`, url: imageUrl };
            imageStore.add(imageEntry);
        }
    }

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture");
    }, 500);
});

let myViseoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const videoGrid = document.getElementById('video-grid');


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myViseoStream = stream;
    addVideoStream(myVideo, stream);
})


 const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) {
        console.error('video-grid element not found');
        return;
    }
    videoGrid.append(video);
 }


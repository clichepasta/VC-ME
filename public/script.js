let myViseoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;

const socket = (typeof io === 'function') ? io('/') : null;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myViseoStream = stream;
    addVideoStream(myVideo, stream);
})

if (socket) {
    if (typeof ROOM_ID !== 'undefined') {
        console.log(ROOM_ID);
        
        socket.emit('join-room', ROOM_ID);
        socket.on('user-connected', () => {
            console.log("User Connected");
        });
    } else {
        console.warn('ROOM_ID is not defined in the page');
    }
} else {
    console.warn('Socket.IO client not loaded; socket is null');
}


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


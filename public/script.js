let myViseoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
var peer = new Peer(
    undefined,
    { path: '/peerjs', host: '/', port: '3030' }
);
const socket = (typeof io === 'function') ? io('/') : null;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myViseoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');              
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    }); 
})

if (socket) {
    if (typeof ROOM_ID !== 'undefined') {
        console.log(ROOM_ID);
        peer.on('open', id => {
            console.log("My peer ID:", id);
            socket.emit('join-room', ROOM_ID, id);
        });
        socket.on('user-connected', (userId) => {
            connecToNewUser(userId, myViseoStream);
        });

        connecToNewUser = (userId, stream) => {
            console.log("Connecting to new user", userId);
            const call = peer.call(userId, stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            });
        }
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

// use a specific input element (no jQuery required)
const text = document.getElementById('chat-message');
console.log('chat input element:', text);

// handle Enter key globally
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && text && text.value.trim().length !== 0) {
        const messageText = text.value.trim();
        console.log('chat message:', messageText);

        // append locally for immediate feedback
        const messagesEl = document.getElementById('messages');
        if (messagesEl) {
            const msg = document.createElement('div');
            const strong = document.createElement('strong');
            strong.textContent = 'You: ';
            msg.appendChild(strong);
            msg.appendChild(document.createTextNode(messageText));
            messagesEl.appendChild(msg);
            scrollToBottom();
        }

        if (typeof socket !== 'undefined' && socket) {
            socket.emit('message', messageText);
        }
        text.value = '';
    }
});

socket && socket.on('createMessage', message => {
    const messages = document.getElementById('messages');       
    if (!messages) return;
    const msg = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = 'Peer: ';
    msg.appendChild(strong);
    msg.appendChild(document.createTextNode(message));
    messages.appendChild(msg);
    scrollToBottom();
});

const scrollToBottom = () => {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}   
 
const muteUnmute = () => {
    const enabled = myViseoStream.getAudioTracks()[0].enabled;      
    if (enabled) {
        myViseoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }

    else {
        myViseoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }   
}
const setMuteButton = () => {
    const html = `
    <!-- mic icon -->
    <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zM19 11v-1h-1V11c0 3.309-2.691 6-6 6s-6-2.691-6-6v-1H5v1c0 3.866 3.134 7 7 7s7-3.134 7-7z" fill="currentColor"/></svg>     
    <span>Mute</span>
    `
    document.getElementById("btn-mute").innerHTML = html;
    document.getElementById("btn-mute").setAttribute("aria-pressed", "false");
}   

const setUnmuteButton = () => { 
    const html = `
    <!-- mic off icon -->   
    <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zM19 11v-1h-1V11c0 3.309-2.691 6-6 6s-6-2.691-6-6v-1H5v1c0 3.866 3.134 7 7 7s7-3.134 7-7zM5.41 4.86L4 6.27l3.22 3.22C7.08 9.16 7 9.57 7 10v1c0 2.761 2.239 5 5 5 .43 0 .84-.08 1.17-.22l3.26 3.26 1.41-1.41L5.41 4.86z" fill="currentColor"/></svg>
    <span>Unmute</span>
    `   
    document.getElementById("btn-mute").innerHTML = html;
    document.getElementById("btn-mute").setAttribute("aria-pressed", "true");
}   

const startStopVideo = () => {
    const enabled = myViseoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myViseoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }   
    else {
        myViseoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }   
}   
const setStopVideo = () => {

    const html = `  
    <!-- video on icon -->
    <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 10.5V7c0-1.657-1.343-3-3-3H5a3 3 0 00-3 3v10a3 3 0 003 3h9c1.657 0 3-1.343 3-3v-3.5l4 4v-11l-4 4z" fill="currentColor"/></svg>
    <span>Stop Video</span>
    `
    document.getElementById("btn-video").innerHTML = html;
    document.getElementById("btn-video").setAttribute("aria-pressed", "false");
}       
const setPlayVideo = () => {
    const html = `
    <!-- video off icon -->

    <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 10.5V7c0-1.657-1.343-3-3-3H5a3 3 0 00-3 3v10a3 3 0 003 3h9c1.657 0 3-1.343 3-3v-3.5l4 4v-11l-4 4zM1.41 1.59L0 3l2.22 2.22C2.08 5.16 2 5.57 2 6v10a3 3 0 003 3h9c.43 0 .84-.08 1.17-.22l2.61 2.61 1.41-1.41L1.41 1.59z" fill="currentColor"/></svg>
    <span>Play Video</span>
    `
    document.getElementById("btn-video").innerHTML = html;
    document.getElementById("btn-video").setAttribute("aria-pressed", "true");
}   
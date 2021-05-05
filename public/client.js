const peer = new Peer(undefined, { host: '/', port: '3001' });

const videoGrid = document.getElementById('video-grid');
const socket = io('/');

const myVideo = document.createElement('video');
myVideo.muted = true; // mute our video so tht we don't hear our own voice

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        addVideoToGrid(myVideo, stream);
        
        peer.on('call', call => {
            call.answer(stream);
            const videoElem = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoToGrid(videoElem, userVideoStream);
            });
        });

        socket.on('user-connected', (userId) => {
            connectToNewUser(userId, stream);
        });
    });

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

function addVideoToGrid(videoElem, stream) {
    videoElem.srcObject = stream;
        videoGrid.append(videoElem);
        videoElem.addEventListener('loadedmetadata', () => {
            console.log('Added New Stream');
            videoElem.play();
    });
}

function connectToNewUser(userId, stream) {
    
    const videoElem = document.createElement('video');
    /* Send our video stream to new user */
    const callUser = peer.call(userId, stream);
    /* Get stream from new user and add to grid in UI */
    callUser.on('stream', userVideoStream => {
        addVideoToGrid(videoElem, userVideoStream);
    });
    /* Remove video of user when he closes stream */
    callUser.on('close', () => {
        videoElem.remove();
    });

}
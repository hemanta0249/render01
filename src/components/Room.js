import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketState'
import { usePeer } from '../context/PeerState';
import ReactPlayer from 'react-player'
// import { Link } from 'react-router-dom';

const Room = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setAnswer } = usePeer();

    const [myStream, setMyStream] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null);

    let messageBox = document.getElementById('msgBox');
    let sendingMsg = document.createElement("div");

    const handleUser = useCallback((data) => {
        const { id } = data;
        // console.log("new user joined", email);
        setRemoteSocketId(id);
    }, [])

    const handleClick = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        setMyStream(stream);
        const offer = await createOffer();
        socket.emit("call-user", { to: remoteSocketId, offer });
    }, [createOffer, remoteSocketId, socket])

    const handleIncomingCall = useCallback(async (data) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        setMyStream(stream);
        const { from, offer } = data;
        console.log("incoming call from", from, offer);
        setRemoteSocketId(from);

        const ans = await createAnswer(offer);
        socket.emit("call-accepted", { to: from, ans });
    }, [createAnswer, socket])

    const sendStream = useCallback(() => {
        console.log("working");
        const tracks = myStream.getTracks();
        for (const track of tracks) {
            peer.addTrack(track, myStream);
        }
    }, [myStream, peer])

    const handleCallAccepted = useCallback(async (data) => {
        const { from, ans } = data;
        console.log("call accepted", from, ans);
        await setAnswer(ans);
        sendStream();
    }, [setAnswer, sendStream])

    const handleNegotiation = useCallback(async () => {
        console.log("negotiate plzz");
        const offer = await createOffer();
        socket.emit("nego-needed", { offer, to: remoteSocketId });
    }, [createOffer, remoteSocketId, socket])

    const handleNegoIncoming = useCallback(async (data) => {
        const { from, offer } = data;
        const ans = await createAnswer(offer);
        socket.emit("nego-done", { to: from, ans });
    }, [createAnswer, socket])

    const handleNegoFinal = useCallback(async (data) => {
        const { from, ans } = data;
        console.log("nego done", from, ans);
        await setAnswer(ans);
    }, [setAnswer])

    const handleMsg = useCallback((data) => {
        const { message } = data;
        console.log(message);
        sendingMsg.innerText = message;
        // console.log(sendingMsg.innerText);
        messageBox.appendChild(sendingMsg);
    }, [messageBox, sendingMsg])

    useEffect(() => {
        peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            console.log("got tracks");
            setRemoteStream(remoteStream[0]);
        })
    }, [peer])

    useEffect(() => {
        socket.on("user-joined", handleUser)
        socket.on("incoming-call", handleIncomingCall)
        socket.on("call-accepted", handleCallAccepted)
        socket.on("nego-needed", handleNegoIncoming);
        socket.on("nego-final", handleNegoFinal);
        socket.on("incomingMsg", handleMsg);
        return () => {
            socket.off("user-joined", handleUser)
            socket.off("incoming-call", handleIncomingCall)
            socket.off("call-accepted", handleCallAccepted)
            socket.off("nego-needed", handleNegoIncoming);
            socket.off("nego-final", handleNegoFinal);
            socket.off("incomingMsg", handleMsg);
        }
    }, [handleUser, socket, handleIncomingCall, handleCallAccepted, handleNegoIncoming, handleNegoFinal, handleMsg])

    useEffect(() => {
        peer.addEventListener("negotiationneeded", handleNegotiation);
        return () => {
            peer.removeEventListener("negotiationneeded", handleNegotiation);
        }
    }, [peer, handleNegotiation])




    const [message, setMessage] = useState("");

    const changes = (e) => {
        setMessage(e.target.name = e.target.value)
    }

    let msg2 = document.createElement("div");

    const handlethis = (e) => {
        e.preventDefault();
        let sending = document.forms['my-form'].message.value;
        msg2.innerText = sending;
        messageBox.appendChild(msg2);
        console.log(message)
        socket.emit("send", { message })
        // sendingMsg.innerText = "message";
        // messageBox.appendChild(sendingMsg);
    }



    return (
        <div>
            <div className='mainImp'>
            <nav id="navId" className='nav'>
            </nav>
                {/* <h2 className='h2'>Chating App</h2>
                <h4 className='h4'>{remoteSocketId ? "Connected" : "no one in the room"}</h4> */}

                <div className='roomStyle'>
                    <div className='vcroom'>
                        <ReactPlayer className="vplayer1" height="100%" url={remoteStream} playing muted />
                        <div className='callControl'>
                        <ReactPlayer className="vplayer2" height="190px" width="254px" url={myStream} playing muted />
                        <div className='callBtn'>
                            {remoteSocketId && <button type="button" className="btn btn-primary" onClick={handleClick}>Call</button>}
                            {/* <button type="button" className="btn btn-primary" onClick={sendStream}>Video</button> */}
                        </div>
                        </div>
                    </div>

                    <div id='cls' className='chatBox'>
                        <div id='msgBox' style={{ "height": "70%" }}>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias molestiae expedita nulla labore doloremque autem rem excepturi cumque dicta voluptatem quos minima fugiat id commodi hic, assumenda in laboriosam tenetur quasi quas eos eligendi?</p>
                            <div className='msg1'>i have a message</div>
                            <div className='msg2'>i have one more message</div>
                        </div>

                        <div>
                            <form onSubmit={handlethis} name='my-form'>
                                <div className="mb-3">
                                    <input type="text" value={message} placeholder='message' onChange={changes} className="form-control" id="message" name='message' />
                                    {/* <i class="fa-light fa-paper-plane"></i> */}
                                </div>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Room

import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketState'
import { usePeer } from '../context/PeerState';
import ReactPlayer from 'react-player'

const Room = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer, setAnswer} = usePeer();

    const [myStream, setMyStream] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null);

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
        socket.emit("call-user", {to: remoteSocketId, offer});
    }, [createOffer, remoteSocketId, socket])

    const handleIncomingCall = useCallback( async (data) => {
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

    const sendStream = useCallback (()=>{
        console.log("working");
        const tracks = myStream.getTracks();
        for(const track of tracks){
            peer.addTrack(track, myStream);
        }
    }, [myStream, peer])

    const handleCallAccepted = useCallback(async (data) => {
        const { from, ans } = data;
        console.log("call accepted", from, ans);
        await setAnswer(ans);
    }, [setAnswer])

    const handleNegotiation = useCallback(async () => {
        console.log("negotiate plzz");
        const offer = await createOffer();
        socket.emit("nego-needed", {offer, to: remoteSocketId});
    }, [createOffer, remoteSocketId, socket])

    const handleNegoIncoming = useCallback(async (data)=>{
        const {from, offer} = data;
        const ans = await createAnswer(offer);
        socket.emit("nego-done", {to: from, ans});
    }, [createAnswer, socket])

    const handleNegoFinal = useCallback(async (data)=>{
        const { from, ans } = data;
        console.log("nego done",from, ans);
        await setAnswer(ans);
    },[setAnswer])

    useEffect(()=>{
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
        return () => {
            socket.off("user-joined", handleUser)
            socket.off("incoming-call", handleIncomingCall)
            socket.off("call-accepted", handleCallAccepted)
            socket.off("nego-needed", handleNegoIncoming);
            socket.off("nego-final", handleNegoFinal);
        }
    }, [handleUser, socket, handleIncomingCall, handleCallAccepted, handleNegoIncoming, handleNegoFinal])

    useEffect(() => {
        peer.addEventListener("negotiationneeded", handleNegotiation);
        return () => {
            peer.removeEventListener("negotiationneeded", handleNegotiation);
        }
    }, [peer, handleNegotiation])

    return (
        <div>
            <h2>this is room page</h2>
            <h4>{remoteSocketId? "Connected": "no one in the room"}</h4>
            {remoteSocketId && <button type="button" className="btn btn-primary" onClick={handleClick}>Call</button>}

            <button type="button" className="btn btn-primary" onClick={sendStream}>Video</button>
            {myStream && <> <h3>my stream</h3> <ReactPlayer url={myStream} playing muted /> </>}
            {remoteStream && <> <h3>remote stream</h3> <ReactPlayer url={remoteStream} playing  /> </>}
        </div>
    )
}

export default Room

import React, { useContext, useMemo } from 'react'
import { createContext } from "react";

const PeerContext = createContext();

export const usePeer = () => useContext(PeerContext);

const PeerState = (props) => {
    // const [remoteStream, setRemoteStream] = useState(null);

    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478"
                ]
            }
        ]
    }), []);

    const createOffer = async ()=>{
        const offer = await peer.createOffer();
        await peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }

    const createAnswer = async (offer)=>{
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
    }

    const setAnswer = async (ans)=>{
        await peer.setRemoteDescription(new RTCSessionDescription(ans));
    }

    // const sendStream = async (stream)=>{
    //     console.log("working");
    //     const tracks = stream.getTracks();
    //     for(const track of tracks){
    //         peer.addTrack(track, stream);
    //     }
    // }

    // const handleTrackEvent = useCallback( (ev)=>{
    //     const streams = ev.streams;
    //     console.log("got tracks");
    //     setRemoteStream(streams[0]);
    // }, [])

    // useEffect(()=>{
    //     peer.addEventListener("track", handleTrackEvent);
    //     return ()=>{
    //         peer.removeEventListener("track", handleTrackEvent);
    //     }
    // }, [peer, handleTrackEvent])


    return (
        <div>
            <PeerContext.Provider value={{ peer, createOffer, createAnswer, setAnswer}}>
                {props.children}
            </PeerContext.Provider>
        </div>
    )
}

export default PeerState;

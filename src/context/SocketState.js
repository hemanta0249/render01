import SocketContext from "./SocketContext";
import {io} from "socket.io-client";
import React, { useContext } from 'react';

export const useSocket = ()=>{
    const socket = useContext(SocketContext);
    return socket;
}

const SocketState = (props) => {
    const socket = io("localhost:8080", {secure: "true"});
  return (
    <div>
      <SocketContext.Provider value={{socket}}>
        {props.children}
      </SocketContext.Provider>
    </div>
  )
}

export default SocketState;

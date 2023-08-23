"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// server 전달
// event - "key_polling"
interface KeyPolling {
  serverTime: number;
  serverCnt: number;
}

// client request
// event - "key_polling_answer"
// client req
interface KeyPollingAnswer {
  serverTime: number;
  serverCnt: number; // 서버 값 그대로
  issueTime: number; // client 가 탐지한 시간
  keyVector: number; //(위 1, 아래 -1, 중간 0)
}
// server res
interface KeyPollingAnswerRes {
  code: number;
  msg: string;
}

const socket = io("http://localhost:4000/game");

export default function Home() {
  const [client, setClient] = useState(false);
  const [serverTime, setServerTime] = useState(0);
  const [serverCnt, setServerCnt] = useState(0);
  const [keyVector, setKeyVector] = useState(0); // [0, 1, -1

  const keyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      setKeyVector(1);
    } else if (e.key === "ArrowDown") {
      setKeyVector(-1);
    }
  };

  useEffect(() => {
    setClient(true);
    socket.connect();
    socket.on("key_polling_answer", (data: KeyPollingAnswer) => {
      console.log(data);
    });
    socket.on("key_polling", (data: KeyPolling) => {
      console.log(data);
      setServerTime(data.serverTime);
      setServerCnt(data.serverCnt);
      socket.emit("key_polling_answer", {
        serverTime: serverTime,
        serverCnt: serverCnt,
        issueTime: Date.now(),
        keyVector: 1,
      });
    });

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", () => {
      setKeyVector(0);
    });
    return () => {
      socket.disconnect();
      socket.off("key_polling_answer");
      socket.off("key_polling");
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", () => {
        setKeyVector(0);
      });
    };
  }, []);

  if (!client) return <p>loading...</p>;
  return (
    <div>
      <p>serverTime: {serverTime}</p>
      <p>serverCnt: {serverCnt}</p>
      <p>keyVector: {keyVector}</p>
    </div>
  );
}

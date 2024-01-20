import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useTime, useTransform } from "framer-motion";
import { useSocket } from "../../context/SocketProvider";
import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Tooltip,
} from "@chakra-ui/react";
import ReactPlayer from "react-player";
import peer from "../../service/Peer";
import joinSound from "../../assets/audio/join.mp3";
import styled from "styled-components";

const Room = () => {
  const socket = useSocket();
  const time = useTime();
  const rotate = useTransform(time, [0, 2000], [0, 360], { clamp: false });

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const joinAudio = new Audio(joinSound);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const [chatBar, setChatBar] = useState(true);
  const [patnerName, setPatnerName] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  const handleChat = () => {
    setChatBar(!chatBar);
  };
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };
  useEffect(() => {
    // Scroll to the bottom whenever messages or receivedMessages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, receivedMessages]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const toSocketId = remoteSocketId; // Replace with the actual recipient's socket ID
      const timestamp = new Date().getTime();
      socket.emit("send:message", { to: toSocketId, message, timestamp });
      setMessages([...messages, { from: "You", message, timestamp }]); // Update local messages
    }
    setMessage(""); // Clear the input field
  };
  // Add the following useEffect to handle incoming messages
  useEffect(() => {
    if (myStream && !patnerName) {
      // Play join sound when myStream is available and partner name is not set
      joinAudio.play();
    }
  }, [myStream, patnerName]);

  useEffect(() => {
    socket.on("receive:message", ({ from, message, timestamp }) => {
      setReceivedMessages([...receivedMessages, { from, message, timestamp }]);
    });

    return () => {
      socket.off("receive:message");
    };
  }, [socket, receivedMessages]);

  const handleUserJoined = useCallback(
    ({ email, id }) => {
      console.log(`Email ${email} joined room`);
      setPatnerName(email);
      setRemoteSocketId(id);
      joinAudio.play();
    },
    [joinAudio]
  );

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        const sender = peer.peer.getSenders().find((s) => s.track === track);
        if (!sender) {
          peer.peer.addTrack(track, myStream);
        }
      });
    }
    setCallAccepted(true);
  }, [myStream, peer.peer]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <>
        <Box
          position={"absolute"}
          bottom={"2"}
          right={"2"}
          transform={"scaleX(-1)"}
          zIndex={"1"}
          padding={"1rem"}
          // display={{ base: "none", sm: chatBar ? "none" : "flex" }}
        >
          <Button
            background={""}
            color={"#ffffff"}
            fontSize={"40"}
            onClick={handleChat}
            _hover={{
              transform: "scale(1.2) rotate(10deg)",
            }}
            variant="unstyled"
          >
            <motion.div>
              <Tooltip
                hasArrow
                placement="left"
                label={chatBar ? "close chat" : "open chat"}
                // fontSize="sm"
                margin={"0.5rem"}
              >
                💬
              </Tooltip>
            </motion.div>
          </Button>
        </Box>
      </>
      <Flex>
        <Box
          backgroundColor={"#"}
          height={"100%"}
          width={{ base: "100vw", sm: "100vw" }}
        >
          <Flex
            backgroundColor={"#C9B6E4"}
            color={"white"}
            fontWeight={"600"}
            padding={"1rem"}
            height={"10vh"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Text>
              {remoteSocketId ? (
                <Text>
                  {patnerName ? (
                    <> {patnerName} in the room. </>
                  ) : (
                    <>Patner in the Room.</>
                  )}
                </Text>
              ) : (
                <Text
                  style={{
                    transition: "0.2s",
                    cursor: "progress",
                  }}
                  display={"flex"}
                  alignItems={"center"}
                  gap={"1rem"}
                >
                  {" "}
                  <motion.div
                    style={{
                      fontSize: "2rem",
                      transition: "0.2s",
                      cursor: "progress",
                    }}
                    whileHover={{ scale: "1.2 " }}
                  >
                    👀
                  </motion.div>
                  Waiting... Till the Partner Joins
                </Text>
              )}
            </Text>

            <Box display={"flex"} alignItems={"center"} gap={"1rem"}>
              {remoteSocketId ? (
                <Button
                  color={"white"}
                  display={myStream ? "none" : "flex"}
                  backgroundColor={"#BE9FE1"}
                  onClick={handleCallUser}
                  _hover={{ color: "#BE9FE1", backgroundColor: "#efefefef" }}
                  fontSize={"14"}
                >
                  Call Partner 🤙🏻
                </Button>
              ) : (
                <div className="example-container">
                  <motion.div style={{ rotate }}>
                    <Text fontSize={"2rem"}> ߷</Text>
                  </motion.div>
                </div>
              )}

              {myStream && (
                <Button
                  display={patnerName ? "none" : "flex"}
                  fontSize={"14"}
                  color={"white"}
                  backgroundColor={"#BE9FE1"}
                  onClick={sendStreams}
                  isDisabled={callAccepted}
                  _hover={{ color: "#BE9FE1", backgroundColor: "#efefefef" }}
                >
                  {callAccepted ? "Call Accepted" : "Accept Call 🤙🏻"}
                </Button>
              )}
            </Box>
          </Flex>
          <Flex
            justifyContent={"space-evenly"}
            gap={"1rem"}
            direction={{ base: "column", sm: "row" }}
            backgroundColor={"#E1CCEC"}
            height={"90vh"}
            paddingTop={"2rem"}
            paddingX={"1rem"}
            alignItems={"top"}
          >
            <>
              {myStream ? (
                <>
                  <Box
                    alignItems={"center"}
                    justifyContent={"left"}
                    overflow={"hidden"}
                    borderRadius={"0.5rem"}
                    width={{ base: "100%", sm: "200" }}
                    height={
                      chatBar
                        ? { base: "100%", sm: "55%" }
                        : { base: "100%", sm: "80%" }
                    }
                  >
                    <div>
                      <ReactPlayer
                        style={{
                          transform: "scaleX(-1)",
                          borderRadius: "1rem",
                          boxShadow:
                            "rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.13) 0px 0px 1px 1px;",
                        }}
                        playing
                        muted
                        width="100%"
                        height="100%"
                        url={myStream}
                      />
                    </div>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    display={"flex"}
                    alignItems={"flex-end"}
                    width={chatBar ? "100vw" : "50vw"}
                  >
                    <VStack>
                      <dotlottie-player
                        src="https://lottie.host/706f4aaf-1514-451f-833d-8af4531ffb4f/ZSWxGuICpZ.json"
                        background="transparent"
                        speed="1"
                        style={{ width: "80%", height: "70%" }}
                        loop
                        autoplay
                      ></dotlottie-player>
                    </VStack>
                  </Box>
                </>
              )}
            </>

            <>
              {remoteStream ? (
                <>
                  <Box
                    justifyContent={"left"}
                    overflow={"hidden"}
                    borderRadius={"0.5rem"}
                    width={{ base: "100%", sm: "200" }}
                    height={
                      chatBar
                        ? { base: "100%", sm: "55%" }
                        : { base: "100%", sm: "80%" }
                    }
                  >
                    <div>
                      <ReactPlayer
                        style={{
                          transform: "scaleX(-1)",
                          borderRadius: "1rem",
                          boxShadow:
                            "rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px;",
                        }}
                        playing
                        width="100%"
                        height="100%"
                        url={remoteStream}
                      ></ReactPlayer>
                    </div>
                  </Box>
                </>
              ) : (
                <>
                  {" "}
                  {myStream && (
                    <Box
                      display={"flex"}
                      alignItems={"flex-end"}
                      width={chatBar ? "100vw" : "50vw"}
                    ></Box>
                  )}
                </>
              )}
            </>
            {/* Insert x animaton on the below box */}
            <Box
              display={{ base: "none", sm: chatBar ? "flex" : "none" }}
              flexDirection={"column"}
              width={"30vw"}
              textAlign={"right"}
              initial={{ opacity: 0, scaleX: 0 }} // Initial state
              animate={{ opacity: 1, scaleX: chatBar ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              height={"90%"}
              boxShadow=" rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;"
            >
              <Box
                width={"100%"}
                backgroundColor={"white"}
                display={chatBar ? "flex" : "none"}
                borderTopRadius={"0.4rem"}
                height={"1rem"}
              ></Box>
              <Box
                padding={"1rem"}
                width={"30vw"}
                height={"100%"}
                backgroundColor={"white"}
                overflow={"scroll"}
                ref={chatContainerRef}
              >
                {[...messages, ...receivedMessages]
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((item) => (
                    <Box
                      display={"flex"}
                      justifyContent={item.from === "You" ? "right" : "left"}
                      paddingY={"0.2rem"}
                      key={item.from + item.message + item.timestamp}
                      textAlign={item.from === "You" ? "right" : "left"} // Add this line
                    >
                      <Text
                        maxWidth={"70%"}
                        borderRadius={"0.7rem"}
                        padding={"1rem"}
                        backgroundColor={
                          item.from === "You" ? "#E1CCEC" : "#BE9FE1"
                        } // Add this line
                        fontSize={"0.8rem"}
                        color={item.from === "You" ? "black" : "white"} // Add this line
                      >
                        {`${item.from}: ${item.message}`}
                      </Text>
                    </Box>
                  ))}
              </Box>
              <Box
                width={"100%"}
                backgroundColor={"white"}
                display={chatBar ? "flex" : "none"}
                height={"1rem"}
              ></Box>
              <InputGroup display={chatBar ? "block" : "none"}>
                <Input
                  focusBorderColor="transparent"
                  // borderBottomRadius={"2rem"}
                  borderRadius={"0"}
                  borderBottomRadius={"0.5rem"}
                  variant="filled"
                  background={"#efefef"}
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="enter your message"
                  _focus={{
                    bg: "#efefef",
                  }}
                  fontSize={"0.8rem"}
                  onKeyDown={handleKeyDown}
                />

                <InputRightElement
                  cursor={"pointer"}
                  backgroundColor={"#BE9FE1"}
                  width="4.5rem"
                  color={"white"}
                  transition={"0.3s"}
                  onClick={handleSendMessage}
                  _hover={{
                    backgroundColor: "#ad72ff",
                  }}
                >
                  <Text h="1.75rem" size="sm" onClick={() => {}}>
                    send
                  </Text>
                </InputRightElement>
              </InputGroup>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </div>
  );
};

export default Room;

const ZoomContainer = styled.div`
  transition: "1s ";
  transform: scale(0.9);
  transform-origin: center;
`;

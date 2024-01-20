import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import "@dotlottie/player-component";
import React, { useCallback, useEffect, useState } from "react";
import { auth } from "../../config/firebase-config";
import { signOut } from "firebase/auth";
import { useSocket } from "../../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const ChooseLink = ({ user }) => {
  const [newRoom, setNewRoom] = useState(false);
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [isCopied, setIsCopied] = useState(false); // New state for tracking copied status
  const [roomId, setRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);

  const socket = useSocket();
  const navigate = useNavigate();

  const generateUniqueNumber = () => {
    // Get current date and time in milliseconds
    const timestamp = new Date().getTime();

    // Get current seconds
    const seconds = Math.floor(timestamp / 1000);

    // Combine timestamp and seconds to create a unique number
    let uniqueNumber = parseInt(`${timestamp}${seconds}`);
    // Ensure the number has exactly 10 digits
    uniqueNumber = uniqueNumber % 10000000000;
    return uniqueNumber;
  };

  useEffect(() => {
    const uniqueNumber = generateUniqueNumber();
    setRoomId(uniqueNumber.toString());
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        console.log("Unique number copied to clipboard!");
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Unable to copy to clipboard", error);
      });
  };
  const signOutUser = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();
    if (/^\d{10}$/.test(room)) {
      socket.emit("room:join", { email, room });
    } else {
      // Handle the case where the room ID doesn't have 10 digits
      setErrorMessage(true);
      console.error("Room ID must have exactly 10 digits");
      // You may want to display an error message to the user
    }
  }, [room, email, socket][(room, email, socket)]);
  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  const handleRoomCreation = () => {
    setNewRoom(true);
  };

  return (
    <>
      <Flex
        height={"100vh"}
        backgroundColor={"#efefef"}
        justifyContent={"space-between"}
      >
        <ZoomContainer>
          <Box
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
            width={{ base: "100vw", sm: "40vw" }}
          >
            <Box
              borderRadius={"1rem"}
              width={{ base: "100%", sm: "85%" }}
              backgroundColor={"#ffffff"}
              height={{ base: "100vh", sm: "95vh" }}
              padding={{ base: "2rem", sm: "3rem" }}
              overflow={"scroll"}
              boxShadow=" rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px"
            >
              {/* heading */}
              <Flex
                wrap={"wrap"}
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Text
                  display={{ base: "none", sm: "flex" }}
                  cursor={"pointer"}
                  onClick={signOutUser}
                  fontSize={{ base: "1rem", sm: "1.5rem" }}
                >
                  🔙
                </Text>
                <Flex alignItems={"center"} fontSize={"1.3rem"} gap={"0.7rem"}>
                  <Text>👋</Text>
                  <Text
                    fontWeight={600}
                    fontSize={{ base: "1rem", sm: "1.3rem" }}
                  >
                    {user.displayName}
                  </Text>
                </Flex>
                <Button
                  borderRadius={"5rem"}
                  fontSize={"0.7rem"}
                  onClick={signOutUser}
                >
                  <Flex gap={"0.5rem"}>
                    <Text>😔</Text>
                    <Text> Sign Out</Text>
                  </Flex>
                </Button>
              </Flex>
              {/* heading */}

              {/* slogan */}
              <VStack marginY={"3rem"}>
                <Text textAlign={"center"}>Now play games on video call.</Text>
              </VStack>
              {/* slogan */}

              {/* Inputs */}
              <form onSubmit={handleSubmitForm}>
                <Flex
                  flexDirection={{ base: "column", sm: "row" }}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex gap={"0.5rem"} alignItems={"center"}>
                    <Text>🙋🏻‍♂️</Text>
                    <Text>doodle name</Text>
                  </Flex>
                  <Input
                    backgroundColor={"#efefef"}
                    width={{ base: "100%", sm: "60%" }}
                    type="text"
                    value={email}
                    fontSize={"0.9rem"}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Flex>
                <br />
                <Flex
                  flexDirection={{ base: "column", sm: "row" }}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex gap={"0.5rem"} alignItems={"center"}>
                    <Text fontSize={"1.5rem"}>🏠</Text>
                    <Text>room id</Text>
                  </Flex>
                  <Input
                    backgroundColor={"#efefef"}
                    width={{ base: "100%", sm: "60%" }}
                    fontSize={"0.9rem"}
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value.replace(/\D/, ""))}
                  />
                </Flex>
                <VStack marginTop={"2rem"} marginBottom={"2rem"}>
                  {errorMessage && (
                    <Text color={"red"}> 🙋🏼 enter correct Room ID</Text>
                  )}

                  <Button
                    color={"#ffffff"}
                    backgroundColor={"#789461"}
                    display={"flex"}
                    gap={"0.6rem"}
                    type="submit"
                    _hover={{
                      color: "#789461",
                      backgroundColor: "#efefef",
                    }}
                  >
                    <Text fontSize={"1.5rem"}>🤝🏻</Text>
                    <Text> join the room</Text>
                  </Button>
                </VStack>
              </form>
              {/* Inputs */}

              {/* Divider */}
              <Divider />
              {/* Divider */}

              {/* New Room */}
              <VStack marginY={"2rem"}>
                <Button
                  color={"#ffffff"}
                  backgroundColor={"#86A7FC "}
                  display={"flex"}
                  gap={"0.3rem"}
                  type="submit"
                  _hover={{
                    color: "#86A7FC",
                    backgroundColor: "#efefef",
                  }}
                  onClick={handleRoomCreation}
                >
                  <Text fontSize={"1.5rem"}>+</Text>
                  <Text> create new room</Text>
                </Button>
              </VStack>
              {/*  */}
              {newRoom && (
                <VStack>
                  <Box
                    borderRadius={"0.3rem"}
                    height={"5rem"}
                    width={"100%"}
                    backgroundColor={"#efefef"}
                    alignItems={"center"}
                    display={"flex"}
                    justifyContent={"center"}
                  >
                    <Text opacity={"60%"} fontWeight={700}>
                      {roomId}
                    </Text>
                    <Button
                      backgroundColor={"transparent"}
                      padding={0}
                      _hover={{
                        backgroundColor: "transparent",
                      }}
                      onClick={handleCopy}
                      margin={"0rem"}
                    >
                      {isCopied ? (
                        <>
                          <Text color={"#789461"} fontSize={"0.5rem"}>
                            {" "}
                            copied
                          </Text>
                        </>
                      ) : (
                        <>📋</>
                      )}
                    </Button>
                  </Box>
                  <Text fontSize={"0.7rem"} textAlign={"center"}>
                    share this unique room id with your friend and enter it
                    above as well.
                  </Text>
                </VStack>
              )}

              {/*  */}
              {/* New Room */}
              {/* sign out */}

              {/* sign out */}
              {/*  */}
              <Box
                width={"100%"}
                display={"flex"}
                alignItems={"end"}
                justifyContent={"right"}
                marginY={"2rem"}
              ></Box>
            </Box>
          </Box>
        </ZoomContainer>
        {/*  */}
        <Box
          height={"100vh"}
          backgroundColor={"#efefef"}
          width={{ base: "100vw", sm: "60vw" }}
          display={{ base: "none", sm: "flex" }}
          justifyContent={"right"}
          alignItems={"end"}
        >
          <dotlottie-player
            src="https://lottie.host/2a9db1a4-8bcf-49c5-a429-07b632e45bf9/fLYzRWGWVp.json"
            background="transparent"
            speed="1"
            style={{ width: "100%", height: "70%" }}
            loop
            autoplay
          ></dotlottie-player>
        </Box>
      </Flex>
    </>
  );
};

export default ChooseLink;

const ZoomContainer = styled.div`
  transform: scale(0.9);
  transform-origin: center;
`;

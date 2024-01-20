import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import styled from "styled-components";
import "@dotlottie/player-component";
import { auth, googleProvider } from "../../config/firebase-config";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";

const Login = ({ user, setUser }) => {
  const toast = useToast();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        toast({
          title: "Logged In Successfully",
          status: "success",
          isClosable: true,
        });
      }

      setTimeout(() => {
        setUser(user);
      }, 2000);
    });

    return () => unsubscribe();
  }, [toast, setUser]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.log(error);
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Main>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Suggestions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeduOBr8tTAVkrxYqS4SNV8kANI5RtYHJBCFF0mNtY5h9bzqA/viewform?embedded=true"
              width="400"
              height="406"
              frameborder="0"
              marginheight="20"
              marginwidth="20"
            >
              Loading…
            </iframe>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex justifyContent={"space-between"}>
        <Box
          height={"100vh"}
          backgroundColor={"#efefef"}
          width={{ base: "100vw", sm: "60vw" }}
          display={{ base: "none", sm: "flex" }}
          justifyContent={"center"}
        >
          <dotlottie-player
            src="https://lottie.host/64347530-3d37-42ff-a815-a05308302a5f/5ctFXincYQ.json"
            background="transparent"
            speed="1"
            style={{ width: "80%", height: "100%" }}
            loop
            autoplay
          ></dotlottie-player>
        </Box>

        <Box
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
          height={"100vh"}
          backgroundColor={"#efefef"}
          width={{ base: "100vw", sm: "40vw" }}
        >
          <Box
            backgroundColor={"#ffffff"}
            height={{ base: "100vh", sm: "90vh" }}
            width={{ base: "100%", sm: "90%" }}
            borderRadius={"1rem"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            boxShadow=" rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px"
          >
            <ZoomedContainer>
              <VStack>
                <Text fontWeight={"600"} fontSize={{ base: "2em", sm: "3em" }}>
                  welcome back!
                </Text>
                <Text>Please login with your account.</Text>

                <VStack marginTop={"1em"} gap={"1em"}>
                  <Box
                    cursor={"pointer"}
                    width={"19em"}
                    padding={"1em"}
                    display={"flex"}
                    borderRadius={"10em"}
                    paddingX={"2em"}
                    backgroundColor={"#efefef"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                    flexWrap={"wrap"}
                    onClick={signInWithGoogle}
                    transition={"0.3s"}
                    _hover={{
                      backgroundColor: "#e8b8fe",
                      color: "white",
                    }}
                    border={"1px solid black"}
                  >
                    <Flex gap={"1em"}>
                      <Image width={"25px"} src="/assets/google.png" />
                      <Text font fontWeight={"600"}>
                        {" "}
                        Login with Google.
                      </Text>
                    </Flex>
                  </Box>

                  <Box
                    cursor={"pointer"}
                    padding={"1em"}
                    display={"flex"}
                    borderRadius={"10em"}
                    paddingX={"3em"}
                    backgroundColor={"#efefef"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                    flexWrap={"wrap"}
                    transition={"0.3s"}
                    _hover={{
                      backgroundColor: "#e8b8fe",
                      color: "white",
                    }}
                    border={"1px solid black"}
                  >
                    <Flex gap={"1em"}>
                      <Image width={"25px"} src="/assets/face.png" />
                      <Text fontWeight={"600"}> Login with Facebook.</Text>
                    </Flex>
                  </Box>

                  <Box
                    padding={"1em"}
                    cursor={"pointer"}
                    display={"flex"}
                    borderRadius={"10em"}
                    paddingX={"3em"}
                    backgroundColor={"#efefef"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                    flexWrap={"wrap"}
                    width={"19em"}
                    transition={"0.3s"}
                    _hover={{
                      backgroundColor: "#e8b8fe",
                      color: "white",
                    }}
                    border={"1px solid black"}
                  >
                    <Flex gap={"1em"}>
                      <Image width={"25px"} src="/assets/git.svg" />
                      <Text fontWeight={"600"}> Login with Github.</Text>
                    </Flex>
                  </Box>

                  <Box
                    padding={"1em"}
                    cursor={"pointer"}
                    display={"flex"}
                    borderRadius={"10em"}
                    paddingX={"3em"}
                    backgroundColor={"#efefef"}
                    alignItems={"center"}
                    justifyContent={"space-evenly"}
                    flexWrap={"wrap"}
                    width={"19em"}
                    transition={"0.3s"}
                    _hover={{
                      backgroundColor: "#e8b8fe",
                      color: "white",
                    }}
                    border={"1px solid black"}
                  >
                    <Flex gap={"1em"}>
                      <Image width={"25px"} src="/assets/tweet.webp" />
                      <Text fontWeight={"600"}> Login with Twitter.</Text>
                    </Flex>
                  </Box>
                </VStack>

                <Button
                  onClick={onOpen}
                  marginTop={"1em"}
                  borderRadius={"10em"}
                  border={"1px solid black"}
                >
                  <Text fontSize={"0.8em"}>Have Suggestion for us?</Text>
                </Button>
              </VStack>
            </ZoomedContainer>
          </Box>
        </Box>
      </Flex>
    </Main>
  );
};

export default Login;
const Main = styled.div`
  /* div:nth-child(2) {
    transform: scale(0.8);
    transform-origin: center;
  } */
`;

const ZoomedContainer = styled.div`
  transform: scale(0.8);
  transform-origin: center;

  @media screen and (min-width: 1025px) and (max-width: 1280px) {
    transform: scale(0.9);
    transform-origin: center;
  }
`;

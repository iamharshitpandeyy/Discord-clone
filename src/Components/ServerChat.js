import {
  Avatar,
  Backdrop,
  Button,
  CircularProgress,
  Fade,
  Grid,
  IconButton,
  Input,
  Modal,
  TextField,
} from "@material-ui/core";
import { Add, Camera, Close, Send, VideoCall } from "@material-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import empty from "../../src/empty.svg";
import styled from "styled-components";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import {
  enterChannel,
  selectedChannelId,
  selectServerId,
} from "../features/appSlice";
import { auth, db, storageRef } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 420,
    margin: "auto",
  },
  modalPaper: {
    padding: "10px",
    backgroundColor: "#363a3e",
    outline: "none",
    borderRadius: "10px",
    height: "500px",
    width: "500px",
    textAlign: "center",
    boxShadow: theme.shadows[5],
    "& p": {
      padding: "5px",
      color: "gray",
    },
    "& h3": {
      color: "white",
    },
  },
  closeButton: {
    display: "flex",
    justifyContent: "flex-end",
  },
  uploadButtton: {
    backgroundColor: "#7389da",
    color: "white",
    "&:hover": {
      backgroundColor: "#7389da",
      color: "white",
    },
  },
}));

function ServerChat() {
  const channelId = useSelector(selectedChannelId);
  const serverId = useSelector(selectServerId);
  const [openModal, setOpenModal] = React.useState(false);
  const classes = useStyles();

  const [channelName, setChannelName] = useState("");
  const [message, setMessage] = useState("");
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();
  const videoRef = useRef();
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setImage(null);
    setVideo(null);
  };

  const getChannelDetails = () => {
    if (serverId && channelId) {
      db.collection("Servers")
        .doc(serverId)
        .collection("TextChannel")
        .doc(channelId)
        .onSnapshot((queryData) => {
          setChannelName(queryData.data()?.channelName);
        });
    }
  };

  const getChannelMessages = () => {
    if (serverId && channelId) {
      db.collection("Servers")
        .doc(serverId)
        .collection("TextChannel")
        .doc(channelId)
        .collection("Messages")
        .orderBy("timeStamp", "desc")
        .onSnapshot((queryData) => {
          setMessages(queryData.docs);
        });
    }
  };

  useEffect(() => {
    if (serverId && channelId) {
      getChannelDetails();
    }
  }, [serverId, channelId]);

  const sendTextMessageToServer = () => {
    if (serverId && channelId) {
      db.collection("Servers")
        .doc(serverId)
        .collection("TextChannel")
        .doc(channelId)
        .collection("Messages")
        .doc()
        .set({
          senderId: user?.uid,
          messageType: "text",
          message: message,
          senderName: user?.displayName,
          senderProfileImage: user?.photoURL,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

      setMessage("");
    }
  };

  const getImage = () => {
    imageRef.current.click();
  };

  const getVideo = () => {
    videoRef.current.click();
  };

  const uploadImage = async () => {
    if (serverId && channelId && (video || image)) {
      setLoading(true);
      const uploadTask = storageRef
        .child(`${video && "Videos"} ${image && "Images"}`)
        .child(user?.uid)
        .child(Date.now().toString());
      let file = image ? image : video;
      await uploadTask
        .put(file)
        .then((snapShot) => {
          uploadTask.getDownloadURL().then((url) => {
            db.collection("Servers")
              .doc(serverId)
              .collection("TextChannel")
              .doc(channelId)
              .collection("Messages")
              .doc()
              .set({
                senderId: user?.uid,
                messageType: `${image ? "image" : "video"}`,
                message: url,
                senderName: user?.displayName,
                senderProfileImage: user?.photoURL,
                timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
              });
            console.log(url);
          });
        })
        .then(() => {
          setLoading(false);
          handleModalClose();
        })
        .catch((e) => {
          setLoading(false);
          handleModalClose();
        });
    }
  };

  const getImageFromFile = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      handleModalOpen();
    }
  };

  const getVideoFromFile = (e) => {
    if (e.target.files[0]) {
      setVideo(e.target.files[0]);
      handleModalOpen();
    }
  };

  useEffect(() => {
    getChannelMessages();
  }, [channelId, serverId]);

  console.log(messages);

  return (
    <ServerChatContainer>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={openModal}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <div className={classes.modalPaper}>
            {!loading ? (
              <>
                <div className={classes.closeButton}>
                  <IconButton onClick={handleModalClose}>
                    <Close style={{ color: "white" }}></Close>
                  </IconButton>
                </div>
                {(image || video) && (
                  <div>
                    {image && (
                      <img
                        style={{
                          height: "400px",
                          width: "400px",
                          objectFit: "contain",
                        }}
                        src={URL.createObjectURL(image)}
                      />
                    )}
                    {video && (
                      <video
                        style={{
                          height: "400px",
                          width: "400px",
                          objectFit: "contain",
                        }}
                        controls
                        src={URL.createObjectURL(video)}
                      />
                    )}
                    <Button
                      onClick={uploadImage}
                      className={classes.uploadButtton}
                      fullWidth
                    >
                      Upload
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />

                <p>Please Wait.....</p>
              </div>
            )}
          </div>
        </Fade>
      </Modal>

      <>
        <ServerChatNav>
          <h3># {channelName}</h3>
        </ServerChatNav>
        <Chat>
          {serverId === "home" && (
            <div
              style={{
                display: "grid",
                placeItems: "center",
                color: "white",
                height: "100%",
              }}
            >
              <div>
                <img src={empty}></img>
                <h2>No one Around</h2>
              </div>
            </div>
          )}

          {serverId !== "home" && (
            <ChatMessages>
              {messages.length > 0 &&
                messages.map((value) => {
                  const {
                    senderName,
                    senderProfileImage,
                    message,
                    messageType,
                    timeStamp,
                  } = value.data();
                  return (
                    <ChatMessageContainer key={value.id}>
                      <Avatar src={senderProfileImage}></Avatar>
                      <div>
                        <h4>{senderName}</h4>
                        <h6 style={{ color: "gray" }}>
                          {new Date(timeStamp?.toDate()).toString()}
                        </h6>
                        {messageType === "text" && <p>{message}</p>}
                        {messageType === "video" && (
                          <video
                            controls
                            style={{
                              height: 400,
                              width: 400,
                              objectFit: "contain",
                            }}
                            src={message}
                          />
                        )}
                        {messageType === "image" && (
                          <img
                            controls
                            style={{
                              height: 400,
                              width: 400,
                              objectFit: "contain",
                            }}
                            src={message}
                          />
                        )}
                      </div>
                    </ChatMessageContainer>
                  );
                })}
            </ChatMessages>
          )}
          {serverId !== "home" && (
            <form>
              <ChatInputContainer>
                <>
                  <input
                    onChange={getImageFromFile}
                    ref={imageRef}
                    hidden
                    type="file"
                    accept="image/*"
                  ></input>
                  <input
                    onChange={getVideoFromFile}
                    ref={videoRef}
                    hidden
                    type="file"
                    accept="video/*"
                  ></input>
                  <IconButton onClick={getImage}>
                    <Camera style={{ color: "white" }} />
                  </IconButton>
                  <IconButton onClick={getVideo}>
                    <VideoCall style={{ color: "white" }} />
                  </IconButton>
                </>
                <TextField
                  style={{ flex: 1, color: "white" }}
                  InputProps={{
                    disableUnderline: true,
                    className: "textField__label",
                  }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  id="standard-multiline-flexible"
                  multiline
                  rowsMax={10}
                />

                <IconButton
                  disabled={true && !message}
                  onClick={sendTextMessageToServer}
                >
                  <Send style={{ color: "white" }}></Send>
                </IconButton>
              </ChatInputContainer>
            </form>
          )}
        </Chat>
      </>
    </ServerChatContainer>
  );
}

export default ServerChat;

const ServerChatContainer = styled.div`
  flex: 1;
  height: 100vh;
  overflow: hidden;
`;

const ServerChatNav = styled.div`
  height: 59px;
  border-bottom: 1px solid black;
  width: 100%;
  display: flex;
  z-index: 100;
  background-color: #363a3e;
  > h3 {
    padding: 16px;
    color: white;
  }
`;

const Chat = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #363a3e;
`;

const ChatInputContainer = styled.div`
  border-radius: 8px;
  background-color: #40454a;
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  min-height: 20px;
`;

const ChatMessages = styled.div`
  flex: 0.9;
  display: flex;
  flex-direction: column-reverse;
  max-height: 100vh;
  overflow: auto;
`;

const ChatMessageContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 5px;
  border-radius: 5px;
  > div {
    margin-left: 10px;
    color: white;
  }
  :hover {
    background-color: #2e3236;
  }
`;

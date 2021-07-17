import {
  Avatar,
  Backdrop,
  Button,
  Fade,
  FormControlLabel,
  IconButton,
  makeStyles,
  Modal,
  Radio,
  RadioGroup,
  Snackbar,
} from "@material-ui/core";
import {
  Add,
  ArrowDropDown,
  ArrowDropDownOutlined,
  CallEnd,
  Close,
  Headset,
  Mic,
  MicOff,
  ScreenShare,
  VideoCall,
  VolumeOff,
  VolumeUp,
  Wifi,
  WifiOffOutlined,
  WifiOutlined,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
  enterChannel,
  enterServer,
  enterVoiceChannel,
  selectedChannelId,
  selectedVoiceChannelId,
  selectServerId,
} from "../features/appSlice";
import { auth, db } from "../firebase";
import firebase from "firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import * as Cookies from "js-cookie";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
    backgroundColor: "black",
    color: "white",
  },
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
  addNewServerBtn: {
    borderRadius: "6px",
    border: "1px solid gray",
    marginLeft: "5px",
    marginRight: "5px",
    marginTop: "50px",
    display: "flex",
    padding: "8px",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "space-between",
    "&:hover": {
      background: "#ebebec",
    },
  },
  haveAnInvite: {
    backgroundColor: "transparent",
    padding: "10px",
    marginTop: "50px",
    "& h3": {
      fontWeight: "600",
      userSelect: "none",
    },
    "& button": {
      marginTop: "10px",
      backgroundColor: "#74808d",
      color: "white",
      "&:hover": {
        backgroundColor: "#74808d",
        color: "white",
      },
    },
    "& input": {
      marginTop: "15px",
      width: "98%",
      outline: "none",
      padding: "5px",
      backgroundColor: "#303438",
      color: "white",
      border: "none",
      height: "30px",
      fontSize: "16px",
    },
  },

  serverType: {
    width: "95%",
    display: "flex",
    padding: "10px",
    color: "white",
    marginTop: "30px",
    backgroundColor: "#1f2325",
    borderRadius: "10px",

    "&:hover": {
      backgroundColor: "#2e3236",
    },
  },

  uploadImageContainer: {
    width: "100%",
    display: "grid",
    placeItems: "center",
    marginTop: "20px",
  },
  uploadImage: {
    height: "70px",
    widht: "70px",
    borderRadius: "70px",
    border: "5px dotted gray",
    display: "grid",
    placeItems: "center",
    padding: "10px",
  },
}));

function Server() {
  const classes = useStyles();
  const [openModal, setOpenModal] = React.useState(false);
  const [channeltype, setChannelType] = useState("TextChannel");
  const [mic, setMic] = useState(true);
  const [sound, setSound] = useState(true);
  const [channelName, setChannelName] = useState("");
  let unmute = new Audio("/unmute.mp3");
  let deafen = new Audio("/deafen.mp3");
  const serverId = useSelector(selectServerId);
  const channelId = useSelector(selectedChannelId);
  const voiceChannelId = useSelector(selectedVoiceChannelId);
  const [serverDetails, setServerDetails] = useState(null);
  const [textChannels, setTextChannels] = useState([]);
  const [voiceChannels, setVoiceChannels] = useState([]);
  const [user] = useAuthState(auth);
  const dispatch = useDispatch();
  const [voiceChannelMembers, setVoiceChannelMembers] = useState([]);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);

  const handleCloseSnackBar = () => {
    setOpenSnackBar(false);
  };

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleChannelChange = (event) => {
    setChannelType(event.target.value);
  };

  const handleMic = () => {
    unmute.play();
    setMic(!mic);
  };

  const handleSound = () => {
    deafen.play();
    setMic(false);
    setSound(!sound);
  };

  const getServerDetails = () => {
    if (serverId !== "home") {
      //get server details
      db.collection("Servers")
        .doc(serverId)
        .onSnapshot((data) => {
          setServerDetails(data.data());
        });
      //get text channels
      db.collection("Servers")
        .doc(serverId)
        .collection("TextChannel")
        .orderBy("date")
        .onSnapshot((textChannels) => {
          setTextChannels(textChannels.docs);
        });
      //get voice channels
      db.collection("Servers")
        .doc(serverId)
        .collection("VoiceChannel")
        .orderBy("date")
        .onSnapshot((voiceChannels) => {
          setVoiceChannels(voiceChannels.docs);
        });

      if (textChannels.length > 0) {
      }
    }
  };

  //create channel in a particular server;
  const createChannel = () => {
    if (serverId !== "home") {
      db.collection("Servers").doc(serverId).collection(channeltype).doc().set({
        channelName: channelName,
        channelType: channeltype,
        date: Date.now(),
      });
      handleModalClose();
    }
  };

  const selectChannel = (channelId) => {
    dispatch(
      enterChannel({
        channelId: channelId,
      })
    );
  };

  const addToVoiceChannel = (currentVoiceId) => {
    if (serverId) {
      db.collection("Servers")
        .doc(serverId)
        .collection("VoiceChannel")
        .doc(currentVoiceId)
        .collection("Members")
        .doc(user.uid)
        .set({
          userName: user.displayName,
          userId: user.uid,
          userProfileImage: user.photoURL,
          date: Date.now(),
        })
    
          dispatch(
            enterVoiceChannel({
              voiceChannelId: currentVoiceId,
            })
          );

          localStorage.setItem("channel", currentVoiceId);
          localStorage.setItem("baseMode", "avc");
          localStorage.setItem("transcode", "interop");
          localStorage.setItem("attendeeMode", "video");
          localStorage.setItem("videoProfile", "480p_4");
     
    }
  };

  useEffect(() => {
    getVoiceChannelMembers(voiceChannelId);
  }, [voiceChannelId, serverId]);

  const getVoiceChannelMembers = (currentVoiceId) => {
    if (serverId && user && currentVoiceId) {
      db.collection("Servers")
        .doc(serverId)
        .collection("VoiceChannel")
        .doc(currentVoiceId)
        .collection("Members")
        .orderBy("date", "desc")
        .onSnapshot((querySnapshot) => {
          setVoiceChannelMembers(querySnapshot.docs);
        });
    }
  };

  const removeFromVoice = () => {
    if (serverId && user && voiceChannelId) {
      db.collection("Servers")
        .doc(serverId)
        .collection("VoiceChannel")
        .doc(voiceChannelId)
        .collection("Members")
        .doc(user.uid)
        .delete()
        .then(() => {
          dispatch(
            enterVoiceChannel({
              voiceChannelId: null,
            })
          );
        });
    }
  };

  useEffect(() => {
    getServerDetails();
  }, [serverId]);

  useEffect(() => {
    if (textChannels.length > 0) {
      selectChannel(textChannels[0]?.id);
    }
  }, [textChannels]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${serverId}/join`);
    setOpenSnackBar(true);
  };

  return (
    <ServerContainer>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={2000}
        onClose={handleCloseSnackBar}
      >
        <Alert onClose={handleCloseSnackBar} severity="success">
          Invite link copied to clipboard!
        </Alert>
      </Snackbar>
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
            <>
              <div className={classes.closeButton}>
                <IconButton onClick={handleModalClose}>
                  <Close style={{ color: "white" }}></Close>
                </IconButton>
              </div>

              <h3>Create a Channel</h3>

              <div>
                <RadioGroup
                  aria-label="Channel"
                  name="channel"
                  value={channeltype}
                  onChange={handleChannelChange}
                >
                  <div className={classes.serverType}>
                    <FormControlLabel
                      value="TextChannel"
                      control={<Radio style={{ color: "#8fa1e1" }} />}
                      label="# Text Channel"
                    />
                  </div>
                  <div className={classes.serverType}>
                    <FormControlLabel
                      value="VoiceChannel"
                      control={<Radio style={{ color: "#8fa1e1" }} />}
                      label="# Voice Channel"
                    />
                  </div>
                </RadioGroup>
              </div>
              <div className={classes.haveAnInvite}>
                <h3>Channel Name</h3>
                <input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="# Channel Name"
                ></input>
                <Button
                  disabled={!channelName}
                  onClick={createChannel}
                  fullWidth
                >
                  Create Channel
                </Button>
              </div>
            </>
          </div>
        </Fade>
      </Modal>

      <ServerHead>
        {serverId !== "home" && (
          <div>
            <h4>{serverDetails?.serverName}</h4>
          </div>
        )}
        {serverId === "home" && (
          <div>
            <h4>Friends</h4>
            <Button onClick={() => auth.signOut()}>Log out</Button>
          </div>
        )}
      </ServerHead>
      <ServerBody>
        {serverId !== "home" && (
          <>
            <div
              style={{ display: "grid", placeItems: "center", color: "white" }}
            >
              <Button
                onClick={copyInviteLink}
                fullWidth
                style={{ backgroundColor: "#7389da", color: "white" }}
              >
                Copy Invite link
              </Button>
            </div>
            <TextChannels>
              <ChannelHead>
                <div>
                  <ArrowDropDownOutlined fontSize="small" />
                  <p>TEXT CHANNELS</p>
                </div>
                <IconButton onClick={handleModalOpen}>
                  <Add style={{ color: "white" }} fontSize="small" />
                </IconButton>
              </ChannelHead>

              {textChannels.length > 0 &&
                textChannels.map((value) => {
                  return (
                    <>
                      <TextChannel
                        onClick={() => selectChannel(value.id)}
                        className={`${
                          channelId === value.id ? "selected__channel" : ""
                        }`}
                        key={value.id}
                      >{`# ${value?.data().channelName}`}</TextChannel>
                    </>
                  );
                })}
            </TextChannels>
            <VoiceChannels>
              <ChannelHead>
                <div>
                  <ArrowDropDownOutlined fontSize="small" />
                  <p>VOICE CHANNELS</p>
                </div>
                <IconButton onClick={handleModalOpen}>
                  <Add style={{ color: "white" }} fontSize="small" />
                </IconButton>
              </ChannelHead>
              {voiceChannels.length > 0 &&
                voiceChannels.map((value) => {
                  return (
                    <>
                      <VoiceChannel
                        onClick={() => addToVoiceChannel(value.id)}
                        key={value.id}
                      >
                        <VolumeUp fontSize="small" /> {value.data().channelName}
                      </VoiceChannel>
                      {voiceChannelMembers.length > 0 &&
                        voiceChannelMembers.map((members) => {
                          return (
                            <VoiceChannelItem>
                              <Avatar
                                src={members.data().userProfileImage}
                                style={{ width: "18px", height: "18px" }}
                              ></Avatar>
                              <p>{members.data().userName}</p>
                            </VoiceChannelItem>
                          );
                        })}
                    </>
                  );
                })}
            </VoiceChannels>
          </>
        )}
        {serverId === "home" && (
          <>
            <p style={{ color: "white", padding: "20px" }}>Direct Messages</p>
          </>
        )}
      </ServerBody>
      <ServerFooter>
        {voiceChannelId !== null && (
          <ServerFooterCall>
            <div>
              <WifiOutlined fontSize="small" style={{ color: "#43b581" }} />
              <p>Voice Connected</p>
              <IconButton
                onClick={removeFromVoice}
                style={{ marginLeft: "20px" }}
              >
                <CallEnd style={{ color: "white" }} />
              </IconButton>
            </div>
            <div>
              <Button
                style={{
                  backgroundColor: "#363a3e",
                  fontSize: "small",
                  color: "white",
                }}
              >
                <VideoCall fontSize="small" style={{ color: "white" }} />
                Video
              </Button>
              <Button
                style={{
                  backgroundColor: "#363a3e",
                  fontSize: "small",
                  color: "white",
                }}
              >
                <ScreenShare fontSize="small" style={{ color: "white" }} />
                Screen
              </Button>
            </div>
          </ServerFooterCall>
        )}
        <ServerFooterControls>
          <div>
            <Avatar src="https://icon-library.com/images/yellow-discord-icon/yellow-discord-icon-24.jpg"></Avatar>
            <h4>{user?.displayName}</h4>
          </div>
          <div>
            <IconButton>
              {mic ? (
                <Mic
                  onClick={handleMic}
                  style={{ color: "#b8bbbe" }}
                  fontSize="small"
                />
              ) : (
                <MicOff
                  onClick={handleMic}
                  style={{ color: "#b8bbbe" }}
                  fontSize="small"
                />
              )}
            </IconButton>
            <IconButton>
              {sound ? (
                <VolumeUp
                  onClick={handleSound}
                  style={{ color: "#b8bbbe" }}
                  fontSize="small"
                />
              ) : (
                <VolumeOff
                  onClick={handleSound}
                  style={{ color: "#b8bbbe" }}
                  fontSize="small"
                />
              )}
            </IconButton>
          </div>
        </ServerFooterControls>
      </ServerFooter>
    </ServerContainer>
  );
}

export default Server;

const ServerContainer = styled.div`
  width: 240px;
  background-color: #2e3236;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ServerHead = styled.div`
  color: white;
  height: 59px;
  border-bottom: 1px solid black;
  > div {
    padding: 14px;
  }
`;

const ServerBody = styled.div`
  flex: 1;
  overflow: scroll;
`;

const TextChannels = styled.div`
  color: white;
  font-weight: 600;
  > p {
    font-size: 12px;
  }
`;

const VoiceChannels = styled.div``;

const ChannelHead = styled.div`
  color: gray;
  display: flex;
  align-items: center;
  padding-right: 10px;
  margin-left: 5px;
  justify-content: space-between;
  width: 95%;
  margin-top: 10px;
  cursor: pointer;
  > div {
    :hover {
      color: white;
    }
    display: flex;
    font-weight: 600;
    align-items: center;
    > p {
      font-size: 11px;
      user-select: none;
    }
  }
`;

const TextChannel = styled.div`
  margin: 10px;
  border-radius: 8px;
  padding: 10px;
  user-select: none;
  color: gray;
  cursor: pointer;

  :hover {
    background-color: #393d42;
    color: white;
  }
`;

const VoiceChannel = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin-left: 10px;
  margin-right: 10px;
  color: gray;
  padding: 8px;
  cursor: pointer;

  :hover {
    background-color: #393d42;
    color: white;
  }
  :focus {
  }
`;

const ServerFooter = styled.div`
  background-color: #2d2c2f;
`;

const ServerFooterCall = styled.div`
  padding: 10px;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-around;
    > p {
      margin-left: 7px;
      font-size: 14px;
      color: #43b581;
    }
  }
`;

const ServerFooterControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 50px;
  background-color: #282c2f;
  > div {
    display: flex;
    align-items: center;
    > h4 {
      margin-left: 6px;
      color: white;
    }
  }
`;

const VoiceChannelItem = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
  margin-top: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  > p {
    font-size: 13px;
    color: white;
    margin-left: 10px;
  }
`;

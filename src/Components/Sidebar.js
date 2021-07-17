import {
  Avatar,
  Backdrop,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  Modal,
  Popover,
  Typography,
} from "@material-ui/core";
import {
  Add,
  ArrowForwardIos,
  Camera,
  CameraAlt,
  Close,
} from "@material-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { makeStyles } from "@material-ui/core/styles";
import { auth, db, provider, storageRef } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase";
import { useDispatch } from "react-redux";
import { enterServer, selectServerId } from "../features/appSlice";

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
    backgroundColor: theme.palette.background.paper,
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
    backgroundColor: "#f6f6f7",
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
      backgroundColor: "#e0e3e5",
      border: "none",
      height: "30px",
      fontSize: "16px",
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
    cursor: "pointer",
  },
}));

function Sidebar() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [popoverMessage, setPopOverMessage] = useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [openCreateNewServerModal, setOpenCreateNewServerModal] = useState(
    false
  );
  const [user] = useAuthState(auth);
  const [image, setImage] = useState(null);
  const [serverName, setServerName] = useState("Your Server");
  const [joiningLink, setJoiningLink] = useState("");

  const uploadImageRef = useRef();
  const [loading, setLoading] = useState(false);

  const [servers, setServers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [clickedId, setClickedId] = useState("home");

  const dispatch = useDispatch();

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenCreateNewServerModal(false);
    setOpenModal(false);
  };
  const handlePopoverOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setPopOverMessage(message);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopOver = Boolean(anchorEl);

  //open modal form to create server
  const addServer = (e) => {
    e.preventDefault();
    setOpenModal(true);
  };

  const handleCreateNewServer = () => {
    setOpenCreateNewServerModal(true);
  };

  const getImage = () => {
    uploadImageRef.current.click();
  };

  //create server in database;
  const createServer = async () => {
    if (user) {
      setLoading(true);
      const uploadTask = storageRef
        .child("Servers")
        .child(serverName + user?.uid)
        .child(Date.now().toString());

      await uploadTask.put(image).then((snapshot) => {
        uploadTask.getDownloadURL().then((url) => {
          db.collection("Servers")
            .add({
              createdBy: user.uid,
              date: Date.now(),
              serverImage: url,
              serverName: serverName,
              members: [{uid : user.uid, name : user.displayName, photoUrl: user.photoURL}],
              memberIds: [user.uid],
            })
            .then((docRef) => {
              db.collection("Servers")
                .doc(docRef.id)
                .collection("TextChannel")
                .doc()
                .set({
                  channelName: "general",
                  channelType: "text",
                  date: Date.now(),
                });
              db.collection("Servers")
                .doc(docRef.id)
                .collection("VoiceChannel")
                .doc()
                .set({
                  channelName: "general",
                  channelType: "voice",
                  date: Date.now(),
                });
              db.collection("Servers")
                .doc(docRef.id)
                .update({
                  joiningLink: `${docRef.id}/join`,
                });
            });
        });
      });

      handleModalClose();
      setJoiningLink("");
      setLoading(false);
    }
  };

  const joinServer = () => {
    if (user && joiningLink) {
      setLoading(true);
      let link = joiningLink.split("/")[0];
      db.collection("Servers")
        .doc(link)
        .update({
          members: firebase.firestore.FieldValue.arrayUnion({
            uid: user.uid,
            name: user.displayName,
            photoUrl: user.photoURL,
          }),
          memberIds: firebase.firestore.FieldValue.arrayUnion(user.uid)
        })

        .then(() => {
          console.log("Server Joined");
          handleModalClose();
          setLoading(false);
          setJoiningLink("");
        })
        .catch((e) => {
          setErrorMessage("Invalid Joining Link");
          setTimeout(() => {
            handleModalClose();
            setLoading(false);
            setJoiningLink("");
            setErrorMessage("");
          }, [500]);
        });
    }
  };

  const getServers = () => {
    if (user) {
      db.collection("Servers")
        .where("memberIds", "array-contains", user.uid)
        .onSnapshot((qureySnapshot) => {
          setServers(qureySnapshot.docs);
        });
    }
  };

  const selectServer = (serverId) => {
    setClickedId(serverId);
    dispatch(
      enterServer({
        serverId: serverId,
      })
    );
  };

  useEffect(() => {
    dispatch(
      enterServer({
        serverId: 'home'
      })
    )
    getServers();
  }, [user]);

  return (
    <SidebarContainer>
      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={openPopOver}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography>{popoverMessage}</Typography>
      </Popover>

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
            {openCreateNewServerModal === false && !loading && (
              <>
                <div className={classes.closeButton}>
                  <IconButton onClick={handleModalClose}>
                    <Close></Close>
                  </IconButton>
                </div>
                <div>
                  <h3>Create a server</h3>
                </div>
                <p>
                  Your server is where you and your friends hangout. Make yours
                  and start talking
                </p>
                <div
                  onClick={handleCreateNewServer}
                  className={classes.addNewServerBtn}
                >
                  <img src="https://discord.com/assets/79516499036b21acd5f56ccba0635c38.svg" />
                  <h4>Create New Server</h4>
                  <ArrowForwardIos fontSize="small" />
                </div>
                <div className={classes.haveAnInvite}>
                  <h3>Have an invite already?</h3>
                  <input
                    value={joiningLink}
                    onChange={(e) => setJoiningLink(e.target.value)}
                    placeholder="Joining Link"
                  ></input>
                  <Button
                    disabled={!joiningLink}
                    onClick={joinServer}
                    fullWidth
                  >
                    Join a Server
                  </Button>
                </div>
              </>
            )}

            {openCreateNewServerModal === true && !loading && (
              <>
                <div className={classes.closeButton}>
                  <IconButton onClick={handleModalClose}>
                    <Close></Close>
                  </IconButton>
                </div>
                <div>
                  <h3>Customize your server</h3>
                </div>
                <p>
                  Give your new server a personality with a name and and an
                  icon. You can always change it later.
                </p>
                <div className={classes.uploadImageContainer}>
                  <div onClick={getImage} className={classes.uploadImage}>
                    <input
                      onChange={(e) => setImage(e.target.files[0])}
                      ref={uploadImageRef}
                      hidden
                      type="file"
                      accept="image/*"
                    ></input>
                    {!image ? (
                      <div>
                        <CameraAlt />
                        <p>UPLOAD</p>
                      </div>
                    ) : (
                      <img
                        style={{
                          objectFit: "fill",
                          height: "70px",
                          width: "70px",
                          borderRadius: "70px",
                        }}
                        src={URL.createObjectURL(image)}
                      ></img>
                    )}
                  </div>
                </div>
                <div className={classes.haveAnInvite}>
                  <h3>Server Name</h3>
                  <input
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Server Name"
                  ></input>
                  <Button
                    disabled={!serverName}
                    onClick={createServer}
                    fullWidth
                  >
                    Create your Server
                  </Button>
                </div>
              </>
            )}

            {loading && (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
                {errorMessage ? (
                  <h4 style={{ color: "red" }}>{errorMessage}</h4>
                ) : (
                  <p>Please Wait.....</p>
                )}
              </div>
            )}
          </div>
        </Fade>
      </Modal>

      <SidebarItem
        onClick = {() => selectServer(
          'home'
        )}
        onMouseLeave={handlePopoverClose}
        onMouseOver={(e) => handlePopoverOpen(e, "Home")}
      >
        {clickedId === "home" && <SidebarItemBorder />}
        <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/198142ac-f410-423a-bf0b-34c9cb5d9609/dbtif5j-60306864-d6b7-44b6-a9ff-65e8adcfb911.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzE5ODE0MmFjLWY0MTAtNDIzYS1iZjBiLTM0YzljYjVkOTYwOVwvZGJ0aWY1ai02MDMwNjg2NC1kNmI3LTQ0YjYtYTlmZi02NWU4YWRjZmI5MTEucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.pRh5DK_cxlZ6SxVPqoUSsSNo1fqksJVP6ECGVUi6kmE" />
      </SidebarItem>

      <hr />

      {servers.length > 0 &&
        servers.map((value) => {
          return (
            <>
              <SidebarItem
                onClick={() => selectServer(value.id)}
                key={value.id}
                onMouseLeave={handlePopoverClose}
                onMouseOver={(e) =>
                  handlePopoverOpen(e, value.data().serverName.toUpperCase())
                }
              >
                {clickedId === value.id && <SidebarItemBorder />}
                <img src={value.data().serverImage} />
              </SidebarItem>
            </>
          );
        })}

      <AddServerButton
        onClick={addServer}
        onMouseLeave={handlePopoverClose}
        onMouseOver={(e) => handlePopoverOpen(e, "Add Server")}
      >
        <Add />
      </AddServerButton>
    </SidebarContainer>
  );
}

export default Sidebar;

const SidebarContainer = styled.div`
  height: 97.5vh;
  overflow: auto;
  background-color: #1f2325;
  width: 70px;
  padding-top: 20px;
  > hr {
    margin-top: 13px;
    width: 50%;
    margin-left: auto;
    margin-right: auto;
    border: 0.5px solid gray;
  }
`;

const SidebarItem = styled.div`
  display: flex;
  margin-top: 10px;
  margin-bottom: 15px;
  > img {
    height: 50px;
    width: 50px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 30px;
    object-fit: fill;
    cursor: pointer;
  }
`;

const SidebarItemBorder = styled.div`
  border-radius: 20px;
  height: 50px;
  border-right: 3px solid white;
`;

const AddServerButton = styled.div`
  height: 50px;
  width: 50px;
  border-radius: 50px;
  background-color: #363a3e;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  display: grid;
  place-items: center;
  color: #43b581;
  cursor: pointer;
  :hover {
    background-color: #43b581;
    color: white;
    border-radius: 20px;
  }
`;

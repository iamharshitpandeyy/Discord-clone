import React, { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./Components/Sidebar";
import Server from "./Components/Server";
import * as Cookies from "js-cookie";
import ServerChat from "./Components/ServerChat";
import MemberList from "./Components/MemberList";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Login from "./Views/Login";
import { auth, db } from "./firebase";
import { useSelector } from "react-redux";
import {
  selectedChannelId,
  selectedVoiceChannelId,
  selectServerId,
} from "./features/appSlice";
import { AGORA_APP_ID } from "./agora.config";
import Meeting from "./meeting/index";
import { useAuthState } from "react-firebase-hooks/auth";

function App() {
  const appId = AGORA_APP_ID;
  const uid = undefined;
  const serverId = useSelector(selectServerId);
  const [user, loading] = useAuthState(auth);
  const voiceChannelId = useSelector(selectedVoiceChannelId);

  useEffect(() => {
    if (auth && user) {
      db.collection("Users").doc(user?.uid).set({
        name: user?.displayName,
        userImage: user?.photoURL,
        email: user?.email,
        userId: user?.uid,
      });
    }
  }, []);

  return (
    <div className="app">
      <Router>
        {!user ? (
          <Login />
        ) : (
          <>
            <Switch>
              <Route path="/" exact>
                <>
                  <Sidebar />
                  <Server />
                  {voiceChannelId === null ? (
                    <>
                      <ServerChat />
                      {serverId !== "home" && <MemberList />}
                    </>
                  ) : (
                    <Meeting />
                  )}
                </>
              </Route>
            </Switch>
          </>
        )}
      </Router>
    </div>
  );
}

export default App;

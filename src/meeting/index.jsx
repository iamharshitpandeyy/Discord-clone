import React from "react";
import * as Cookies from "js-cookie";

import "./meeting.css";
import AgoraVideoCall from "../Components/AgoraVideoCall/index";
import { AGORA_APP_ID } from "../agora.config";
class Meeting extends React.Component {
  constructor(props) {
    super(props);
    this.videoProfile = localStorage.getItem("videoProfile") || "480p_4";
    this.channel = localStorage.getItem("channel") || "test";
    this.transcode = localStorage.getItem("transcode") || "interop";
    this.attendeeMode = localStorage.getItem("attendeeMode") || "video";
    this.baseMode = localStorage.getItem("baseMode") || "avc";
    this.appId = AGORA_APP_ID;
    if (!this.appId) {
      return alert("Get App ID first!");
    }
    this.uid = undefined;
  }

  render() {
    return (
      <div className="wrapper meeting">
        <div className="ag-header">
       
          <div className="ag-header-msg">
            Room:&nbsp;<span id="room-name">{this.channel}</span>
          </div>
        </div>
        <div className="ag-main">
          <div className="ag-container">
            <AgoraVideoCall
              videoProfile={this.videoProfile}
              channel={this.channel}
              transcode={this.transcode}
              attendeeMode={this.attendeeMode}
              baseMode={this.baseMode}
              appId={this.appId}
              uid={this.uid}
            />
          </div>
        </div>
        
      </div>
    );
  }
}

export default Meeting;

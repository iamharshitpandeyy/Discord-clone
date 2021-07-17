import { Avatar } from "@material-ui/core";
import { Search } from "@material-ui/icons";
import userEvent from "@testing-library/user-event";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { selectServerId } from "../features/appSlice";
import { auth, db } from "../firebase";

function MemberList() {
  const serverId = useSelector(selectServerId);
  const [members, setMembers] = useState([]);
  const [user] = useAuthState(auth);
  const getMembers = () => {
    if (serverId !== "home" && serverId) {
      db.collection("Servers")
        .doc(serverId)
        .onSnapshot((queryData) => {
          setMembers(queryData.data().members);
        });
    }
  };

  useEffect(() => {
    getMembers();
  }, [serverId]);

  return (
    <MemeberListContainer>
      <Header>
        <div>
          <input placeholder="search" />
          <Search fontSize="small"></Search>
        </div>
      </Header>
      <Members>
        {members.length > 0 &&
          members.map((value) => {
            return (
              value.uid !== user.uid && (
                <Member>
                  <Avatar src={value.photoUrl} />
                  <h4>{value.name}</h4>
                </Member>
              )
            );
          })}

        {members.length === 1 && (
          <div style = {{display : 'grid', placeItems: 'center', height: '100%', color : 'white'}}>
            <h2>No members</h2>
          </div>
        )}
      </Members>
    </MemeberListContainer>
  );
}

export default MemberList;

const MemeberListContainer = styled.div`
  background-color: #2e3236;
  width: 230px;

  height: 100vh;
`;

const Header = styled.div`
  height: 59px;
  display: flex;
  align-items: center;
  background-color: #363a3e;

  > div {
    margin-left: 20px;
    background-color: #1f2325;
    align-items: center;
    display: flex;
    padding: 5px;
    height: 14px;
    border-radius: 5px;
    > input {
      background-color: transparent;
      color: white;
      border: none;
      outline: none;
    }
    > .MuiSvgIcon-root {
      color: gray;
    }
  }
`;

const Members = styled.div`
  padding-left: 20px;
  overflow: auto;
  height: 100vh;
`;

const Member = styled.div`
  display: flex;
  margin-top: 20px;
  margin-bottom: 10px;
  align-items: center;
  > h4 {
    margin-left: 12px;
    color: white;
  }
`;

import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useNavigate } from "react-router-dom";
import {confirm} from 'react-bootstrap-confirmation';
import { BiPowerOff } from "react-icons/bi";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";
import styled from "styled-components";

export default function DropdownMenu() {
  const navigate = useNavigate();
  const handleClick = async () => {
    const result = await confirm('Are you sure you want to Log out?');
    if (result) {
      const id = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      )._id;
      const data = await axios.get(`${logoutRoute}/${id}`);
      if (data.status === 200) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };
  return (
    <ChatMenu>
      {/* <Button onClick={handleClick}>
        <BiPowerOff />
      </Button> */}
      <DropdownButton id="dropdown-basic-button" title="Menu">
        <Dropdown.Item>Report bad words</Dropdown.Item>
        <Dropdown.Item onClick={handleClick}>Log Out</Dropdown.Item>
      </DropdownButton>
    </ChatMenu>
  );
}

const ChatMenu = styled.div`
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // padding: 0.5rem;
  // border-radius: 0.5rem;
  // background-color: #9a86f3;
  // border: none;
  // cursor: pointer;
  // svg {
  //   font-size: 1.3rem;
  //   color: #ebe7ff;
  // }
  #dropdown-basic-button {
    background-color: #9a86f3;
    border-color: #9a86f3;
    display: flex;
    align-items: center;
  }
`;

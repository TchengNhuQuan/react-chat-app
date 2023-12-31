import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useNavigate } from "react-router-dom";
import { confirm } from "react-bootstrap-confirmation";
import axios from "axios";
import { logoutRoute } from "../utils/APIRoutes";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatDropdownMenu({ handleAddBadWords }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [badWordValues, setBadWordValues] = useState(null);

  const errorToastOptions = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };

  const handleClick = async () => {
    const result = await confirm("Are you sure you want to Log out?");
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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (event) => {
    setBadWordValues(event.target.value);
  };

  const validateInput = (input) => {
    const pattern = /^(\w+,\s)*\w+(,\s\w+)*$/;
    const isValid = pattern.test(input);

    return isValid;
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (validateInput(badWordValues)) {
      handleAddBadWords(badWordValues);
      setValidated(true);
      setShow(false);
    } else {
      event.preventDefault();
      event.stopPropagation();
      toast.error(
        "Please fill in the form with valid format as xxx, xxx, xxx",
        errorToastOptions
      );
    }
  };

  return (
    <>
      <ChatMenu>
        <DropdownButton id="dropdown-basic-button" title="Menu">
          <Dropdown.Item onClick={handleShow}>Report bad words</Dropdown.Item>
          <Dropdown.Item onClick={handleClick}>Log Out</Dropdown.Item>
        </DropdownButton>
      </ChatMenu>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report Bad Words</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group as={Col} md="12">
              <Form.Label>Please add new bad words below</Form.Label>
              <Form.Control
                type="text"
                placeholder="xxx, xxx, xxx"
                required
                name="badwords"
                onChange={(e) => handleChange(e)}
              />
              <Form.Control.Feedback type="invalid">
                Please provide bad word in valid format.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit">Submit form</Button>
          </Modal.Footer>
        </Form>
        <ToastContainer />
      </Modal>
    </>
  );
}

const ChatMenu = styled.div`
  #dropdown-basic-button {
    background-color: #9a86f3;
    border-color: #9a86f3;
    display: flex;
    align-items: center;
  }
`;

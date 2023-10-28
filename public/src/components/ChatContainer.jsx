import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import ChatDropdownMenu from "./ChatDropdownMenu";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  sendMessageRoute,
  recieveMessageRoute,
  updateUserRoute,
  getBadWordsRoute,
  addBadWordsRoute,
} from "../utils/APIRoutes";
import FilterHacked from "../utils/bad-words-hacked.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sentiment from "sentiment";

export default function ChatContainer({ currentChat, socket }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [badWords, setBadWords] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [sentimentScore, setSentimentScore] = useState(null);
  const [generalSentiment, setGeneralSentiment] = useState(null);
  const [warning, setWarning] = useState(0);
  const scrollRef = useRef();
  const filter = new FilterHacked();
  const sentiment = new Sentiment();
  const toastOptions = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };
  const errorToastOptions = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };

  useEffect(() => {
    async function setMessagesForUser() {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(recieveMessageRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    }

    setMessagesForUser();
    setSentimentScore(null);
    setGeneralSentiment(null);
  }, [currentChat]);

  useEffect(() => {
    async function setBadwordsRules() {
      const response = await axios.post(getBadWordsRoute);
      let wordArr = [];
      response.data.forEach((element) => {
        wordArr.push(element.word);
      });
      setBadWords(wordArr);
    }

    setBadwordsRules();
  }, [messages]);

  useEffect(() => {
    filter.addWords(...badWords);
  }, [badWords])

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    filter.addWords(...badWords);
    // check for bad words
    if (filter.cleanHacked(msg).includes("*")) {
      setWarning(warning + 1);
      toast.warn("Please don't say bad words!", toastOptions);
    }

    // calculate the sentiment score
    const sentimentResult = sentiment.analyze(msg);
    setSentimentScore(sentimentResult.score);

    // analyze the general sentiment
    if (sentimentResult.score < 0) {
      setGeneralSentiment("Negative");
    } else if (sentimentResult.score > 0) {
      setGeneralSentiment("Positive");
    } else {
      setGeneralSentiment("Neutral");
    }

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  const handleAddBadWords = async (badwords) => {
    let newBadWords = badwords.split(", ");

    for (var i = 0; i < newBadWords.length; i++) {
      try {
        await axios.post(addBadWordsRoute, {
          word: newBadWords[i],
        });
        setBadWords([...badWords, newBadWords[i]])
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const updateUser = async () => {
      const user = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const data = await axios.post(`${updateUserRoute}/${user._id}`);
      if (data.status) {
        toast.error(
          "Your account has been banned after 3 times warning!",
          errorToastOptions
        );
        setTimeout(() => {
          localStorage.clear();
          navigate("/login");
        }, 3000);
      }
    };
    if (warning >= 3) {
      updateUser();
    }
  }, [warning]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-info">
          <div className="user-details">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                alt=""
              />
            </div>
            <div className="username">
              <h3>{currentChat.username}</h3>
            </div>
          </div>
          <div className="sentiment-score">
            Sentiment score: {sentimentScore}
          </div>
          <div className="general-sentiment">
            General sentiment: {generalSentiment}
          </div>
          <ChatDropdownMenu handleAddBadWords={handleAddBadWords}/>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          filter.addWords(...badWords);

          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "received"
                }`}
              >
                <div className="content ">
                  <p>{filter.cleanHacked(message.message)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
      <ToastContainer />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 2rem;
    width: 100%;
    height: max-content;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
          margin-bottom: 0px;
        }
      }
    }
    .user-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-top: 12px;
    }
    .sentiment-score,
    .general-sentiment {
      color: #fff;
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .received {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;

import React, { useEffect, useState, createContext, useContext } from "react";
import { ArrowLeft, Search, Send } from "lucide-react";
import { io } from "socket.io-client";

/* ================= CONTEXT ================= */
const ChatContext = createContext();
const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const token = localStorage.getItem("token");
  const API_URL = "https://movie-nova-4.onrender.com";
  const [socket, setSocket] = useState(null);

useEffect(() => {
  const s = io(API_URL); // connect to your backend
  setSocket(s);

  return () => s.disconnect(); // cleanup on unmount
}, []);
useEffect(() => {
  if (!socket) return;
  const userId = localStorage.getItem("userId"); // or wherever you store logged-in user's ID
  if (userId) {
    socket.emit("join", userId);
  }
}, [socket]);

  useEffect(() => {
    fetch(`${API_URL}/chats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.length) setChats(data);
    })
    .catch(() => console.log("Failed to fetch chats"));
  }, []);
  
  useEffect(() => {
  if (!socket) return;

  socket.on("newMessage", (msg) => {
    // Update the chats state
    setChats((prev) => {
      return prev.map((chat) => {
        if (chat._id === msg.chatId) {
          return {
            ...chat,
            lastMessage: msg.text,
            unread: chat.unread + 1, // simple increment
          };
        }
        return chat;
      });
    });
  });

  return () => socket.off("newMessage");
}, [socket]);

  return (
    <ChatContext.Provider value={{ chats, socket }}>
        {children}
    </ChatContext.Provider>
  );
};

/* ================= COMPONENTS ================= */

const SearchBar = ({ value, onChange }) => (
  <div className="px-4 pb-3">
    <div className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm">
      <Search className="w-4 h-4 text-gray-400 mr-2" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Chats..."
        className="bg-transparent outline-none text-sm w-full"
      />
    </div>
  </div>
);

const ChatItem = ({ chat, onClick }) => (
  <div
    onClick={() => onClick(chat)}
    className="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-white cursor-pointer transition"
  >
    <div className="flex items-center gap-3">
      <div className="relative">
        <img src={chat.avatar} className="w-12 h-12 rounded-full" />
        {chat.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold">{chat.name}</h2>
        <p className="text-xs text-gray-500">{chat.lastMessage}</p>
      </div>
    </div>

    <div className="flex flex-col items-end">
      <span className="text-xs text-gray-400">{chat.time}</span>

      {chat.unread > 0 && (
        <span className="mt-1 bg-blue-500 text-white text-[10px] px-2 py-[2px] rounded-full">
          {chat.unread}
        </span>
      )}
    </div>
  </div>
);

/* ================= PAGES ================= */

const MessagesPage = ({ openChat, openNew }) => {
  const { chats } = useContext(ChatContext);
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#F5F7FB] flex flex-col relative">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <div />
        <h1 className="text-lg font-semibold">Messages</h1>
        <div className="w-5"></div>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className="flex-1 overflow-y-auto px-3">
        {filtered.map((chat) => (
          <ChatItem key={chat._id} chat={chat} onClick={openChat} />
        ))}
      </div>
    </div>
  );
};

const ChatPage = ({ chat, goBack }) => {
const [messages, setMessages] = useState([]);
const token = localStorage.getItem("token");
const { socket } = useContext(ChatContext);
const API_URL = "https://movie-nova-4.onrender.com";
const [input, setInput] = useState("");
useEffect(() => {
  fetch(`https://movie-nova-4.onrender.com/chats/${chat._id}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => setMessages(data))
    .catch(err => console.log(err));
}, [chat._id]);
const sendMessage = async () => {
const textToSend = input.trim();
if (!textToSend) return;

try {
  await fetch(`${API_URL}/chats/${chat._id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text: textToSend }),
  });

  // refresh messages
  const res = await fetch(`${API_URL}/chats/${chat._id}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  setMessages(data);
  setInput("");

  // emit to socket
  if (socket) {
    socket.emit("sendMessage", {
      chatId: chat._id,
      senderId: localStorage.getItem("userId"),
      text: textToSend,
    });
  }
} catch (err) {
  console.log(err);
}

};

return (

<div className="h-screen flex flex-col bg-[#F5F7FB]">  
{/* Header */}    
  <div className="flex items-center px-4 py-2 shadow shrink-0">
    <ArrowLeft onClick={goBack} className="w-5 h-5 mr-3 cursor-pointer" />
      	<div className="relative">
        <img src={chat.avatar} className="w-12 h-12 rounded-full" />
        {chat.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
    </div>
    <h1 className="font-semibold ml-3">{chat.name}</h1>      
  </div>    
  {/* Messages */}    
  <div className="flex-[0.80] flex flex-col p-4 space-y-2 overflow-y-auto min-h-0">   
    {messages.map((msg, i) => (      
      <div      
        key={i}      
        className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${      
          msg.sender === "me"      
            ? "bg-blue-500 text-white ml-auto"      
            : "bg-gray-200"      
        }`}      
      >      
        {msg.text}      
      </div>      
    ))}      
  </div>    
  {/* Input */}
  <div className="p-3 flex gap-2  bg-[#F5F7FB] shrink-0">      
    <input      
      value={input}      
      onChange={(e) => setInput(e.target.value)}      
      className="flex-1 border rounded-xl px-3 py-3 outline-none"      
      placeholder="Type a message..."      
    />      
    <button      
      onClick={sendMessage}      
      className="bg-blue-600 text-white px-4 rounded-xl"      
    >      
      <Send className="w-5 h-5 text-white" />   
    </button>      
  </div>      
</div>  );  
}; 

/* ================= APP ================= */
export default function App() {
  const [page, setPage] = useState("messages");
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <ChatProvider>
      {page === "messages" && (
        <MessagesPage
          openChat={(chat) => {
            setSelectedChat(chat);
            setPage("chat");
          }}
          openNew={() => setPage("new")}
        />
      )}

      {page === "chat" && selectedChat && (
        <ChatPage
          chat={selectedChat}
          goBack={() => setPage("messages")}
        />
      )}
    </ChatProvider>
  );
}

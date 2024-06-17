import { GoogleGenerativeAI } from "@google/generative-ai";

const chatInput=document.querySelector("#chat-input");
const sendBtn=document.querySelector("#send-btn");
const chatContainer=document.querySelector(".chat-container");
const body=document.querySelector("body");
const themeBtn=document.querySelector("#theme-btn");
const deleteBtn=document.querySelector("#delete-btn");

let userText=null; 
const initialHeight=chatInput.scrollHeight;

const loadDataFromLocalStorage=()=>{
    const themeColor=localStorage.getItem("theme-color");
    body.classList.toggle("light-mode", themeColor==="light_mode");
    themeBtn.innerText=body.classList.contains("light-mode")?"dark_mode":"light_mode";
    const defaultText=`<div class="default-text">
    <h1>ChatGpt Clone</h1>
    <p> Start a conversation and explore the power of AI.<br>Your chat history will be displayed here.</p>
    </div>`
    chatContainer.innerHTML=localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
}

loadDataFromLocalStorage();

const createDiv=(html,className)=>{
    const chatDiv=document.createElement("div");
    chatDiv.classList.add("chat",className);
    chatDiv.innerHTML=html;
    return chatDiv;
}

const showTypingAnimation=()=>{
    const html=`<div class="chat-content">
        <div class="chat-details">
            <img src="images/chatbot.jpg" alt="chatbot-image">
            <div class="typing-animation">
                <div class="typing-dot" style="--delay:0.1s"></div>
                <div class="typing-dot" style="--delay:0.2s"></div>
                <div class="typing-dot" style="--delay:0.3s"></div>
            </div>
        </div>
        <span onclick="copyResponse(this)" class="material-symbols-outlined">content_copy</span>
    </div>`;
    const incomingChatDiv=createDiv(html,"incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    getResponse(incomingChatDiv);
}
const handleOutgoingChat=()=>{
    userText=chatInput.value.trim();
    if(!userText){
        return;
    }
    const html=`<div class="chat-content">
        <div class="chat-details">
            <img src="images/user.jpg" alt="user-image">
            <p></p>
        </div>
    </div>`;
    const outgoingChatDiv=createDiv(html,"outgoing");
    chatContainer.appendChild(outgoingChatDiv);
    outgoingChatDiv.querySelector("p").textContent=userText;
    document.querySelector(".default-text")?.remove();
    chatInput.value="";
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    setTimeout(showTypingAnimation,500);
    chatInput.style.height=`${initialHeight}px`;
}
sendBtn.addEventListener("click",handleOutgoingChat);

//ENTER YOUR GEMINI AI API KEY HERE
const API_KEY = "";
  
// Access your API key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function getResponse(incomingChatDiv) {

    const pElement=document.createElement("p");
    const prompt = userText;
    try{
        const result = await model.generateContent(prompt);
        const response = await result.response;
        pElement.textContent = response.text().trim();
    }
    catch(error){
        pElement.classList.add("error");
        pElement.textContent="Oops! Something went wrong while retrieving the response. Please try again.";
    }
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0,chatContainer.scrollHeight);
    localStorage.setItem("all-chats",chatContainer.innerHTML);
}

deleteBtn.addEventListener("click",()=>{
    if(confirm("Are you sure you wish to delete all the chats ?")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
})

const changeMode=()=>{
    body.classList.toggle("light-mode");
    localStorage.setItem("theme-color",themeBtn.innerText);
    themeBtn.innerText=body.classList.contains("light-mode")?"dark_mode":"light_mode";
}

themeBtn.addEventListener("click",changeMode);

chatInput.addEventListener("input",()=>{
    chatInput.style.height=`${initialHeight}px`;
    chatInput.style.height=`${chatInput.scrollHeight}px`;
})

chatInput.addEventListener("keydown",(e)=>{
    if(e.key==="Enter" && !e.shiftKey && window.innerWidth>800){
        e.preventDefault();
        handleOutgoingChat();
    }
})

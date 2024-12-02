

const socket = io.connect("http://localhost:3000");

const params = new URLSearchParams(window.location.search);
const userName = params.get("username");
const roomId = params.get("roomId");
window.onload = () => {
    socket.emit("newUser", userName, roomId);
};
//new User Added
socket.on("userAdded",(recivedName,count,users)=>{
    //show user added an delte after 5 sec
    let container = document.querySelector(".mainchat");
    //check if already exist
    if(!document.querySelector(`.joinmsg[joinedUser="${recivedName}"`)){
        let newUser = document.createElement("div");
    newUser.className = "joinmsg";
    newUser.setAttribute("joinedUser",recivedName);
    if(recivedName===userName){
        newUser.innerText = ` Welcome! ${recivedName}`;
    }else{
        newUser.innerText = `${recivedName}! Joined the party`;
    }
    container.appendChild(newUser);
    }
    
    

    //Add no of online Users
    let userCount = document.getElementById("count");
    userCount.innerText = count;

    //add the user to list
    let displayUser = document.querySelector(".online");
    users.map((user)=>{
        if(!document.querySelector(`.box[onlineUser="${user}"]`)){
        let userDiv = document.createElement("div");
        userDiv.setAttribute("onlineUser",user);
        userDiv.innerText = user;
        userDiv.className = "box";
        displayUser.appendChild(userDiv);
        }
    })

    


});

//on sending messages
let sendButton = document.getElementById("send");
let enteredText = document.getElementById("message");

let sendMsgDisplay = document.querySelector(".sender");

let message;

sendButton.addEventListener("click",(event)=>{
    event.preventDefault();

    //get the message
    message = enteredText.value;
    enteredText.value = "";
    //emit the message
    socket.emit("newMsg",message,roomId);
});

//on reciving message
socket.on("msgAdded",(newMsg)=>{
    console.log(newMsg);
    //main Container
    let mainContainer = document.querySelector(".mainchat");
    //msg contianer
    let msgContainer = document.createElement("div");
    if(newMsg.user === userName){
        msgContainer.className = "sender msg";
    }else{
        msgContainer.className = "reciver msg";
    }
    //set the Avater
    let newAvatar = document.createElement("div");
    newAvatar.className = "avatar";
    newAvatar.innerText = newMsg.user;
    //set time and name
    let newMessage = document.createElement("div");
    newMessage.className = "message";
    let newHeader = document.createElement("div");
    let createdAt = new Date(newMsg.createdAt);     
    let time = createdAt.toLocaleTimeString("en-US",{
        hour:'2-digit',
        minute:'2-digit',
        hour12:false
    });
    newHeader.className = "msgheader";
    newHeader.innerHTML = `<span class="head">${newMsg.user}</span> <span class="head">${time}</span>`;
    newMessage.appendChild(newHeader);
    //set msg
    let msgContent = document.createElement("div");
    msgContent.innerText = newMsg.text;
    msgContent.className = "msgContent";
    newMessage.appendChild(msgContent);
    //Add msg and avtar in msg container
    if(newMsg.user === userName){
        msgContainer.appendChild(newMessage);
        msgContainer.appendChild(newAvatar);
    }else{
        msgContainer.appendChild(newAvatar);
        msgContainer.appendChild(newMessage);
    }
    //Add whole msg to the main container
    mainContainer.appendChild(msgContainer);
    
});
//typing indicator
let typingTimeout;
let isTyping = false;
enteredText.addEventListener("input",()=>{
    socket.emit("typing",userName);
});
socket.on("userTyping",(name)=>{
    let con = document.querySelector(".header");
    const existingIndicators = con.querySelectorAll('.indicator');
    existingIndicators.forEach(indicator => indicator.remove());
    if(!document.querySelector(`.indicator[data-user="${name}"]`)){
    let indicator = document.createElement("div");
    indicator.className = "indicator";
    indicator.setAttribute("data-user",name);
    indicator.innerText = `${name} is typing...`;
    con.appendChild(indicator);
    setTimeout(()=>{
            let indicator = document.querySelector(`.indicator[data-user="${name}"]`);
    if (indicator) {
        indicator.remove(); // Remove the indicator
    }
    },5000)
    }
})
//on user leaving
socket.on("userLeft",(name,id)=>{
    let container = document.querySelector(".mainchat");
    let newUser = document.createElement("div");
    newUser.className = "joinmsg";
    newUser.textContent = `${name} has left !`;
    container.appendChild(newUser);

    //delete from 
    let delBox = document.querySelector(`.box[onlineUser="${name}"]`)
    delBox.remove();
    //reduce te online user count
    let ele = document.querySelector("#count");
    let count  = ele.textContent;
    ele.textContent = count-1;
})
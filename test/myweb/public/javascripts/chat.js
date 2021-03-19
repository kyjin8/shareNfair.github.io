const socket = io();

const nickname = document.querySelector('#nickname');
const chatList = document.querySelector('.chatting-list');
const chatInput = document.querySelector('.chatting-input');
const sendButton = document.querySelector('.send-button');
const displayContainer = document.querySelector(".display-container");
const postuser = document.querySelector('#postuser');
const dealuser = document.querySelector('#dealuser');
const postid = document.querySelector('#postid');
const listNo = document.querySelector('#listNo');
const postuser_img = document.querySelector('#postuser_img');
const dealuser_img = document.querySelector('#dealuser_img');

console.log('listNo', listNo.value);
socket.emit('joinroom', {room: listNo.value});
socket.on('joinroom', (data) => {
    console.log('room 입장!');
})

const ifconnected = {
    name: nickname.value,
    postuser: postuser.value,
    dealuser: dealuser.value, 
    postid: postid.value
}
socket.emit('recording', ifconnected)

socket.on('recording', (data) => {
    const {chat_record, pu_connected, du_connected} = data;
    console.log('채팅기록 & 접속아이디', chat_record[0], nickname.value);
    if(chat_record != undefined) {
        if((nickname.value == postuser.value && pu_connected == 1) || (nickname.value == dealuser.value && du_connected == 1)){
            for (let i = 0; i< chat_record.length; i++) {
                const record = new dbModel(chat_record, i);
                record.importDB();
                displayContainer.scrollTo(0,displayContainer.scrollHeight);
            }
        }
    }
})

function dbModel(chat_record, i){
    this.chat_record = chat_record;
    this.i = i;

    this.importDB = () => {
        const li = document.createElement('li');
        let dom;
        if (nickname.value == postuser.value) { //게시물작성자 로그인 시
            li.classList.add(chat_record[i].sender == postuser.value ? "sent" : "received");
            if (postuser_img.value && chat_record[i].sender == postuser.value){    //게시물작성자 이미지가 있고 sent면 
                dom = `<span class="profile">
                <span class="user">${chat_record[i].sender}</span>
                <img class="image" src="/images/uploaded/`+postuser_img.value+`">
                </span>
                <span class="message">${chat_record[i].chat_context}</span>
                <span class="time">${chat_record[i].chat_created}</span>`;
            } else if(dealuser_img.value && chat_record[i].sender == dealuser.value) {  //구매희망자 이미지가 있고 received면
                dom = `<span class="profile">
                <span class="user">${chat_record[i].sender}</span>
                <img class="image" src="/images/uploaded/`+dealuser_img.value+`">
                </span>
                <span class="message">${chat_record[i].chat_context}</span>
                <span class="time">${chat_record[i].chat_created}</span>`;
            } else {
                dom = `<span class="profile">
                <span class="user">${chat_record[i].sender}</span>
                <img class="image" src="/images/default_image.PNG">
                </span>
                <span class="message">${chat_record[i].chat_context}</span>
                <span class="time">${chat_record[i].chat_created}</span>`;
            }
        } else if (nickname.value == dealuser.value) {  //구매희망자 로그인 시
            // console.log('게시글작성자 이미지 :', postuser_img.value);
            li.classList.add(chat_record[i].sender == dealuser.value ? "sent" : "received");
            if (dealuser_img.value && chat_record[i].sender == dealuser.value){ //구매희망자 이미지 있고 sent면
                dom = `<span class="profile">
                <span class="user">${chat_record[i].sender}</span>
                <img class="image" src="/images/uploaded/`+dealuser_img.value+`">
                </span>
                <span class="message">${chat_record[i].chat_context}</span>
                <span class="time">${chat_record[i].chat_created}</span>`;
            } else if(postuser_img.value && chat_record[i].sender == postuser.value) {  //게시물작성자 이미지가 있고 received면
                dom = `<span class="profile">
                <span class="user">${chat_record[i].sender}</span>
                <img class="image" src="/images/uploaded/`+postuser_img.value+`">
                </span>
                <span class="message">${chat_record[i].chat_context}</span>
                <span class="time">${chat_record[i].chat_created}</span>`;
            } else {
                dom = `<span class="profile">
                <span class="user">${chat_record[i].sender}</span>
                <img class="image" src="/images/default_image.PNG">
                </span>
                <span class="message">${chat_record[i].chat_context}</span>
                <span class="time">${chat_record[i].chat_created}</span>`;
            }
        }
            li.innerHTML = dom;
            chatList.appendChild(li);
    }
}

// 엔터
chatInput.addEventListener('keypress',(e)=>{
    if(e.keyCode == 13 ){
        send();
    }
})

function send() {
    const param = {
        name: nickname.value,
        msg: chatInput.value,
        time: new Date()
    };
    socket.emit("chatting", param);
    chatInput.value = '';
}
// 전송버튼
sendButton.addEventListener('click', () => {
    const param = {
        name: nickname.value,
        msg: chatInput.value,
        time: new Date()
    }
    socket.emit("chatting", param);
    chatInput.value = '';
})

socket.on('chatting', (data) => {
    console.log('여기', data);
    const { name, msg, time } = data;
    const item = new LiModel(name, msg, time);
    item.makeLi();
    displayContainer.scrollTo(0,displayContainer.scrollHeight);
})

function LiModel(name, msg, time){
    this.name = name;
    this.msg = msg;
    this.time = time;

    this.makeLi = () => {
        const li = document.createElement('li');
        let dom;
        li.classList.add(nickname.value === this.name ? "sent" : "received")
        if (nickname.value == postuser.value){
            if (postuser_img.value && this.name == postuser.value){
                dom = `<span class="profile">
                <span class="user">${this.name}</span>
                <img class="image" src="/images/uploaded/`+postuser_img.value+`">
                </span>
                <span class="message">${this.msg}</span>
                <span class="time">${this.time}</span>`;
            } else if(dealuser_img.value && this.name == dealuser.value) {  //구매희망자 이미지가 있고 received면
                dom = `<span class="profile">
                <span class="user">${this.name}</span>
                <img class="image" src="/images/uploaded/`+dealuser_img.value+`">
                </span>
                <span class="message">${this.msg}</span>
                <span class="time">${this.time}</span>`;
            } else {
                dom = `<span class="profile">
                <span class="user">${this.name}</span>
                <img class="image" src="/images/default_image.PNG">
                </span>
                <span class="message">${this.msg}</span>
                <span class="time">${this.time}</span>`;
            }
        } else if (nickname.value == dealuser.value){
            if (dealuser_img.value && this.name == dealuser.value){
                dom = `<span class="profile">
                <span class="user">${this.name}</span>
                <img class="image" src="/images/uploaded/`+dealuser_img.value+`">
                </span>
                <span class="message">${this.msg}</span>
                <span class="time">${this.time}</span>`;
            } else if(postuser_img.value && this.name == postuser.value) {  //게시물작성자 이미지가 있고 received면
                dom = `<span class="profile">
                <span class="user">${this.name}</span>
                <img class="image" src="/images/uploaded/`+postuser_img.value+`">
                </span>
                <span class="message">${this.msg}</span>
                <span class="time">${this.time}</span>`;
            } else {
                dom = `<span class="profile">
                <span class="user">${this.name}</span>
                <img class="image" src="/images/default_image.PNG">
                </span>
                <span class="message">${this.msg}</span>
                <span class="time">${this.time}</span>`;
            }
        }
        li.innerHTML = dom;
        chatList.appendChild(li);
        let param = {};
        if(nickname.value === this.name) {
            param = {
                name,
                msg,
                time,
                postuser: postuser.value,
                dealuser: dealuser.value, 
                postid: postid.value
            }
            socket.emit("process", param);
        }
    }
}

console.log('소켓', socket);
import store from "../store";
import {
    SENDER_STAFF,
    TYPE_TEXT,
} from "../config/constants"

export default class Msg {
    constructor({
        msgId="",
        createTime=0,
        sender=SENDER_STAFF,
        msgType=TYPE_TEXT,
        chatType=store.state.chat.chatType,
        content="",
        staffName=store.state.chat.staffName,
        staffAvatar=require("../assets/images/user_default.png"),
        speechSrc="",
        speechDur=0,
        blobSpeechSrc="",
        fileUrl="",
        isSocketSendSuccess=false,
        httpUploadingProgress=0
    }) {
        this.msgId = msgId;
        this.createTime = createTime;
        this.sender = sender;
        this.msgType = msgType;
        this.chatType = chatType;
        this.content = content;
        this.staffName = staffName;
        this.staffAvatar = staffAvatar;
        this.speechSrc = speechSrc;
        this.speechDur = speechDur;
        this.blobSpeechSrc = blobSpeechSrc;
        this.fileUrl = fileUrl;
        this.isSocketSendSuccess = isSocketSendSuccess;
        this.httpUploadingProgress = httpUploadingProgress;
        // console.log("store",store);
    }
}
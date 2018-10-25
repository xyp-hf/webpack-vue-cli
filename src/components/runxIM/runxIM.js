import chat from "../chat";
import prompt from "../prompt";
import comment from "../comment";
import webSocketService from "../../services/socket.serv";
import storageService from "../../services/storage.serv";
import bus from "../../services/bus.serv";
import utils from "../../utils";
import getDomain from "../../config/env";
import Msg from "../../config/Msg";
import {
  COMMAND_CHAT_REQ,
  COMMAND_CHAT_RESP,
  COMMAND_HEARTBEAT_REQ,
  COMMAND_USER_ACCESS,
  COMMAND_USER_BUSY,
  COMMAND_USER_OFFLINE,
  COMMAND_QUEUE_INFORM,
  SENDER_STAFF,
  SENDER_CUST,
  SENDER_SYSTEM,
  SENDER_HINT,
  TYPE_TEXT,
  TYPE_IMG,
  TYPE_SPEECH,
  TYPE_VIDEO,
  TYPE_FILE,
} from "../../config/constants";

export default {
  components: {
    chat,
    prompt,
    comment,
  },
  data() {
    return {
      heartBeatInterval: 30000,
      socket: null,
      heartBeatTimer: 0,
      custHintTimer: 0,
      staffHintTimer: 0,
      endHintTimer: 0,
      pastTimeTimer: 0,
      shouldShowCustHint: false,
      shouldShowStaffHint: false,
      shouldShowEndHint: false,
      pastTime: 0,
      calLocalTime: "",
      offsetTime: 0,
      staffChangeCount: 0,
    };
  },
  computed: {
    businessCode() {
      const queryString = window.location.search;
      if (!queryString || queryString.indexOf("businessCode") === -1) {
        alert("没有businesscode！请检查url查询字符串");
        return;
      }
      return queryString
        .substring(1, queryString.length)
        .split("&")
        .filter(str => str.indexOf("businessCode") !== -1)[0]
        .split("=")[1];
    },
    token() {
      return this.$store.state.runxIM.token;
    },
    hint() {
      const hint = this.$store.state.runxIM.hint;
      if (!hint) {
        return {};
      }
      const res = {};
      hint.forEach(item => {
        res[item.type] = {
          enabledStatus: item.enabledStatus,
          timeout: item.timeout * 60 * 1000,
          // timeout: item.timeout * 1000,
          hintText: item.hintText,
        }
      });
      return res;
    },
    createTime() {
      return this.$store.state.runxIM.createTime;
    },
    msgList() {
      return this.$store.state.chat.msgList;
    },
    chatType() {
      return this.$store.state.runxIM.chatType;
    },
    inputCount() {
      return this.$store.state.chat.inputCount;
    },
    servType() {
      return this.$store.state.runxIM.servType;
    },
    curSendingMsgType() {
      return this.$store.state.chat.curSendingMsgType;
    },
    curSpeechSrc() {
      return this.$store.state.chat.curSpeechSrc;
    },
    curSpeechXUrl() {
      return this.$store.state.chat.curSpeechXUrl;
    },
    curSpeechDur() {
      return this.$store.state.chat.curSpeechDur;
    },
    curSentFileUrl() {
      return this.$store.state.chat.curSentFileUrl;
    }, 
    curQuestionPage() {
      return this.$store.state.chat.curQuestionPage;
    },
    questionPageSize() {
      return this.$store.state.chat.questionPageSize;
    },
    isSendingFile() {
      return this.$store.state.chat.isSendingFile;
    },
  },
  methods: {
    fetchToken() {
      const history = storageService.getHistoryToken() || "";
      return this.$store.dispatch("FETCH_TOKEN", {
        businessCode: this.businessCode,
        history,
      });
    },
    fetchHint() {
      return this.$store.dispatch("FETCH_HINT");
    },
    async fetchQueryTypes() {
      try {
        const res = await this.$store.dispatch("FETCH_QUERY_TYPES");
        const { data } = res.data;
        this.$store.commit("SET_QUERY_TYPE_TREE_LIST", data);
        this.$store.commit("SET_PARENT_TYPE_ID", data[0].id);
        this.$store.commit("SET_CHILD_TYPE_ID", data[0].children === null ? "" : data[0].children[0].id);
      } catch (err) {
        console.log("fetchQueryTypes", err);
      }
    },
    async fetchKnowledgeQustions() {
      try {
        await this.$store.dispatch("FETCH_KNOWLEDGE_QUESTIONS", {
          currentPage: this.curQuestionPage,
          pageSize: this.questionPageSize,
        });
      } catch(err) {
        console.error(err);
      }
    },
    async initSocket() {
      this.$store.commit("SET_SOCKET", null);
      try {
        await this.fetchToken();
        this.fetchKnowledgeQustions();
        this.fetchQueryTypes();
        storageService.setHistoryToken(this.token);
        bus.$on("OPEN_SOCKET", ({parentTypeId, childTypeId}) => {
          // const workTypeId = childTypeId === "" ? parentTypeId : childTypeId;
          const workTypeId = childTypeId || parentTypeId;
          const url = `wss://${getDomain()}im-gateway.runx.vip/ws?token=${encodeURIComponent(
            encodeURIComponent(this.token)
          )}&workTypeId=${workTypeId}`;
          this.socket = new webSocketService(url);
          this.socket.onopen(this.sendHeartBeat);
          this.socket.onmessage(this.receiveMsg);
          this.socket.onerror(this.onsocketerror);
          this.socket.onclose(this.onsocketclose);
          this.$store.commit("SET_SOCKET", this.socket);
          this.$store.commit("SET_IS_SHOW_ROBOT", false);
          this.$store.commit("SET_IS_SHOW_COMMENT_BTN", true);
        });
      } catch (err) {
        console.log("fetchToken", err);
        alert("ws建立失败！");
      };
    },
    sendHeartBeat() {
      const heartBeat = JSON.stringify({
        cmd: COMMAND_HEARTBEAT_REQ,
        hbbyte: -127
      });
      this.socket.send(heartBeat);
      this.heartBeatTimer = setInterval(() => {
        this.socket.send(heartBeat);
      }, this.heartBeatInterval);
    },
    onsocketerror(err) {
      console.error("websocket has error!");
      console.error(err);
    },
    onsocketclose() {
      console.warn("ws连接断开");
      clearInterval(this.heartBeatTimer);
      clearInterval(this.custHintTimer);
      clearInterval(this.staffHintTimer);
      clearInterval(this.endHintTimer);
      this.$store.commit("SET_MSG_LIST", new Msg({
        sender: SENDER_SYSTEM,
        content: "连接超时，通话已中断",
      }));
      this.scrollToBottom();
      storageService.setHistory(this.msgList);
    },
    // 后台刷新 - 前台onclose
    // 后台取消对话 - 前台onclose
    // 后台没有登陆 - 前台23
    receiveMsg(ev) {
      const { data } = ev;
      const dataObj = JSON.parse(data);
      const { command } = dataObj;
      const info = dataObj.data;
      if (command !== COMMAND_HEARTBEAT_REQ) {
        console.group("info");
        console.log(ev);
        console.log(dataObj);
        console.groupEnd();
      }
      switch (command) {
        case COMMAND_USER_ACCESS: //21 成功接入
          this.handleAccess(info);
          break;
        case COMMAND_CHAT_REQ: //11 接收到对方聊天响应处理
          this.handleStaffMsg(info);
          break;
        case COMMAND_CHAT_RESP: //12 自己发的消息成功被服务器接收了
          this.handleCustMsg(info);
          break;
        case COMMAND_USER_OFFLINE: //22 客服下线
          this.handleStaffOffline(info);
          break;
        case COMMAND_USER_BUSY: //23 客服忙
          this.handleStaffBusy(info);
          break;
        case COMMAND_QUEUE_INFORM: //29 排队通知
          this.handleQueueInform(info);
        default:
          break;
      }
    },
    handleAccess(info) {
      console.warn("cmd: 21, 成功接入后台");
      const { chatType, content, from, msgType, to, createTime, extras, msgId } = info;
      const {
        userStatus,
        custType,
        sessionId,
        userAvatarUrl,
        userName,
        custName,
        custAvatarUrl
      } = extras;
      console.log(extras);
      
      // this.$store.commit("SET_PROMPT_DISPLAY", false);
      // this.$store.commit("SET_CHAT_DISPLAY", true);


      if(this.staffChangeCount > 0) {
        this.$store.commit("SET_MSG_LIST", new Msg({
          msgId,
          createTime,
          sender: SENDER_HINT,
          content: `已为您转接至客服${userName}`,
        }))
      }
      this.staffChangeCount++;

      this.$store.commit("SET_ONLINE_STATUS", true);
      this.$store.commit("SET_CUST_ID", to);
      this.$store.commit("SET_CUST_NAME", custName);
      this.$store.commit("SET_CUST_AVATAR", custAvatarUrl);
      this.$store.commit("SET_STAFF_ID", from);
      this.$store.commit("SET_STAFF_NAME", userName);
      this.$store.commit("SET_STAFF_AVATAR", userAvatarUrl);
      this.$store.commit("SET_SESSION_ID", sessionId);
      this.$store.commit("SET_CHAT_TYPE", chatType);
      this.$store.commit("SET_CREATE_TIME", createTime);

      // 存储下服务器时间和本地时间的误差
      this.offsetTime = createTime - Date.now();

      // 聊天的第一条内容是时间显示
      this.$store.commit("SET_MSG_LIST", new Msg({
        sender: SENDER_SYSTEM,
        content:utils.parseFullTime(createTime),
      }));
      // 聊天的第二条内容是系统自动设定的问候语
      this.$store.commit("SET_MSG_LIST", new Msg({
        createTime,
        content,
      }));
      // 启动自动记时的定时器，用来根据服务器传来的时间生成实时的时间（Date.now()与服务器时间会有误差)
      // 获取后台设置好的hint，按照需求启动定时检测的定时器
      this.fetchHint().then(() => {
        if (this.hint.hintCustTimeout) {
          this.startCustHintTimer();
        }
        if (this.hint.hintCustTimeoutExit) {
          this.startEndHintTimer();
        }
        // 9.6 可能有坑
        if (this.hint.hintUserTimeout) {
          this.startStaffHintTimer();
          this.shouldShowStaffHint = false;
          clearInterval(this.staffHintTimer);
          // 最后一句是客服发出去的，就不要催客服了，只催客户
          clearInterval(this.custHintTimer);
          this.startCustHintTimer();
        }
      }).catch(err => {
          console.log("fetchHint", err);
      });
      // 9.6 可能有坑
      // // 告诉系统，客服回话了，赶紧把客服长久不回话的致歉倒计时给掐了
      // if (this.hint.hintUserTimeout) {
      //   this.shouldShowStaffHint = false;
      //   clearInterval(this.staffHintTimer);
      //   // 最后一句是客服发出去的，就不要催客服了，只催客户
      //   clearInterval(this.custHintTimer);
      //   this.startCustHintTimer();
      // }
      this.scrollToBottom();
    },

    handleStaffMsg(info) {
      console.warn("cmd: 11, 接收到对方聊天响应处理");
      const { chatType, content, from, msgType, to, extras, createTime, msgId } = info;
      // const playTime = { extras };
      const {playTime, fileName} = extras;
      this.$store.commit("SET_MSG_LIST", new Msg({
        msgId,
        createTime,
        msgType,
        content: msgType == TYPE_FILE ? fileName : content,
        speechSrc: msgType == TYPE_SPEECH ? content : "",
        fileUrl: (msgType == TYPE_IMG || msgType == TYPE_FILE) ? content : "",
        speechDur: playTime || 0,
      }));
      // 告诉系统，客服回话了，赶紧把客服长久不回话的致歉倒计时给掐了
      if (this.hint.hintUserTimeout) {
        clearInterval(this.staffHintTimer);
        this.shouldShowStaffHint = false;
        // 最后一句是客服发出去的，就不要催客服了，只催客户
        clearInterval(this.custHintTimer);
        this.shouldShowCustHint = false;
        this.startCustHintTimer();
      }
      if (this.hint.hintCustTimeoutExit) {
        clearInterval(this.endHintTimer);
        this.shouldShowEndHint = false;
        this.startEndHintTimer();
      }
      this.scrollToBottom();
    },
    handleCustMsg(info) {
      console.warn("cmd: 12, 自己发的消息成功被服务器接收了");
      const { clientMark, msgId } = info;
      this.msgList.forEach(msg => {
        if(msg.createTime == clientMark) {
          msg.msgId = msgId;
          setTimeout(() => {  
            msg.isSocketSendSuccess = true;
          }, 200);
        }
      });

      // 告诉系统，客户回话了，赶紧把客户长久不回话的提醒倒计时给掐了
      if (this.hint.hintCustTimeout) {
        this.shouldShowCustHint = false;
        clearInterval(this.custHintTimer);
        // 最后一句是客户自己发出去的，就不要催客户了，只催客服
        clearInterval(this.staffHintTimer);
        this.startStaffHintTimer();
      }
      // 告诉系统，客户回话了，赶紧把客户更长久不回话的强制下线倒计时给掐了
      if (this.hint.hintCustTimeoutExit) {
        clearInterval(this.endHintTimer);
        this.shouldShowEndHint = false;
        this.startEndHintTimer();
      }
      // if (this.hint.hintCustTimeoutExit) {
      //   this.shouldShowEndHint = false;
      //   clearInterval(this.endHintTimer);
      // }
      this.scrollToBottom();
      this.clearInput();
    },
    handleStaffOffline(info) {
      console.warn("cmd: 22, 客服不在工作时间");
      // this.$store.commit("SET_PROMPT_DISPLAY", true);
      // this.$store.commit("SET_PROMPT_TYPE", 0);
      // this.$store.commit("SET_CHAT_DISPLAY", false);
      // // 把工单页面打开
      this.$store.commit("SET_IS_SHOW_COMMENT_MODAL", true);
      this.$store.commit("SET_CHAT_DISPLAY", false);
    },
    handleStaffBusy(info) {
      console.warn("cmd: 23, 客服忙");
      const { content } = info;
      this.$store.commit("SET_BUSY_MSG", content);
      this.$store.commit("SET_PROMPT_DISPLAY", true);
      this.$store.commit("SET_PROMPT_TYPE", 2);
      this.$store.commit("SET_CHAT_DISPLAY", false);

      
      // this.$store.commit("SET_IS_SHOW_COMMENT_MODAL", true);
      // this.$store.commit("SET_CHAT_DISPLAY", false);
    },
    handleQueueInform(info) {
      console.warn("cmd: 29, 排队队列更新");
    },
    scrollToBottom() {
      const wrap = document.querySelector(".chat_main");
      setTimeout(() => {
        wrap.scrollTop = wrap.scrollHeight;
      }, 10);
    },
    clearInput() {
      document.querySelector(".chat_input").innerText = "";
    },
    // 如果在特定的时间范围内(timeout字段)没有收到来自客户的消息，就给客户发送这句提示语
    startCustHintTimer() {
      this.custHintTimer = setInterval(() => {
        if (this.shouldShowCustHint) {
          this.$store.commit("SET_MSG_LIST", new Msg({
            sender: SENDER_SYSTEM,
            content: utils.parseFullTime(Date.now() + this.offsetTime),
          }));
          this.$store.commit("SET_MSG_LIST", new Msg({
            sender: SENDER_HINT,
            content: this.hint.hintCustTimeout.hintText,
          }));
          this.scrollToBottom();
        }
      }, this.hint.hintCustTimeout.timeout);
      this.shouldShowCustHint = true;
    },
    // 如果在特定的时间范围内(timeout字段)没有收到来自客服的消息，就给客户发送这句致歉语
    startStaffHintTimer() {
      this.staffHintTimer = setInterval(() => {
        if (this.shouldShowStaffHint) {
          this.$store.commit("SET_MSG_LIST", new Msg({
            sender: SENDER_SYSTEM,
            content: utils.parseFullTime(Date.now() + this.offsetTime),
          }));
          this.$store.commit("SET_MSG_LIST", new Msg({
            sender: SENDER_HINT,
            content: this.hint.hintUserTimeout.hintText,
          }));
          this.scrollToBottom();
        }
      }, this.hint.hintUserTimeout.timeout);
      this.shouldShowStaffHint = true;
    },
    // 如果在更长的特定的时间范围(timeout字段)没有发送消息，就自动帮他断开
    startEndHintTimer() {
      this.endHintTimer = setInterval(() => {
        if (this.shouldShowEndHint) {
          this.$store.commit("SET_MSG_LIST", new Msg({
            sender: SENDER_SYSTEM,
            content: utils.parseFullTime(Date.now() + this.offsetTime),
          }));
          this.$store.commit("SET_MSG_LIST", new Msg({
            sender: SENDER_HINT,
            content: this.hint.hintCustTimeoutExit.hintText,
          }));
          this.scrollToBottom();
          clearInterval(this.heartBeatTimer);
          clearInterval(this.custHintTimer);
          clearInterval(this.staffHintTimer);
          clearInterval(this.endHintTimer);
          this.socket.close();
        }
      }, this.hint.hintCustTimeoutExit.timeout);
      this.shouldShowEndHint = true;
    },
  },
  mounted() {
    this.initSocket();
    document.ondblclick = () => {
      console.log(this.$store.state.chat.msgList);
    }
  }
};

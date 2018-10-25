import chatBubble from "../chatBubble";
import bus from "../../services/bus.serv";
import Msg from "../../config/Msg";
import "../../assets/js/recorder.js";
import { 
  COMMAND_CHAT_REQ, 
  SENDER_STAFF,
  SENDER_CUST,
  SENDER_SYSTEM,
  SENDER_HINT,
  TYPE_TEXT,
  TYPE_IMG,
  TYPE_SPEECH,
  TYPE_VIDEO,
  TYPE_FILE
} from "../../config/constants/index";
import storageService from "../../services/storage.serv";
import emojis from "../../assets/emojis/emoji.json";

export default {
  components: {
    chatBubble,
  },
  data() {
    return {
      isShowCloseModal: false,
      isShowSelectModal: false,
      isShowScoreModal: false,

      isShowHistory: false,
      isShowEmojis: false,
      isChatInputFocus: false,
      curSendingFileUrl: "",
      // isMsgFile: false,
      isExceed: false,
      content: "",
      emojis,
      // inputCount: 0,
      inputLimit: 200,
      speechXurl: "",

      // parentTypeId: "",
      // childTypeId: "",

      selectedParentTypeIndex: 0,
      imgAndVideoList: [],
      rec: Recorder(),
      isShowRecorder: false,
      isStartRecord: false,
      // barList: [],
      speechSrc: "",
      startTime: 0,
      endTime: 0,
      minTime: 5000,
      maxTime: 60000,
      minWidth: 100,
      maxWidth: 300,
      mockImgSrc: "",
      curSendingImg: null,
      curSendingMp3: null,
      curSendingFile: null,
      curSendingVideo: null,
      acivedStarIndex: 4,
      starList: [
        {
          src: require("../../assets/images/star_actived.png"),
          hint: "差，非常不满意"
        },
        {
          src: require("../../assets/images/star_actived.png"),
          hint: "较差，不满意"
        },
        {
          src: require("../../assets/images/star_actived.png"),
          hint: "一般，基本满意"
        },
        {
          src: require("../../assets/images/star_actived.png"),
          hint: "好，比较满意"
        },
        {
          src: require("../../assets/images/star_actived.png"),
          hint: "很好，非常满意"
        }
      ]
    };
  },
  computed: {
    isUploadFileSuccess() {
      return this.$store.state.chat.isUploadFileSuccess;
    },
    isSocketSendFileSucceess() {
      return this.$store.state.chat.isSocketSendFileSucceess;
    },
    upLoadingProcessBarWidth() {
      return this.$store.state.chat.upLoadingProcessBarWidth;
    },
    parentTypeId() {
      return this.$store.state.runxIM.parentTypeId;
    },
    childTypeId() {
      return this.$store.state.runxIM.childTypeId;
    },
    // curSendingMsgType() {
    //   return this.$store.state.chat.curSendingMsgType;
    // },
    isSendingFile() {
      return this.$store.state.chat.isSendingFile;
    },
    curSpeechXUrl() {
      return this.$store.state.chat.curSpeechXUrl;
    },
    isShowCommentModal() {
      return this.$store.state.chat.isShowCommentModal;
    },
    isShowCommentBtn() {
      return this.$store.state.chat.isShowCommentBtn;
    },
    isShowRobot() {
      return this.$store.state.chat.isShowRobot;
    },
    inputCount() {
      return this.$store.state.chat.inputCount;
    },
    chatType() {
      return this.$store.state.runxIM.chatType;
    },
    msgList() {
      return this.$store.state.chat.msgList;
    },
    historyList() {
      return this.$store.state.chat.historyList;
    },
    staffName() {
      return this.$store.state.chat.staffName;
    },
    staffAvatar() {
      return (
        this.$store.state.chat.staffAvatar ||
        require("../../assets/images/user_default.png")
      );
    },
    socket() {
      return this.$store.state.chat.socket;
    },
    isShowChat() {
      return this.$store.state.chat.isShowChat;
    },
    isOnline() {
      return this.$store.state.runxIM.isOnline;
    },
    chatType() {
      return this.$store.state.runxIM.chatType;
    },
    questionList() {
      return this.$store.state.chat.questionList;
    },
    curQuestionPage() {
      return this.$store.state.chat.curQuestionPage;
    },
    questionPageSize() {
      return this.$store.state.chat.questionPageSize;
    },
    queryTypeTreeList() {
      return this.$store.state.runxIM.queryTypeTreeList;
    }
  },
  methods: {
    closeChat() {
      this.isShowCloseModal = false;
      this.socket && this.socket.close();
      this.$store.commit("SET_CHAT_DISPLAY", false);
      this.$store.commit("SET_RUNX_IM_DISPLAY", false);
      this.$store.commit("SET_IS_SHOW_ROBOT", true);
      this.$store.commit("SET_IS_SHOW_COMMENT_BTN", false);
    },
    loadHistory() {
      this.isShowHistory = true;
    },
    getHistoryFromLocalStorage() {
      const historyList =
        storageService.getHistory() === null
          ? []
          : JSON.parse(storageService.getHistory()).map(history => history);
      this.$store.commit("SET_HISTORY_LIST", historyList);
    },
    saveHistoryIntoLocalStorage() {
      window.addEventListener("beforeunload", () => {
        storageService.setHistory(this.msgList);
      });
    },
    scrollToBottom() {
      const wrap = document.querySelector(".chat_main");
      setTimeout(() => {
        wrap.scrollTop = wrap.scrollHeight;
      }, 10);
    },
    addEmoji(emoji) {
      // 文本顺序，节点计算有坑，todo createTextNode有坑
      // const str = document.createTextNode(emoji);
      // this.$refs.chatInput.appendChild(str);
      this.$refs.chatInput.insertAdjacentText("beforeend", emoji);
      this.$store.commit("SET_INPUT_COUNT", this.inputCount + 2);
    },
    handleContentChange() {
      const length = this.$refs.chatInput.innerText.length;
      this.isExceed = length > this.inputLimit ? true : false;
      this.$store.commit("SET_INPUT_COUNT", length);
    },
    async handlePageQuestion() {
      this.$store.commit("SET_CUR_QUESTION_PAGE");
      try {
        await this.$store.dispatch("FETCH_KNOWLEDGE_QUESTIONS", {
          currentPage: this.curQuestionPage,
          pageSize: this.questionPageSize
        });
      } catch (err) {
        console.error(err);
      }
    },
    accessWebsocket() {
      this.isShowSelectModal = false;
      this.$store.commit("CLEAR_MSG_LIST");
      bus.$emit("OPEN_SOCKET", {
        parentTypeId: this.parentTypeId,
        childTypeId: this.childTypeId
      });
    },
    showCommentModal() {
      this.$store.commit("SET_IS_SHOW_COMMENT_MODAL", true);
      this.$store.commit("SET_CHAT_DISPLAY", false);
    },
    getSpeechBarWidth(speechDur) {
      if (speechDur < this.minTime) {
        return this.minWidth;
      }
      if (speechDur > this.maxTime) {
        return this.maxWidth;
      }
      return parseInt(
        this.minWidth +
          (speechDur / 1000) *
            ((this.maxWidth - this.minWidth) /
              ((this.maxTime - this.minTime) / 1000))
      );
    },
    handleInputFocus() {
      this.isShowEmojis = false;
      this.isChatInputFocus = true;
    },
    closeScoreModal() {
      this.isShowScoreModal = false;
      this.isShowCloseModal = true;
    },
    async submitScore() {
      try {
        const res = await this.$store.dispatch("UPLOAD_SCORE", {
          id: this.$store.state.chat.sessionId,
          evaluateContent: this.starList[this.acivedStarIndex].hint,
          evaluateResult: this.acivedStarIndex + 1 + "",
          evaluateFlag: ""
        });
        alert("评价成功！");
      } catch (err) {
        alert("评价上传失败！");
      }
    },
    confirmScore(index) {
      this.acivedStarIndex = index;
      this.starList = this.starList.map((star, i) => {
        return {
          ...star,
          src: require(`../../assets/images/star${
            i <= index ? "_actived" : ""
          }.png`)
        };
      });
    },
    async submitQuestion(id, questionName) {
      try {
        const res = await this.$store.dispatch("FETCH_KONWLEDGE_ANSWER", id);
        const { answer } = res.data.data;
        this.$store.commit("SET_MSG_LIST", new Msg({
          createTime: Date.now(),
          sender: SENDER_CUST,
          content: questionName,
          isSocketSendSuccess: true
        }));
        this.scrollToBottom();
        setTimeout(() => {
          this.$store.commit("SET_MSG_LIST", new Msg({
            createTime: Date.now(),
            content: answer,
          }));
          this.scrollToBottom();
        }, 500);
      } catch (err) {
        console.log("fetchAnswer", err);
      }
    },
    selectParentType($event) {
      const select = $event.target;
      this.selectedParentTypeIndex = select.selectedIndex;
      const curSelectedParent = this.queryTypeTreeList[select.selectedIndex];
      const parentTypeId = curSelectedParent.id;
      this.$store.commit("SET_PARENT_TYPE_ID", parentTypeId);
      this.$store.commit(
        "SET_CHILD_TYPE_ID",
        curSelectedParent.children === null
          ? ""
          : curSelectedParent.children[0].id
      );
    },
    selectChildType($event) {
      const select = $event.target;
      const childTypeId = this.queryTypeTreeList[this.selectedParentTypeIndex]
        .children[select.selectedIndex].id;
      this.$store.commit("SET_CHILD_TYPE_ID", childTypeId);
    },
    // ---------- 以下为发送文字/图片/语音/视频/文件的逻辑代码 -------
    // 
    showRecorder() {
      this.isShowRecorder = true;
    },
    // 开始录音
    startRecord() {
      this.rec.open(() => {
        this.rec.start();
        this.startTime = Date.now();
        this.isStartRecord = true;
      }, () => {
        // console.log("aaa")
        this.$store.commit("SET_MSG_LIST", new Msg({
          sender: SENDER_SYSTEM,
          content: "请确定麦克风正常工作！"
        }));
        this.scrollToBottom();
      });
    },
    cancelRecord() {
      this.isShowRecorder = false;
      if(this.isStartRecord) {
        this.rec.stop(_mp3Blob => {
          this.startTime = 0;
          this.endTime = 0;
          this.rec.close();
        });
      }
      this.isStartRecord = false;
    },
    // 结束录音
    endRecord() {
      this.isStartRecord = false;
      this.rec.stop(mp3Blob => {
        this.speechSrc = URL.createObjectURL(mp3Blob);
        this.endTime = Date.now();
        const dur = this.endTime - this.startTime;
        // 生成mp3文件对象
        const curSendingMp3 = new FormData();
        curSendingMp3.append("file", mp3Blob);
        curSendingMp3.append("type", 2);
        curSendingMp3.append("playTime", dur);
        const createTime = Date.now();
        this.$store.commit("SET_MSG_LIST", new Msg({
          createTime,
          sender: SENDER_CUST,
          msgType: TYPE_SPEECH,
          blobSpeechSrc: this.speechSrc,
          speechDur: dur,
        }));
        this.scrollToBottom();
        this.$store.dispatch("UPLOAD_CHAT_FILE", {
          file: curSendingMp3,
          createTime,
        }).then(res => {
          const xurl = res.data.data.xurl;
          this.msgList.forEach(msg => {
            if(msg.createTime === createTime) {
              msg.speechSrc = xurl;
            }
          });
          this.socket.send(
            JSON.stringify({
              cmd: COMMAND_CHAT_REQ,
              from: this.$store.state.chat.custId,
              to: this.$store.state.chat.staffId,
              createTime,
              chatType: this.$store.state.chat.chatType,
              msgType: TYPE_SPEECH,
              content: xurl,
              extras: {
                custType: 0,
                sessionId: this.$store.state.chat.sessionId,
                clientMark: createTime,
              }
            })
          );
        });
        this.rec.close(); //释放录音资源
      });
    },

    uploadFile() {
      const uploadFileBtn = this.$refs.uploadFileBtn;
      uploadFileBtn.click();
      uploadFileBtn.onchange = async ev => {
        const filePayload = ev.target.files[0];
        const fileName = filePayload.name;
        const regImg = /^.+\.(jpg|png|bmp|gif)$/;
        const regVideo = /^.+\.(mp4|avi|flv)$/;
        if (regImg.test(fileName)) {// 发图片，需要在输入框里暂存
          // 生成文件对象
          let fileObj = new FormData();
          fileObj.append("file", filePayload);
          fileObj.append("type", TYPE_IMG);
          // 生成缩略图
          const fileReader = new FileReader();
          fileReader.onload = e => {
            this.mockImgSrc = e.target.result;
            this.createMockImg(1, fileObj, this.mockImgSrc);
          };
          fileReader.readAsDataURL(filePayload);
        } else if (regVideo.test(fileName)) {// 发视频，需要在输入框里暂存
          let fileObj = new FormData();
          fileObj.append("file", filePayload);
          fileObj.append("type", TYPE_VIDEO);
          this.createMockImg(3, fileObj);
        } else {// 发文件（单独，直接发出去）
          const createTime = Date.now();
          const curSendingFile = new FormData();
          curSendingFile.append("file", filePayload);
          curSendingFile.append("type", TYPE_FILE);
          this.$store.commit("SET_MSG_LIST", new Msg({
            createTime,
            content: fileName,
            sender: SENDER_CUST,
            msgType: TYPE_FILE,
            fileUrl: "",
          }));
          this.scrollToBottom();
          try {
            const fileRes = await this.$store.dispatch("UPLOAD_CHAT_FILE", {
              file: curSendingFile,
              createTime,
            });
            const xurl = fileRes.data.data.xurl;
            this.msgList.forEach(msg => {
              if(msg.createTime === createTime) {
                msg.fileUrl = xurl;
              }
            });
            this.socket.send(
              JSON.stringify({
                cmd: COMMAND_CHAT_REQ,
                from: this.$store.state.chat.custId,
                to: this.$store.state.chat.staffId,
                createTime,
                chatType: this.$store.state.chat.chatType,
                msgType: TYPE_FILE,
                content: xurl,
                extras: {
                  custType: 0,
                  sessionId: this.$store.state.chat.sessionId,
                  fileName,
                  clientMark: createTime,
                }
              })
            );
          } catch (err) {
            console.log("上传文件失败", err);
          }
        }
        ev.target.value = "";
      };
    },

    //生成文件与对应的mock图片放进输入框内
    createMockImg(curSendingMsgType, fileObj, mockImgSrc) {
      const mockImg = document.createElement("img");
      this.$refs.chatInput.appendChild(mockImg);
      switch (curSendingMsgType) {
        case TYPE_IMG: // 生成图片缩略图，放进chatInput框里
          const imgStyle = {
            width: "30px",
            height: "35px"
          };
          for (const key in imgStyle) {
            mockImg.style[key] = imgStyle[key];
          }
          mockImg.src = this.mockImgSrc;
          // 给每个img的dom指针绑上属性，在渲染时需要使用
          mockImg.fileObj = fileObj;
          mockImg.mockImgSrc = mockImgSrc;
          break;
        case TYPE_VIDEO:
          
          break;
        default:
          break;
      }
    },

    // 播放语音
    handlePlaySpeech({ index, state }) {
      const speechAudio = this.$refs.audio;
      // 聊天区域或聊天历史纪录的语音条 0-历史纪录中 1-聊天区域
      const speechSrc =
        state === 0
          ? this.historyList[index].speechSrc || this.historyList[index].blobSpeechSrc || this.historyList[index].content
          : this.msgList[index].blobSpeechSrc || this.msgList[index].speechSrc || this.msgList[index].content;
      speechAudio.setAttribute("src", speechSrc);
      speechAudio.play();
    },

    // 重写复制粘贴功能
    handleContentPaste(e) {
      e.preventDefault();
      // 下面代码是抄的：https://blog.csdn.net/zhang__ao/article/details/79107297
      var text;
      var clp = (e.originalEvent || e).clipboardData;
      if (clp === undefined || clp === null) {
          text = window.clipboardData.getData("text") || "";
          if (text !== "") {
              if (window.getSelection) {
                  // var newNode = document.createElement("span");
                  var newNode = document.createTextNode(text);
                  // newNode.innerHTML = text;
                  window.getSelection().getRangeAt(0).insertNode(newNode);
                  // createTextNode
              } else {
                  document.selection.createRange().pasteHTML(text);
              }
          }
      } else {
          text = clp.getData('text/plain') || "";
          if (text !== "") {
              document.execCommand('insertText', false, text);
          }
      }
    },
    handleSubmit() {
      this.content = this.$refs.chatInput.innerHTML;
      if (this.content.length === 0 || /^\s+$/.test(this.$refs.chatInput.innerText)) {
        this.$store.commit("SET_MSG_LIST", new Msg({
          sender: SENDER_SYSTEM,
          content: "输入内容不能为空",
        }));
        this.scrollToBottom();
        return;
      }
      if (!this.socket || this.socket.io.readyState !== 1) {
        this.$store.commit("SET_MSG_LIST", new Msg({
          sender: SENDER_SYSTEM,
          content: "连接已中断",
        }));
        this.scrollToBottom();
        return;
      }
      if (this.isExceed) {
        this.$store.commit("SET_MSG_LIST", new Msg({
          sender: SENDER_SYSTEM,
          content: "超出字数限制！",
        }));
        this.scrollToBottom();
        return;
      }
      const nodesList = this.$refs.chatInput.childNodes;
      for(let i = 0; i < nodesList.length; i++) {
        const node = nodesList[i];
        const createTime = Date.now();
        if(node.nodeType === 1) {
          // if(node.nodeName === "SPAN") {
          //   continue;
          // }
          this.$store.commit("SET_MSG_LIST", new Msg({
            createTime,
            sender: SENDER_CUST,
            msgType: TYPE_IMG,
            fileUrl: node.mockImgSrc,
          }));
          this.$store
            .dispatch("UPLOAD_CHAT_FILE", {
              file: node.fileObj,
              createTime,
            })
            .then(imgRes => {
              const xurl = imgRes.data.data.xurl;
              console.log(xurl);
              // 走socket接口发出去
              this.socket.send(
                JSON.stringify({
                  cmd: COMMAND_CHAT_REQ,
                  from: this.$store.state.chat.custId,
                  to: this.$store.state.chat.staffId,
                  createTime,
                  chatType: this.$store.state.chat.chatType,
                  msgType: TYPE_IMG,
                  content: xurl,
                  extras: {
                    custType: 0,
                    sessionId: this.$store.state.chat.sessionId,
                    clientMark: createTime,
                  }
                })
              );
            }).catch(err => {
              console.log(err);
              console.log("上传图片失败");
            });
        } else if(node.nodeType === 3) {
          // 纯文本
          this.$store.commit("SET_MSG_LIST", new Msg({
            createTime,
            sender: SENDER_CUST,
            content: node.data,
          }));
          this.socket.send(
            JSON.stringify({
              cmd: COMMAND_CHAT_REQ,
              from: this.$store.state.chat.custId,
              to: this.$store.state.chat.staffId,
              createTime,
              chatType: this.$store.state.chat.chatType,
              msgType: TYPE_TEXT,
              content: node.data,
              extras: {
                custType: 0,
                sessionId: this.$store.state.chat.sessionId,
                clientMark: createTime,
              }
            })
          );
        }
        this.$store.commit("SET_INPUT_COUNT", 0);
        this.scrollToBottom();
      }
      // Array.from(this.$refs.chatInput.childNodes).forEach(node => {
      //   const createTime = Date.now();
        // switch (node.nodeType) {
        //   case 1:
        //     break;
        //   case 3:
        //     break;
        //   default:
        //     console.log("Unknown nodeType");
        //     break;
        // }
        
      // });
    },    
    initRobotGreet() {
      this.$store.commit("SET_MSG_LIST", new Msg({
        createTime: Date.now(),
        content: "您好，请选择以下分类问题，系统将自动为您解答，或者点击转人工",
        staffName: "助手机器人",
      }));
    }
  },
  mounted() {
    this.getHistoryFromLocalStorage();
    this.saveHistoryIntoLocalStorage();
    this.initRobotGreet();
  }
};

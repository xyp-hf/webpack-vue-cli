import httpService from "../../services/http.serv";
export default {
  state: {
    msgList: [],
    historyList: [],
    custId: "",
    custName: "",
    custAvatar: "",
    staffId: "",
    staffName: "",
    staffAvatar: "",
    to: "",
    sessionId: "",
    chatType: 0,
    curSendingMsgType: 0,
    curMsg: "",
    curSpeechSrc: "",
    curSpeechDur: 0,
    isShowChat: false,
    socket: null,
    inputCount: 0,
    questionList: [],
    curQuestionPage: 1,
    questionPageSize: 3,
    isShowRobot: true,
    isShowCommentBtn: false,
    isShowCommentModal: false,
    curSpeechXUrl: "",
    isSendingFile: false,
    curSentFileUrl: "",
    isShowContextMenu: false,
  },
  mutations: {
    SET_CUST_ID(state, custId) {
      state.custId = custId;
    },
    SET_CUST_NAME(state, custName) {
      state.custName = custName;
    },
    SET_CUST_AVATAR(state, custAvatar) {
      state.custAvatar = custAvatar;
    },
    SET_STAFF_ID(state, staffId) {
      state.staffId = staffId;
    },
    SET_STAFF_NAME(state, staffName) {
      state.staffName = staffName;
    },
    SET_STAFF_AVATAR(state, staffAvatar) {
      state.staffAvatar = staffAvatar;
    },
    SET_SESSION_ID(state, sessionId) {
      state.sessionId = sessionId;
    },
    SET_CHAT_TYPE(state, chatType) {
      state.chatType = chatType;
    },
    SET_CUR_SENDING_MSG_TYPE(state, curSendingMsgType) {
      state.curSendingMsgType = curSendingMsgType;
    },
    SET_MSG_LIST(store, msg) {
      store.msgList.push(msg);
    },
    SET_HISTORY_LIST(store, historyList) {
      store.historyList = historyList;
    },
    SET_CUST_CUR_MSG(store, curMsg) {
      store.curMsg = curMsg;
    },
    SET_SOCKET(state, socket) {
      state.socket = socket;
    },
    SET_CHAT_DISPLAY(state, isShowChat) {
      state.isShowChat = isShowChat;
    },
    SET_INPUT_COUNT(state, inputCount) {
      state.inputCount = inputCount;
    },
    SET_CUR_SPEECH_SRC(state, curSpeechSrc) {
      state.curSpeechSrc = curSpeechSrc;
    },
    SET_CUR_SPEECH_DUR(state, curSpeechDur) {
      state.curSpeechDur = curSpeechDur;
    },
    SET_QUESTION_LIST(state, questionList) {
      state.questionList = questionList.map(q => {
        return {
          ...q,
          isOpened: false
        };
      });
    },
    SET_CUR_QUESTION_PAGE(state) {
      state.curQuestionPage++;
      if (state.curQuestionPage === state.questionPageSize) {
        state.curQuestionPage = 1;
      }
    },
    SET_IS_SHOW_ROBOT(state, isShowRobot) {
      state.isShowRobot = isShowRobot;
    },
    SET_IS_SHOW_COMMENT_BTN(state, isShowCommentBtn) {
      state.isShowCommentBtn = isShowCommentBtn;
    },
    SET_IS_SHOW_COMMENT_MODAL(state, isShowCommentModal) {
      state.isShowCommentModal = isShowCommentModal;
    },
    SET_CUR_SPEECH_X_URL(state, curSpeechXUrl) {
      state.curSpeechXUrl = curSpeechXUrl;
    },
    SET_IS_SENDING_FILE(state, isSendingFile) {
      state.isSendingFile = isSendingFile;
    },
    SET_CUR_SENT_FILE_URL(state, curSentFileUrl) {
      state.curSentFileUrl = curSentFileUrl;
    },
    CLEAR_MSG_LIST(state) {
      state.msgList.length = 0;
    },
    SET_IS_SHOW_CONTEXT_MENU(state, isShowContextMenu) {
      state.isShowContextMenu = isShowContextMenu;
    }
  },
  actions: {
    UPLOAD_CHAT_FILE(context, { file, createTime }) {
      return httpService.uploadChatFile({ file, handleProgress: ev => {
        const progress = (ev.loaded / ev.total) * 50 + "%";
        context.state.msgList.forEach(msg => {
          if(msg.createTime === createTime) {
            msg.httpUploadingProgress = progress;
          }
        });
      }});
    },
    FETCH_KNOWLEDGE_QUESTIONS(context, { currentPage, pageSize }) {
      return httpService
        .fetchKnowledgeQuestions({ currentPage, pageSize })
        .then(res => {
          const questionList = res.data.data.records;
          context.commit("SET_QUESTION_LIST", questionList);
        });
    },
    UPLOAD_SCORE(context, {id, evaluateContent, evaluateResult, evaluateFlag}) {
      return httpService.uploadScore({id, evaluateContent, evaluateResult, evaluateFlag});
    }
  }
};

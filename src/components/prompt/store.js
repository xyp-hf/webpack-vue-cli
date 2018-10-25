export default {
    state: {
        type: -1,
        isShowPrompt: false,
        msg: "",
        busyMsg: "",
        rankNo: 0,
        currQueueNo: 0,
        currQueueTime: "",
    },
    mutations: {
        SET_PROMPT_DISPLAY(state, isShowPrompt) {
            state.isShowPrompt = isShowPrompt;
        },
        SET_PROMPT_TYPE(state, type) {
            state.type = type;
        },
        SET_PROMPT_MSG(state, msg) {
            state.msg = msg;
        },
        SET_PROMPT_RANK_NO(state, rankNo) {
            state.rankNo = rankNo;
        },
        SET_BUSY_MSG(state, busyMsg) {
            state.busyMsg = busyMsg;
        },
        SET_QUEUE_NO(state, currQueueNo) {
            state.currQueueNo = currQueueNo;
        },
        SET_QUEUE_TIME(state, currQueueTime) {
            state.currQueueTime = currQueueTime;
        },
    },
    actions: {
        
    }
}

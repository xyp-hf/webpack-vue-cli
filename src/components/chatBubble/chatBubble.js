import utils from "../../utils"


export default {
    props: {
        msg: {
            type: Object,
            default() {
                return {
                    msgId: "",
                    createTime: 0,
                    sender: 0,
                    msgType: 0,
                    chatType: 0,
                    content: "",
                    staffName: "",
                    staffAvatar: require("../../assets/images/user_default.png"),
                    speechSrc: "",
                    speechDur: 0,
                    blobSpeechSrc: "",
                    fileUrl: "",
                    isSocketSendSuccess: false,
                    httpUploadProgress: 0
                };
            }
        },
        index: {
            type: Number,
            default() {
                return 0;
            }
        }
    },
    data() {
        return {
            minTime: 5000,
            maxTime: 60000,
            minWidth: 100,
            maxWidth: 300
        }
    },
    computed: {
        isUploadFileSuccess() {
            return this.msg.httpUploadingProgress === '50%' && this.msg.isSocketSendSuccess;
        },
        // isSocketSendFileSucceess() {
        //   return this.$store.state.chat.isSocketSendFileSucceess;
        // },
        // upLoadingProcessBarWidth() {
        //   return this.$store.state.chat.upLoadingProcessBarWidth;
        // },
        staffName() {
            return this.$store.state.chat.staffName;
        },
        staffAvatar() {
            return this.$store.state.chat.staffAvatar;
        },
        custName() {
            return this.$store.state.chat.custName;
        },
        custAvatar() {
            return this.$store.state.chat.custAvatar;
        },
        msgList() {
            return this.$store.state.chat.msgList;
        },
        isSendingFile() {
          return this.$store.state.chat.isSendingFile;
        },
    },
    methods: {
        playSpeech(ev) {
            var ev = ev || event;
            const tar = ev.target;
            const className = tar.parentNode.parentNode.parentNode.parentNode.className;
            const state = className === "history_list" ? 0 : 1;
            this.$emit("playSpeech", {index: this.index, state});
        },
        getSpeechBarWidth(speechDur) {
            if (speechDur < this.minTime) {
                return this.minWidth;
            }
            if (speechDur > this.maxTime) {
                return this.maxWidth;
            }
            return parseInt(this.minWidth + (speechDur / 1000) * ((this.maxWidth - this.minWidth) / ((this.maxTime - this.minTime) / 1000)));
        },
        // getUploadProgressBarWidth(httpUploadingProgress, isSocketSendSuccess) {
        //     return httpUploadingProgress * 50 + isSocketSendSuccess ? 50 : 0;
        // }
        parseTime(createTime) {
            return utils.parseTime(createTime);
        },

        showContextMenu($event, sender) {
            console.log($event);
            console.log(this.msg.msgId);
            this.$store.commit("SET_IS_SHOW_CONTEXT_MENU", true);

            if(sender === 0) {
                
            } else {

            }
        }
    },
    mounted() {
        
    }
}
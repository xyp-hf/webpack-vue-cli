export default {
    computed: {
      busyMsg() {
        return this.$store.state.prompt.busyMsg;
      },
      type() {
        return this.$store.state.prompt.type;
      },
      isShowPrompt() {
        return this.$store.state.prompt.isShowPrompt;
      },
      socket() {
        return this.$store.state.chat.socket;
      }
    },
    methods: {
      closePrompt() {
        this.$store.commit("SET_RUNX_IM_DISPLAY", false);
        this.socket.close();
        this.$store.commit("SET_SOCKET", null);
      }
    }
  };
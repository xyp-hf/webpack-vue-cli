export default {
    computed: {
        socket() {
            return this.$store.state.chat.socket;
        }
    },
    methods: {
        showRunxIM() {
            // bus.$emit("_OPEN_SOCKET_");
            this.$store.commit("SET_RUNX_IM_DISPLAY", true);
            this.$store.commit("SET_CHAT_DISPLAY", true);
            this.$store.commit("SET_PROMPT_DISPLAY", false);
        }
    },
}
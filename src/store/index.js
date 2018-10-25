import Vue from "vue";
import vuex from "vuex";
import runxIM from "../components/runxIM/store";
import chat from "../components/chat/store";
import prompt from "../components/prompt/store";
import comment from "../components/comment/store";
Vue.use(vuex);
export default new vuex.Store({
  modules: {
    chat,
    prompt,
    runxIM,
    comment,
  }
});

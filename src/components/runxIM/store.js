import httpService from "../../services/http.serv";
import storageService from "../../services/storage.serv";

export default {
  state: {
    token: "",
    hint: "",
    createTime: 0,
    isOnline: false,
    isShowRunxIM: false,
    queryTypeTreeList: [],
    parentTypeId: "",
    childTypeId: ""
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_HINT(state, hint) {
      state.hint = hint;
    },
    SET_ONLINE_STATUS(state, isOnline) {
      state.isOnline = isOnline;
    },
    SET_RUNX_IM_DISPLAY(state, isShowRunxIM) {
      state.isShowRunxIM = isShowRunxIM;
    },
    SET_CREATE_TIME(state, createTime) {
      state.createTime = createTime;
    },
    SET_QUERY_TYPE_TREE_LIST(state, queryTypeTreeList) {
      state.queryTypeTreeList = queryTypeTreeList;
    },
    SET_PARENT_TYPE_ID(state, parentTypeId) {
      state.parentTypeId = parentTypeId;
    },
    SET_CHILD_TYPE_ID(state, childTypeId) {
      state.childTypeId = childTypeId;
    }
  },
  actions: {
    FETCH_TOKEN(context, bussinessCode) {
      return httpService
        .fetchToken(bussinessCode)
        .then(res => {
          const { token } = res.data.data;
          storageService.setCurToken(token);
          context.commit("SET_TOKEN", token);
        })
        .catch(err => {
          console.error("FETCH_TOKEN", err);
        });
    },
    FETCH_HINT(context) {
      return httpService
        .fetchHint()
        .then(res => {
          context.commit("SET_HINT", res.data.data);
        })
        .catch(err => {
          console.error("FETCH_HINT", err);
        });
    },
    FETCH_KONWLEDGE_ANSWER(context, id) {
      return httpService.fetchKnowledgeAnswer(id);
    },
    FETCH_QUERY_TYPES(context) {
      return httpService.fetchQueryTypes();
    },
  }
};

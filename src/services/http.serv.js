import axios from "axios";
import getDomain from "../config/env";
import storageService from "./storage.serv";
import store from "../store";

axios.defaults.withCredentials = true;

class HttpService {
  constructor() {
    this.headerConfig = {
      "Content-Type": "application/json;charset=UTF-8"
    }
  }
  fetchToken({businessCode, history}) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/auth/cust/apply`;
    const params = JSON.stringify({ businessCode, history});
    return axios.post(url, params, {
      headers: this.headerConfig,
    });
  }
  fetchHint() {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/cms/param/getHint`;
    return axios.post(url, {}, {
      headers: this.headerConfig,
    });
  }
  uploadChatFile({file, handleProgress}) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/fs/im/file`;
    return axios.post(url, file, {
      headers: {
        "X-Auth-Token": storageService.getCurToken()
      },
      onUploadProgress(ev) {
        handleProgress(ev);
      }
    });
  }
  fetchKnowledgeQuestions({currentPage, pageSize}) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/ai/knowledge/question/assistant`;
    return axios.get(url, {
      params: {
        currentPage,
        pageSize
      },
      headers: {
        "X-Auth-Token": storageService.getCurToken(),
        "custType": 0, //理论上以下都要加
        "appSource": 0,
        "Content-Type": "application/json;charset=UTF-8"
      }      
    });
  }
  fetchKnowledgeAnswer(id) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/ai/knowledge/question/info/${id}`;
    return axios.get(url, {
      headers: {
        "X-Auth-Token": storageService.getCurToken()
      }
    });
  }
  fetchQueryTypes() {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/cms/work_order_type/query_tree`;
    return axios.get(url, {
      headers: {
        "X-Auth-Token": storageService.getCurToken()
      }
    });
  }
  uploadScore({id, evaluateContent, evaluateResult, evaluateFlag}) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/acd/chat/evaluate`;
    return axios.post(url, {id, evaluateContent, evaluateResult, evaluateFlag}, {
      headers: {
        "X-Auth-Token": storageService.getCurToken()
      },
    });
  }
  uploadComment({orderContent, orderTypeId, orderSource, custName, custEmail, custMobile}) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/work/wkTWorkOrderInfo/client_save`;
    return axios.post(url, {orderContent, orderTypeId, orderSource, custName, custEmail, custMobile}, {
      headers: {
        "X-Auth-Token": storageService.getCurToken()
      },
    })
  }
  fetchCommentSelection({id}) {
    const url = `https://${getDomain()}api-gateway.runx.vip/cs/cms/work_order_type/query/type/${id}`;
    return axios.get(url, {
      headers: {
        "X-Auth-Token": storageService.getCurToken(),
        custType: 1,
        appSource: 0,
        "Content-Type": "application/json;charset=UTF-8"
      }
    })
  }

}

export default new HttpService();

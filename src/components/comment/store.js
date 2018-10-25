import httpService from "../../services/http.serv";

export default {
    actions: {
        UPLOAD_COMMENT(
          context,
          {
            orderContent,
            orderTypeId,
            orderSource,
            custName,
            custEmail,
            custMobile
          }
        ) {
          return httpService.uploadComment({
            orderContent,
            orderTypeId,
            orderSource,
            custName,
            custEmail,
            custMobile
          });
        },
        FETCH_COMMENT_SELECTION(context, {id}) {
            return httpService.fetchCommentSelection({id});
        }
    }

}
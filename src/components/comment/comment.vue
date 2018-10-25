<template>
    <div v-show="isShowCommentModal" id="runx_im_comment_container">
        <div class="runx_im_comment">
            <div class="runx_im_comment_header">
                <span>请你留言</span>
                <i @click="closeCommentModal"></i>
            </div>
            <div class="runx_im_comment_body">
                <p class="hint1">您好，我们的上班时间为：周一至周日8:00--22:00；很抱歉我们暂时无法为您提供服务，如需帮助，请留言，我们将尽快联系并解决您的问题</p>
                <div class="q_div">
                    <span><b>*</b>问题分类：</span><select @change="selectParentType($event)">
                        <!-- <option selected="selected">{{opt1.length === 0 ? "没有选项" : "请选择父分类"}}</option> -->
                        <option v-for="(item1, i) in opt1" :key="i" :value="item1.id">{{item1.typeName}}</option>
                    </select><select @change="selectChildType($event)">
                        <!-- <option selected="selected">{{opt2.length === 0 ? "没有选项" : "请选择子分类"}}</option> -->
                        <option v-for="(item2, i) in opt2" :selected="i == 0 ? 'selected' : ''" :key="i" :value="item2.id">{{item2.typeName}}</option>
                    </select>
                </div>
                <div class="q_disc">
                    <span>问题描述：</span><textarea v-model="questionDisc"></textarea>
                </div>
                <div class="comment_info">
                    <span><b>*</b>姓名：</span><input v-model="name" type="text" placeholder="请输入姓名">
                </div>
                <div class="comment_info">
                    <span><b>*</b>邮箱：</span><input v-model="mail" type="text" placeholder="请输入邮箱">
                </div>
                <div class="comment_info mobile">
                    <span>手机：</span><input v-model="phone" type="text" placeholder="请输入手机号">
                </div>
                <p class="hint2">注：请输入正确联系方式，以确保我们的客服人員可以第一時間联系到您本人，谢谢</p>
                <div class="comment_submit_btn" @click="submitComment">提交留言</div>
            </div>
        </div>
    </div>
</template>

<script lang="js" src="./comment.js">
</script>

<style lang="scss" scoped>
#runx_im_comment_container {
    position: fixed;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,.6);
    .runx_im_comment {
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -225px;
        margin-top: -293px;
        width: 450px;
        height: 585px;
        background: #f8f8f8;
        border-radius: 5px;
        .runx_im_comment_header {
            position: relative;
            padding-left: 20px;
            height: 60px;
            background: #fff;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            span {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                font-weight: bold;
            }
            i {
                position: absolute;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 10px;
                height: 10px;
                background: url(../../assets/images/close.png) no-repeat;
                background-size: 10px 10px;
            }
            i:hover {
                cursor: pointer;
            }
        }
        .runx_im_comment_body {
            padding-left: 20px;
            b {
                color: red;
            }
            .hint1 {
                width: 405px;
                height: 37px;
                line-height: 20px;
                margin-top: 20px;
                color: #999999;
            }
            .q_div {
                margin-top: 20px;
                span {

                }
                select {
                    width: 157px;
                    height: 30px;
                }
                select:nth-of-type(2) {
                    margin-left: 15px;
                }
                select:hover {
                    cursor: pointer;
                }
            }
            .q_disc {
                margin-left: 8px;
                margin-top: 10px;
                span {
                    display: inline-block;
                    vertical-align: top;
                }
                textarea {
                    display: inline-block;
                    vertical-align: top;
                    width: 328px;
                    height: 168px;
                    resize: none;
                }
            }
            .comment_info {
                margin-top: 5px;
                margin-left: 24px;
                input {
                    width: 327px;
                    height: 30px;
                }
            }
            .mobile {
                margin-left: 31px;
            }
            .hint2 {
                margin-top: 10px;
                margin-left: 66px;
                width: 352px;
                height: 57px;
                line-height: 20px;
                color: #999999;
            }
            .comment_submit_btn {
                width: 155px;
                height: 40px;
                background: #4f71c9;
                text-align: center;
                line-height: 40px;
                color: #fff;
                font-weight: bold;
                margin-left: 68px;
            }
            .comment_submit_btn:hover {
                cursor: pointer;
            }
        }
    }
}
</style>


<template>
    <div v-show="isShowPrompt" id="runx_im_prompt_container">

        <div class="header">
            <span>提示</span>
            <i @click="closePrompt"></i>
        </div>

        <div v-if="type === 0" class="content">
            <div class="message1">您好，我们的上班时间是</div>
            <div class="message2">周一至周日8:00 -- 22:00</div>
            <div class="message3">请您在这期间来咨询我们，给您带来不便敬请谅解，谢谢！</div>
        </div>

        <div v-if="type === 1" class="content">
            <div class="message1">您好，很抱歉地告诉您，</div>
            <div class="message2">目前暂时没有客服在线</div>
            <div class="message3">给您带来不便敬请谅解，谢谢！</div>
        </div>

        <div v-if="type === 2" class="content">
            <div class="message1">{{busyMsg}}</div>
            <div class="message2">
                <div class="queue_msg">排队中（28）...大约需要3分钟</div>
                <div class="queue_quit">退出排队</div>
            </div>
            <div class="message3">退出排队再次咨询客服将重新进行排队</div>
        </div>

    </div>
</template>

<script lang="js" src="./prompt.js">
</script>

<style lang="scss" scoped>
.pos_vertical_middle {
  position: absolute;
  top: 50%;
}

#runx_im_prompt_container {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 450px;
  margin-left: -225px;
  margin-top: -110px;
  border: 1px solid #000;
  font-size: 14px;
  .header {
    position: relative;
    width: 100%;
    height: 60px;
    background: #fff;
    span {
      @extend .pos_vertical_middle;
      left: 13px;
      font-weight: bold;
      transform: translateY(-50%);
    }
    i {
      @extend .pos_vertical_middle;
      right: 13px;
      width: 16px;
      height: 16px;
      transform: translateY(-50%);
      background: url(../../assets/images/close.png) no-repeat;
    }
    i:hover {
        cursor: pointer;
    }
  }
  .content {
    font-size: 14px;
    color: #666666;
    background: #f8f8f8;
    padding: 26px 13px;
    .message1 {
      margin-bottom: 13px;
    }
    .message2 {
      margin-bottom: 13px;
      font-size: 18px;
      color: #f94955;
      .queue_msg {
      }
      .queue_quit {
        width: 240px;
        height: 35px;
        margin-top: 13px;
        line-height: 35px;
        text-align: center;
        font-size: 14px;
        background: #fff;
        border: 1px solid #f94955;
      }
      .queue-quit:hover {
        cursor: pointer;
      }
    }
    .message3 {
    }
  }
}
</style>


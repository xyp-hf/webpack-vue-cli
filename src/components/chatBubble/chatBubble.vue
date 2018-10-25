<template>
    <li class="runx_im_chat_bubble">

        <div v-if="msg.sender == 0" class="msg">
            <i class="avatar l" :style="{backgroundImage: `url(${msg.staffAvatar})`}"></i>
            <div class="name name_l">客服{{msg.staffName}}</div><div class="time_l">{{parseTime(msg.createTime)}}</div>
            <div class="chat_box_left box_l" v-if="msg.msgType == 0">
              {{msg.content}}
            </div>
            <div class="chat_box_left image" style="margin-left: 20px" v-if="msg.msgType == 1">
              <img :src="msg.fileUrl">
            </div>
            <div class="chat_box_left speech" style="margin-left: 20px" v-if="msg.msgType == 2">
              <!-- <div @click="playSpeech" class="speech_bar" :style="{width: `${getSpeechBarWidth(msg.speechDur)}px`}"></div> -->
              <div @click="playSpeech" class="speech_bar" :style="{width: '150px', marginLeft: '20px'}"></div>
            </div>
            <div class="chat_box_left video" v-if="msg.msgType == 3"></div>
            <div class="chat_box_left file" v-if="msg.msgType == 4">
              <img src="../../assets/images/file_upload_icon.png">
              <a :href="msg.fileUrl" target="_blank">下载：{{msg.content}}</a>
            </div>
        </div>

        <div v-if="msg.sender == 1" class="msg cust">
            <i class="avatar r" :style="{backgroundImage: `url(${custAvatar})`}"></i>
            <div class="time_r">{{parseTime(msg.createTime)}}</div><div class="name name_r">客户{{custName}}</div>
            <div class="chat_box_right box_r cust_bubble" v-if="msg.msgType == 0">
              {{msg.content}}
              <div v-show="!msg.isSocketSendSuccess" class="loading_gif"></div>
            </div>
            <div class="chat_box_right image cust_bubble" v-if="msg.msgType == 1">
              <img :src="msg.fileUrl">
              <div :class="['loading_bar',  isUploadFileSuccess ? 'fade_out' : '']">
                <div class="bar" :style="{width: msg.httpUploadingProgress}"></div>
                <div class="bar2" :style="{width: `${msg.isSocketSendSuccess ? 50 : 0}%`}"></div>  
              </div>
            </div>
            <div class="chat_box_right speech cust_bubble" v-if="msg.msgType == 2"> 
              <div @click="playSpeech" class="speech_bar" :style="{width: `${getSpeechBarWidth(msg.speechDur)}px`}"></div>
              <div v-show="!isUploadFileSuccess" class="loading_gif"></div>
            </div>
            <div class="chat_box_right video cust_bubble" v-if="msg.msgType == 3"></div>
            <div class="chat_box_right file cust_bubble" v-if="msg.msgType == 4">
              <img src="../../assets/images/file_upload_icon.png">
              <a :href="msg.fileUrl" target="_blank">下载{{msg.content}}</a>
              <div :class="['loading_bar',  isUploadFileSuccess ? 'fade_out' : '']">
                <div class="bar" :style="{width: msg.httpUploadingProgress}"></div>
                <div class="bar2" :style="{width: `${msg.isSocketSendSuccess ? 50 : 0}%`}"></div>  
              </div>
            </div>
        </div>

        <div v-if="msg.sender == 2" class="system">
          <span>{{msg.content}}</span>
        </div>
            
        <div v-if="msg.sender == 3" class="hint">
            <div>{{msg.content}}</div>
        </div>

    </li>
</template>

<script lang="js" src="./chatBubble.js"></script>

<style lang="scss" scoped>
.chat_bubble_left {
  left: -18px;
  border-right: 20px solid #fff;
}
.chat_bubble_right {
  right: -18px;
  border-left: 20px solid #4f71c9;
  word-wrap: break-word;
  // max-width:
}
.chat_bubble {
  position: absolute;
  content: "";
  width: 0;
  height: 0;
  top: 11px;
  border-bottom: 20px solid transparent;
}
.chat_box {
  display: inline-block;
  position: relative;
  margin-top: 45px;
  // margin-left: 30px;
  padding: 15px 20px;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  color: #666666;
  word-wrap: break-word;
}
.line {
  content: "";
  position: absolute;
  top: 7px;
  width: 25%;
  height: 1px;
  background: #b6b6b6;
  color: #fff;
}
.system {
  position: relative;
  text-align: center;
  line-height: 14px;
  span {
    display: inline-block;
    font-size: 14px;
    color: #b6b6b6;
    text-align: center;
  }
  span:before {
    @extend .line;
    left: 5px;
  }
  span:after {
    @extend .line;
    right: 5px;
  }
}
.hint {
  text-align: center;
  div {
    display: inline-block;
    padding: 10px;
    border-radius: 10px;
    background: #b6b6b6;
    color: #fff;
  }
}
.speech {
  .speech_bar {
    background: rgb(178,266,64);
    border-radius: 5px;
    height: 20px;
  }
  .speech_bar:hover {
    cursor: pointer;
  }
}
.image {
  img {
    max-width: 200px;
    max-height: 150px;
  }
}
.file {
  margin-left: 20px;
}
.runx_im_chat_bubble {
  overflow: hidden;
  margin: 15px 0;
  .msg {
    position: relative;
    .avatar {
      position: absolute;
      top: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-position: center center;
      background-size: 36px 36px;
    }
    .l {
      left: 0;
    }
    .r {
      right: 0;
    }
    .name {
      position: absolute;
      top: 9px;
      font-size: 12px;
      color: #999999;
      white-space: nowrap;
    }
    .name_l {
      left: 45px;
    }
    .name_r {
      right: 45px;
    }
    .box_l {
      margin-left: 20px;
    }
    .box_r {
      margin-right: 10px;
    }
    .chat_box_left,
    .chat_box_right {
      @extend .chat_box;
    }
    .chat_box_left:before {
      @extend .chat_bubble;
      @extend .chat_bubble_left;
    }
    .chat_box_right:before {
      @extend .chat_bubble;
      @extend .chat_bubble_right;
    }
  }
}
.cust {
  float: right;
  margin-right: 18px;
}
.cust_bubble {
  float: right;
  background: #4f71c9 !important;
  color: #fff !important;
}
.loading_bar {
  width: 100%;
  height: 3px;
  margin-top: 5px;
  border: 1px solid #fff;
  .bar, .bar2 {
    float: left;
    height: 3px;
    background: rgb(152,225,101);
    transition: .3s;
  }
}
.loading_gif {
  position: absolute;
  left: -25px;
  top: 50%;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  background-image: url(../../assets/images/loading.gif);
  background-size: 20px 20px;
}
.fade_out {
  opacity: 0;
  transition: 2s;
}
.time_l {
  position: absolute;
  font-size: 10px;
  color: gray;
  left: 45px;
  top: 26px;
}
.time_r {
  position: absolute;
  font-size: 10px;
  color: gray;
  right: 45px;
  top: 26px;

}
</style>


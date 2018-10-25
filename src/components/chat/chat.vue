<template>
    <div id="runx_im_chat_container" v-show="isShowChat">

        <div class="header">
            <div class="staff_avatar" :style="{backgroundImage: `url(${staffAvatar})`}"></div>
            <!-- <i :class="['staff_status', isOnline ? 'online' : 'offline']"></i> -->
            <div class="staff_name">客服{{ staffName || "机器人"}}</div>
            <div class="staff_title">{{ isOnline ? "在" : "离" }}线客服</div>
            <div class="hide_chat" @click="isShowCloseModal = true"></div>
        </div>

        <div class="chat_main">
            <div class="load_history">
                <div class="bar" v-show="!isShowHistory" @click="loadHistory">加载聊天记录</div>
                <ul v-show="isShowHistory" class="history_list">
                    <li is="chatBubble" v-for="(history, i) in historyList" :msg="history" :key="i" :index="i" @playSpeech="handlePlaySpeech"></li>
                </ul>
                <div v-show="isShowHistory" class="history_hint">以上为历史聊天纪录（仅显示最近10条）</div>
            </div>
            <ul class="content">
                <li is="chatBubble" v-for="(msg, i) in msgList" :msg="msg" :key="i" :index="i" @playSpeech="handlePlaySpeech"></li>
            </ul>
        </div>

        <div class="chat_foot">
          <div v-show="!isShowRobot" class="artificial">
            <div class="chat_func_bar">
              <ul>
                <li>
                  <div class="func_bar_icon" :class="['func_bar_icon', isShowEmojis ? 'emojis_actived' : '']" @click="isShowEmojis = !isShowEmojis"></div>
                  <div class="emojis_container" v-show="isShowEmojis">
                    <ul>
                      <li v-for="(emoji, key) in emojis" :key="key" @click="addEmoji(emoji)">{{emoji}}</li>
                    </ul>
                  </div>
                </li>
                <li>
                  <div @click="uploadFile" class="func_bar_icon">
                    <input v-show="false" type="file" ref="uploadFileBtn">
                  </div>
                </li>
                <li>
                  <div class="func_bar_icon" @click="isShowScoreModal = true"></div>
                </li>
              </ul>
            </div>
            <div class="chat_input"
              @paste="handleContentPaste"
              @input="handleContentChange"
              @focus="handleInputFocus"
              @blur="isChatInputFocus=false"
              @keydown.ctrl.enter="handleSubmit"
              ref="chatInput"
              :contenteditable="!isStartRecord"
              placeholder="请反馈您的问题，我们将尽快回复"></div>
            <div class="chat_count">
              <span :class="{'exceed' : isExceed}">{{inputCount}}</span>
              /{{inputLimit}}
              <span v-show="isExceed">超出字数限制！</span>
            </div>
            <div class="chat_btn" @click="handleSubmit" @mousedown.prevent>发送</div>
            <div v-show="!isShowRecorder" @click="showRecorder" class="chat_btn" @mousedown.prevent>发送语音</div>
            <div v-show="isShowRecorder" class="chat_recorder_box">
              <img v-if="isStartRecord" width="60px" height="30px" src="../../assets/images/voice_recording.gif">
              <div v-if="!isStartRecord" @click="startRecord" class="chat_recorder">点击开始录音</div>
              <div v-if="isStartRecord" @click="endRecord" class="chat_recorder">点击结束录音</div>
              <div class="chat_btn" @click="cancelRecord">取消</div>
            </div>
            <audio v-show="false" controls ref="audio" :src="speechSrc"></audio>
          </div>
          <div v-show="isShowRobot" class="robot">
            <div class="handle_question">
              <span @click="isShowSelectModal = true">转人工</span>
              <span @click="handlePageQuestion">换一换</span>
            </div>
            <div class="qusetion_list_wrap">
              <ul class="question_list">
                <li class="question_item" v-for="(question, i) in questionList" :key="i">
                  <div class="question_l">
                    <span class="q_title">{{question.typeName}}</span>
                    <span :class="['q_btn', question.isOpened ? 'up' : 'down']" @click="question.isOpened = !question.isOpened"></span>
                  </div><ul :class="['question_r', question.isOpened ? 'open' : '']">
                    <li v-for="(content, k) in question.questions" :key="k" @click="submitQuestion(content.id, content.questionName)">{{content.questionName}}</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-show="isShowCloseModal || isShowSelectModal || isShowScoreModal" class="alert_modal">
            <div v-if="isShowCloseModal" class="close_box">
                <i class="close" @click="isShowCloseModal = false"></i>
                <span class="msg">结束本次对话？</span>
                <span class="confirm" @click="closeChat">确定</span>
                <span class="cancel" @click="isShowCloseModal = false">取消</span>
            </div>
            <div v-if="isShowSelectModal" class="select_box">
                <i class="close" @click="isShowSelectModal = false"></i>
                <span class="title">请选择您要咨询的问题类型：</span>
                <div class="select_bar">
                  <select @change="selectParentType($event)">
                      <option v-for="(parent, i) in queryTypeTreeList" :key="i" :value ="parent.id">{{parent.label}}</option>
                  </select>
                  <select @change="selectChildType($event)">
                      <option v-for="(child, i) in queryTypeTreeList[selectedParentTypeIndex].children" :key="i" :value="child.id">{{child.label}}</option>
                  </select>
                </div>
                <div class="btn_bar">
                  <span class="confirm" @click="accessWebsocket">确定</span>
                  <span class="cancel" @click="isShowSelectModal = false">取消</span>
                </div>
            </div>
            <div v-if="isShowScoreModal" class="score_box">
                <i class="close" @click="closeScoreModal"></i>
                <div class="title">评价客服</div>
                <div class="score_block">
                  <div class="star">
                    <img v-for="(star, i) in starList" :key="i" :src="star.src" @click="confirmScore(i)">
                  </div>
                  <div class="hint">{{starList[acivedStarIndex].hint}}</div>
                  <div class="text">
                    <textarea></textarea>
                  </div>
                </div>
                
                <div class="btn_bar">
                  <span class="confirm" @click="submitScore">提交评价</span>
                  <span class="cancel" @click="closeScoreModal">取消评价</span>
                </div>
            </div>
        </div>

        <div v-show="isShowCommentBtn" class="comment_btn" @click="showCommentModal">写工单</div>

    </div>
</template>

<script lang="js" src="./chat.js">
</script>

<style lang="scss" scoped>
$avatar_left: 15px;
$avatar_width: 40px;
$dis_avatar_msg: 10px;

.pos_vertical_middle {
  position: absolute;
  top: 50%;
}
.staff_msg {
  left: $avatar_left + $avatar_width + $dis_avatar_msg;
  color: #fff;
}
.time_line {
  content: "";
  position: absolute;
  top: 12px;
  width: 37%;
  height: 1px;
  background: #b6b6b6;
}
.chat_bubble_left {
  left: -20px;
  border-right: 20px solid #fff;
}
.chat_bubble_right {
  right: -20px;
  border-left: 20px solid #4f71c9;
  word-wrap: break-word;
  // max-width:
}
.chat_bubble {
  position: absolute;
  content: "";
  width: 0;
  height: 0;
  top: 20px;
  border-bottom: 20px solid transparent;
}
.chat_box {
  display: inline-block;
  position: relative;
  margin-left: 18px;
  padding: 20px;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  color: #666666;
  word-wrap: break-word;
}

.btn {
  position: absolute;
  bottom: 10%;
  width: 60px;
  height: 30px;
  background: #ffffff;
  text-align: center;
  line-height: 30px;
  font-size: 12px;
}
#runx_im_chat_container {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 440px;
  height: 512px;
  background: #f8f8f8;
  box-shadow: 1px 1px 10px #000;
  .header {
    position: relative;
    width: 100%;
    height: 61px;
    padding: 0;
    background: #4f71c9;
    .staff_avatar {
      @extend .pos_vertical_middle;
      left: $avatar_left;
      width: $avatar_width;
      height: $avatar_width;
      border-radius: 50%;
      border: 1px solid #fff;
      margin-top: -$avatar_width/2;
      background-position: center center;
      background-size: $avatar_width $avatar_width;
    }
    .staff_status {
      position: absolute;
      left: $avatar_left + $avatar_width - 10;
      bottom: 14px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .online {
      background: url(../../assets/images/is_online.png) no-repeat center/12px;
    }
    .offline {
      background: url(../../assets/images/is_offline.png) no-repeat center/12px;
    }
    .staff_name {
      @extend .pos_vertical_middle;
      @extend .staff_msg;
      top: 15px;
      font-size: 14px;
    }
    .staff_title {
      @extend .pos_vertical_middle;
      @extend .staff_msg;
      bottom: 5px;
      font-size: 12px;
      line-height: 25px;
      margin-left: 1px;
    }
    .hide_chat {
      @extend .pos_vertical_middle;
      width: 16px;
      height: 16px;
      right: 15px;
      background: url(../../assets/images/hide_chat.png) no-repeat center/16px;
      margin-top: -8px;
    }
    .hide_chat:hover {
      cursor: pointer;
    }
  }
  .chat_main {
    position: relative;
    height: 331px;
    padding: 14px;
    box-sizing: border-box;
    overflow: auto;
    .load_history {
      position: relative;
      padding: 20px 0;
      .bar {
        @extend .pos_vertical_middle;
        left: 50%;
        width: 109px;
        height: 12px;
        margin-left: -55px;
        margin-top: -6px;
        text-align: center;
        line-height: 12px;
        color: #b6b6b6;
        font-size: 12px;
      }
      .bar:hover {
        cursor: pointer;
      }
      .history_list {
        padding: 10px 5px;
      }
      .history_hint {
        text-align: center;
        line-height: 14px;
        color: #b6b6b6;
      }
    }
    .content {
    }
  }
  .chat_foot {
    position: relative;
    height: 120px;
    background: #ffffff;
    .artificial {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      .chat_func_bar {
        height: 25px;
        ul {
          li {
            float: left;
            position: relative;
            width: 25px;
            height: 25px;
            line-height: 25px;
            text-align: center;
            margin-left: 15px;
            .func_bar_icon {
              display: inline-block;
              width: 20px;
              height: 20px;
              margin-top: 2px;
              background-size: 20px 20px;
              background-position: center center;
              background-repeat: no-repeat;
            }
            .func_bar_icon:hover {
              cursor: pointer;
            }
            .actived {
              background-color: #f8f8f8;
            }
            .emojis_container {
              position: absolute;
              top: -110px;
              left: -15px;
              background-color: #f8f8f8;
              padding: 5px;
              width: 180px;
              height: 100px;
              overflow: auto;
              ul {
                li {
                  float: left;
                  width: 25px;
                  height: 25px;
                  line-height: 25px;
                  text-align: center;
                }
                li:hover {
                  outline: 1px solid #000;
                  cursor: pointer;
                }
              }
            }
          }
          li:nth-of-type(1) .func_bar_icon {
            background-image: url(../../assets/images/emojis.png);
          }
          li:nth-of-type(2) .func_bar_icon {
            background-image: url(../../assets/images/file.png);
          }
          li:nth-of-type(3) .func_bar_icon {
            background-image: url(../../assets/images/comment.png);
          }
          li:nth-of-type(1) .emojis_actived {
            background-image: url(../../assets/images/emojis_actived.png);
          }
          li:nth-of-type(2) .file_actived {
            background-image: url(../../assets/images/file_actived.png);
          }
          li:nth-of-type(3) .comment_actived {
            background-image: url(../../assets/images/comment_actived.png);
          }
        }
      }
      .chat_input {
        height: 35px;
        padding: 10px;
        overflow: auto;
        font-size: 12px;
        color: #999999;
      }
      .chat_input:empty::before {
        content: attr(placeholder);
      }
      .chat_count {
        float: left;
        margin: 10px 20px;
        .exceed {
          color: red;
        }
      }
      .chat_btn {
        float: right;
        // width: 57px;
        // height: 27px;
        padding: 2px 15px;
        margin-top: 5px;
        margin-right: 5px;
        background: #f8f8f8;
        text-align: center;
        font-size: 14px;
        line-height: 27px;
        color: #c5c4c4;
      }
      .chat_btn:hover {
        cursor: pointer;
      }
      .chat_recorder_box {
        position: relative;
        float: right;
        // width: 200px;
        height: 40px;
        img {
          position: absolute;
          left: -100px;
          top: 2px;
        }
        .chat_recorder {
          float: left;
          padding: 0px 15px;
          text-align: center;
          line-height: 30px;
          font-size: 14px;
          margin-top: 6px;
          margin-right: 2px;
          background: #4f71c9;
          color: #fff;
        }
        .chat_recorder:hover {
          cursor: pointer;
        }
        .chat_btn {
          float: right;
          padding: 2px 15px;
          text-align: center;
          line-height: 30px;
          font-size: 16px;
        }
      }
    }
    .robot {
      position: absolute;
      left: 0;
      top: -30px;
      width: 100%;
      height: 150px;
      overflow: hidden;
      // border: 1px solid #000;
      background: #fff;
      .handle_question {
        background: #f8f8f8;
        height: 30px;
        line-height: 30px;
        span {
          float: right;
          margin-right: 10px;
        }
        span:nth-of-type(1) {
          width: 55px;
          height: 20px;
          text-align: center;
          line-height: 20px;
          color: #fff;
          background: #4f71c9;
          margin-top: 5px;
        }
        span:nth-of-type(2) {
        }
        span:nth-of-type(1):hover {
          cursor: pointer;
        }
        span:nth-of-type(2):hover {
          cursor: pointer;
        }
      }
      .qusetion_list_wrap {
        overflow: auto;
        // height: 150px;
        height: 123px;
        .question_list {
          .question_item {
            // height: 40px;
            border-bottom: 1px solid #f8f8f8;
            box-sizing: border-box;
            .question_l {
              display: inline-block;
              width: 40%;
              height: 40px;
              border-right: 1px solid #f8f8f8;
              box-sizing: border-box;
              vertical-align: middle;
              .q_title {
                float: left;
                margin-left: 20px;
                margin-top: 10px;
              }
              .q_btn {
                float: right;
                width: 10px;
                height: 10px;
                margin-right: 20px;
                margin-top: 10px;
                background-position: center;
                background-size: 10px 10px;
                background-repeat: no-repeat;
              }
              .q_btn:hover {
                cursor: pointer;
              }
              .up {
                background-image: url(../../assets/images/up_arrow.png);
              }
              .down {
                background-image: url(../../assets/images/down_arrow.png);
              }
            }
            .question_r {
              display: inline-block;
              vertical-align: middle;
              width: 60%;
              height: 40px;
              overflow: hidden;
              box-sizing: border-box;
              li {
                height: 20px;
                border-bottom: 1px solid #f8f8f8;
                box-sizing: border-box;
              }
              li:hover {
                cursor: pointer;
                background: rgba(0, 0, 0, 0.4);
              }
              li:nth-last-child(1) {
                border-bottom: none;
              }
            }
            .open {
              overflow: visible;
              height: auto;
            }
          }
        }
      }
    }
  }
  .alert_modal {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #4a4a4a;
    opacity: 0.9;
    .close_box {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 210px;
      height: 125px;
      margin-left: -105px;
      margin-top: -62px;
      background: #f8f8f8;
      .close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
        background: url(../../assets/images/close.png) no-repeat;
      }
      .close:hover {
        cursor: pointer;
      }
      .msg {
        position: absolute;
        left: 50%;
        top: 30%;
        font-size: 14px;
        color: #333333;
        transform: translateX(-50%);
      }
      .confirm {
        @extend .btn;
        left: 20%;
        color: #f94955;
        border: 1px solid #f94955;
      }
      .cancel {
        @extend .btn;
        right: 20%;
        color: #999999;
      }
      .confirm:hover,
      .cancel:hover {
        cursor: pointer;
      }
    }
    .select_box {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 280px;
      height: 180px;
      margin-left: -140px;
      margin-top: -90px;
      background: #f8f8f8;
      border-radius: 5px;
      .close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
        background: url(../../assets/images/close.png) no-repeat;
      }
      .close:hover {
        cursor: pointer;
      }
      .title {
        position: absolute;
        left: 20px;
        top: 40px;
        font-size: 14px;
      }
      .select_bar {
        position: absolute;
        left: 20px;
        top: 70px;
        select {
          width: 110px;
          height: 30px;
          margin-right: 10px;
        }
      }
      .btn_bar {
        position: absolute;
        left: 20px;
        bottom: 30px;
        .confirm {
          position: absolute;
          @extend .btn;
          background: #4f71c9;
          color: #fff;
        }
        .cancel {
          position: absolute;
          @extend .btn;
          left: 70px;
          color: gray;
        }
        .confirm:hover {
          cursor: pointer;
        }
        .cancel:hover {
          cursor: pointer;
        }
      }
    }
    .score_box {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 280px;
      height: 320px;
      margin-left: -140px;
      margin-top: -160px;
      background: #fff;
      border-radius: 5px;
      .close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
        background: url(../../assets/images/close.png) no-repeat;
      }
      .close:hover {
        cursor: pointer;
      }
      .title {
        position: absolute;
        left: 20px;
        top: 10px;
      }
      .score_block {
        position: absolute;
        top: 40px;
        width: 100%;
        height: 280px;
        background: #f8f8f8;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
        .star {
          height: 60px;
          text-align: center;
          // line-height: 80px;
          img {
            margin-right: 15px;
            margin-top: 14px;
          }
          img:hover {
            cursor: pointer;
          }
        }
        .hint {
          height: 30px;
          text-align: center;
          line-height: 30px;
          color: gray;
        }
        .text {
          height: 100px;
          text-align: center;
          padding: 10px 20px;
          textarea {
            width: 100%;
            height: 100%;
            resize: none;
          }
        }
      }
      .btn_bar {
        .confirm {
          position: absolute;
          left: 20px;
          bottom: 20px;
          @extend .btn;
          padding: 0 15px;
          background: #4f71c9;
          color: #fff;
          border-radius: 5px;
        }
        .cancel {
          position: absolute;
          @extend .btn;
          left: 120px;
          bottom: 20px;
          padding: 0 15px;
          color: gray;
          border-radius: 5px;
        }
        .confirm:hover {
          cursor: pointer;
        }
        .cancel:hover {
          cursor: pointer;
        }
      }
    }
  }
  .comment_btn {
    position: absolute;
    bottom: 130px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #4f71c9;
    color: #fff;
    text-align: center;
    line-height: 40px;
    font-size: 10px;
  }
  .comment_btn:hover {
    cursor: pointer;
  }
}
</style>


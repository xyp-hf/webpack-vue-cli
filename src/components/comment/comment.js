export default {
    data() {
        return {
            opt1: [],
            opt2: [],
            questionDisc: "",
            name: "",
            mail: "",
            phone: "",
            parentTypeId: "",
            childTypeId: "",
        }
    },
    computed: {
        isShowCommentModal() {
            return this.$store.state.chat.isShowCommentModal;
        }
    },
    methods: {
        closeCommentModal() {
            this.$store.commit("SET_RUNX_IM_DISPLAY", true);
            this.$store.commit("SET_CHAT_DISPLAY", true);
            this.$store.commit("SET_IS_SHOW_COMMENT_MODAL", false);
        },
        submitComment() {
            if(this.parentTypeId.length === 0 || this.name.length === 0 || this.mail.length === 0) {
                alert("请填写必填项！");
                return;
            }
            if(!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(this.mail)) {
                alert("请输入正常的邮箱格式！");
                return;
            }
            // if(/^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/.test(this.phone)) {
            //     alert("请输入正确的手机号码格式！");
            //     return;
            // }
            this.$store.dispatch("UPLOAD_COMMENT", {
                orderContent: this.questionDisc,
                orderTypeId: this.childTypeId || this.parentTypeId,
                orderSource: "4",
                custName: this.name,
                custEmail: this.mail,
                custMobile: this.phone,
            }).then(_res => {
                alert("提交工单成功！");
                this.$store.commit("SET_IS_SHOW_COMMENT_MODAL", false);
                this.$store.commit("SET_CHAT_DISPLAY", true);
                this.questionDisc = this.name = this.mail = this.phone = "";
            }).catch(err => {
                alert("提交工单失败！", err);
            })
        },
        fetchCommentSelection(id) {
            return this.$store.dispatch("FETCH_COMMENT_SELECTION", {id});
        },
        selectParentType($event) {
            const select = $event.target;
            const index = select.selectedIndex;
            const id = this.opt1[index].id;
            this.parentTypeId = this.opt1[index].id;
            this.fetchCommentSelection(id).then(res => {
                this.opt2 = res.data.data;
            });
        },
        selectChildType($event) {
            const select = $event.target;
            const index = select.selectedIndex;
            this.childTypeId = this.opt1[index].id;
        }

    },
    mounted() {
        this.fetchCommentSelection(0).then(res => {
            this.opt1 = res.data.data;
            if(this.opt1.length !== 0) {
                this.parentTypeId = this.opt1[0].id;
                this.fetchCommentSelection(this.opt1[0].id).then(res => {
                    this.opt2 = res.data.data;
                    this.childTypeId = this.opt2[0].id;
                }).catch(err => {
                    console.log("childId列表获取失败！", err);
                });
            }
        }).catch(err => {
            console.log("parentId列表获取失败！", err);
        })
    }
};
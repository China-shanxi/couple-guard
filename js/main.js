// 全局数据key
const STORAGE_KEY = "coupleGuardData";
// 获取DOM元素
const setModal = document.getElementById("setModal");
const moodModal = document.getElementById("moodModal");
const saveSetBtn = document.getElementById("saveSet");
const closeMoodBtn = document.querySelector(".close-modal");
const msgInput = document.getElementById("msgInput");
const sendMsgBtn = document.getElementById("sendMsg");
const msgList = document.getElementById("msgList");
const missBtns = document.querySelectorAll(".miss-btn");
const moodBtns = document.querySelectorAll(".mood-btn");
const moodItems = document.querySelectorAll(".mood-item");

// 初始化默认数据
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    info: {
        nameA: "",
        nameB: "",
        startLove: "",
        meetDate: ""
    },
    today: {
        missA: 0,
        missB: 0,
        moodA: "",
        moodB: ""
    },
    messages: [],
    lastDate: new Date().toLocaleDateString()
};

// 保存数据到本地存储
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 重置每日数据（跨天自动清空想念、心情）
function resetTodayData() {
    const nowDate = new Date().toLocaleDateString();
    if(data.lastDate !== nowDate) {
        data.today = {
            missA:0, missB:0, moodA:"", moodB:""
        };
        data.lastDate = nowDate;
        saveData();
    }
}

// 计算恋爱天数
function countLoveDay() {
    if(!data.info.startLove) return 0;
    const start = new Date(data.info.startLove);
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diff;
}

// 计算见面倒计时
function countMeetDay() {
    if(!data.info.meetDate) return 0;
    const meet = new Date(data.info.meetDate);
    const now = new Date();
    const diff = Math.ceil((meet - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// 渲染页面所有数据
function renderPage() {
    resetTodayData();
    // 基础信息
    document.getElementById("showNameA").innerText = data.info.nameA || "我";
    document.getElementById("showNameB").innerText = data.info.nameB || "TA";
    document.getElementById("loveDays").innerText = countLoveDay();
    document.getElementById("meetDay").innerText = countMeetDay();
    // 今日想念次数
    document.getElementById("missA").innerText = data.today.missA;
    document.getElementById("missB").innerText = data.today.missB;
    // 今日心情
    document.getElementById("moodA").innerText = data.today.moodA || "未打卡";
    document.getElementById("moodB").innerText = data.today.moodB || "未打卡";
    // 渲染留言列表
    renderMsgList();
    // 判断是否需要弹出设置框
    if(!data.info.nameA || !data.info.nameB) {
        setModal.classList.remove("hide");
    } else {
        setModal.classList.add("hide");
    }
}

// 渲染留言
function renderMsgList() {
    msgList.innerHTML = "";
    data.messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "msg-item";
        div.innerHTML = `
            <span class="name-tag">${msg.from}：</span>
            <span>${msg.content}</span>
            <div style="font-size:12px;color:#999;margin-top:4px">${msg.time}</div>
        `;
        msgList.appendChild(div);
    })
}

// 保存情侣基础信息
saveSetBtn.addEventListener("click", () => {
    const nameA = document.getElementById("nameA").value.trim();
    const nameB = document.getElementById("nameB").value.trim();
    const startLove = document.getElementById("startLove").value;
    const meetDate = document.getElementById("meetDate").value;
    if(!nameA || !nameB || !startLove || !meetDate) {
        alert("请完整填写所有情侣信息！");
        return;
    }
    data.info = {nameA, nameB, startLove, meetDate};
    saveData();
    renderPage();
    alert("信息保存成功！");
})

// 想念次数+1
missBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const user = btn.dataset.user;
        if(user === "A") data.today.missA +=1;
        if(user === "B") data.today.missB +=1;
        saveData();
        renderPage();
    })
})

// 打开心情弹窗
let currentMoodUser = "";
moodBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        currentMoodUser = btn.dataset.user;
        moodModal.classList.remove("hide");
    })
})

// 关闭心情弹窗
closeMoodBtn.addEventListener("click", () => {
    moodModal.classList.add("hide");
})

// 选择心情保存
moodItems.forEach(item => {
    item.addEventListener("click", () => {
        const mood = item.dataset.val;
        if(currentMoodUser === "A") data.today.moodA = mood;
        if(currentMoodUser === "B") data.today.moodB = mood;
        saveData();
        renderPage();
        moodModal.classList.add("hide");
    })
})

// 发送悄悄话留言
sendMsgBtn.addEventListener("click", () => {
    const content = msgInput.value.trim();
    if(!content) {
        alert("请输入想对TA说的悄悄话！");
        return;
    }
    const nowTime = new Date().toLocaleString();
    const fromName = data.info.nameA;
    data.messages.push({
        from: fromName,
        content: content,
        time: nowTime
    });
    saveData();
    renderPage();
    msgInput.value = "";
})

// 页面加载完成渲染
window.onload = renderPage;

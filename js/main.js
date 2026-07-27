// 全局存储Key
const STORAGE_KEY = "coupleGuardData";
// DOM元素
const setModal = document.getElementById("setModal");
const moodModal = document.getElementById("moodModal");
const saveSetBtn = document.getElementById("saveSet");
const closeMoodBtn = document.querySelector(".close-modal");
const msgInput = document.getElementById("msgInput");
const sendMsgBtn = document.getElementById("sendMsg");
const msgList = document.getElementById("msgList");
const clearAllMsgBtn = document.getElementById("clearAllMsgBtn");
const missBtns = document.querySelectorAll(".miss-btn");
const moodBtns = document.querySelectorAll(".mood-btn");
const moodItems = document.querySelectorAll(".mood-item");
// 皮肤切换
const skinSwitchBtn = document.getElementById("skinSwitchBtn");
const skinPanel = document.getElementById("skinPanel");
const skinItems = document.querySelectorAll(".skin-item");
const closeSkinBtn = document.querySelector(".close-skin");
// 在线状态
const onlineSelect = document.getElementById("onlineSelect");
const selfOnlineText = document.getElementById("selfOnline");
const partnerOnlineText = document.getElementById("partnerOnline");
// 定位距离
const getLocationBtn = document.getElementById("getLocationBtn");
const distanceText = document.getElementById("distanceText");
// 纪念日
const anniName = document.getElementById("anniName");
const anniDate = document.getElementById("anniDate");
const addAnniBtn = document.getElementById("addAnniBtn");
const anniList = document.getElementById("anniList");
// 相册上传
const imgUpload = document.getElementById("imgUpload");
const albumGrid = document.getElementById("albumGrid");

// 初始化完整数据结构
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    info: {
        nameA: "",
        nameB: "",
        startLove: "",
        meetDate: "",
        myLng: "",
        myLat: "",
        taLng: "",
        taLat: "",
        skin: "skin-pink",
        selfOnline: "online"
    },
    today: {
        missA: 0,
        missB: 0,
        moodA: "",
        moodB: ""
    },
    messages: [],
    anniversaries: [],
    albumImages: [],
    lastDate: new Date().toLocaleDateString()
};

// 保存数据
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 跨天重置每日数据
function resetTodayData() {
    const nowDate = new Date().toLocaleDateString();
    if(data.lastDate !== nowDate) {
        data.today = {missA:0, missB:0, moodA:"", moodB:""};
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

// 见面倒计时
function countMeetDay() {
    if(!data.info.meetDate) return 0;
    const meet = new Date(data.info.meetDate);
    const now = new Date();
    const diff = Math.ceil((meet - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// 计算两点经纬度距离（公里）
function calcDistance(lat1,lng1,lat2,lng2) {
    const rad = Math.PI / 180;
    const a = Math.sin((lat2-lat1)*rad/2)**2 + Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin((lng2-lng1)*rad/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (6371 * c).toFixed(1);
}

// 渲染页面全部数据
function renderPage() {
    resetTodayData();
    // 皮肤初始化
    document.body.className = data.info.skin;
    onlineSelect.value = data.info.selfOnline;
    // 在线状态文字
    selfOnlineText.innerText = data.info.selfOnline === "online" ? "🟢 我在线" : "⚪ 我离开";
    partnerOnlineText.innerText = "⚪ TA离线（需对方填写在线状态）";
    // 基础信息
    document.getElementById("showNameA").innerText = data.info.nameA || "我";
    document.getElementById("showNameB").innerText = data.info.nameB || "TA";
    document.getElementById("loveDays").innerText = countLoveDay();
    document.getElementById("meetDay").innerText = countMeetDay();
    // 距离渲染
    if(data.info.myLat && data.info.myLng && data.info.taLat && data.info.taLng) {
        const dis = calcDistance(Number(data.info.myLat), Number(data.info.myLng), Number(data.info.taLat), Number(data.info.taLng));
        distanceText.innerText = dis + " 公里";
    } else {
        distanceText.innerText = "未获取定位";
    }
    // 今日想念次数
    document.getElementById("missA").innerText = data.today.missA;
    document.getElementById("missB").innerText = data.today.missB;
    // 今日心情
    document.getElementById("moodA").innerText = data.today.moodA || "未打卡";
    document.getElementById("moodB").innerText = data.today.moodB || "未打卡";
    // 渲染留言、纪念日、相册
    renderMsgList();
    renderAnniList();
    renderAlbum();
    // 判断是否弹出设置框
    if(!data.info.nameA || !data.info.nameB) {
        setModal.classList.remove("hide");
    } else {
        setModal.classList.add("hide");
    }
}

// 渲染留言列表（带单条删除按钮）
function renderMsgList() {
    msgList.innerHTML = "";
    data.messages.forEach((msg, index) => {
        const div = document.createElement("div");
        div.className = "msg-item";
        div.innerHTML = `
            <span class="name-tag">${msg.from}：</span>
            <span>${msg.content}</span>
            <div style="font-size:12px;color:#999;margin-top:4px">${msg.time}</div>
            <button class="del-single-msg" data-index="${index}">删除</button>
        `;
        msgList.appendChild(div);
    })
    // 单条留言删除事件
    document.querySelectorAll(".del-single-msg").forEach(btn=>{
        btn.addEventListener("click",()=>{
            const idx = Number(btn.dataset.index);
            data.messages.splice(idx,1);
            saveData();
            renderPage();
        })
    })
}

// 一键清空全部留言
clearAllMsgBtn.addEventListener("click",()=>{
    if(confirm("确定要清空所有悄悄话留言吗？无法恢复！")) {
        data.messages = [];
        saveData();
        renderPage();
    }
})

// 渲染纪念日列表
function renderAnniList() {
    anniList.innerHTML = "";
    data.anniversaries.forEach((item,index)=>{
        const target = new Date(item.date);
        const now = new Date();
        const diff = Math.ceil((target - now)/(1000*60*60*24));
        const dayText = diff > 0 ? `还有${diff}天` : "纪念日已过";
        const div = document.createElement("div");
        div.className = "anni-item";
        div.innerHTML = `
            <h4>${item.name}</h4>
            <p>日期：${item.date}</p>
            <p>${dayText}</p>
            <button class="del-anni" data-index="${index}">删除</button>
        `;
        anniList.appendChild(div);
    })
    // 删除单个纪念日
    document.querySelectorAll(".del-anni").forEach(btn=>{
        btn.addEventListener("click",()=>{
            const idx = Number(btn.dataset.index);
            data.anniversaries.splice(idx,1);
            saveData();
            renderPage();
        })
    })
}

// 新增纪念日
addAnniBtn.addEventListener("click",()=>{
    const name = anniName.value.trim();
    const date = anniDate.value;
    if(!name || !date) {
        alert("请填写纪念日名称和日期！");
        return;
    }
    data.anniversaries.push({name,date});
    saveData();
    renderPage();
    anniName.value = "";
    anniDate.value = "";
})

// 渲染相册图片
function renderAlbum() {
    albumGrid.innerHTML = "";
    data.albumImages.forEach((imgSrc,index)=>{
        const wrap = document.createElement("div");
        wrap.className = "album-img-wrap";
        wrap.innerHTML = `
            <img src="${imgSrc}" alt="情侣合照">
            <button class="del-album-img" data-index="${index}">×</button>
        `;
        albumGrid.appendChild(wrap);
    })
    // 删除单张图片
    document.querySelectorAll(".del-album-img").forEach(btn=>{
        btn.addEventListener("click",()=>{
            const idx = Number(btn.dataset.index);
            data.albumImages.splice(idx,1);
            saveData();
            renderPage();
        })
    })
}

// 相册图片上传（base64本地存储）
imgUpload.addEventListener("change",(e)=>{
    const files = e.target.files;
    for(let file of files) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            data.albumImages.push(ev.target.result);
            saveData();
            renderPage();
        }
        reader.readAsDataURL(file);
    }
    imgUpload.value = "";
})

// 获取当前定位坐标
getLocationBtn.addEventListener("click",()=>{
    if(!navigator.geolocation) {
        alert("你的浏览器不支持定位！");
        return;
    }
    navigator.geolocation.getCurrentPosition(pos=>{
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        data.info.myLat = lat;
        data.info.myLng = lng;
        saveData();
        renderPage();
        alert(`定位获取成功！\n纬度：${lat}\n经度：${lng}\n请把坐标发给对方填写到TA的定位框`);
    },err=>{
        alert("定位失败，请开启定位权限！");
    })
})

// 皮肤切换面板展开/关闭
skinSwitchBtn.addEventListener("click",()=>{
    skinPanel.classList.toggle("hide");
})
closeSkinBtn.addEventListener("click",()=>{
    skinPanel.classList.add("hide");
})
// 选择皮肤
skinItems.forEach(item=>{
    item.addEventListener("click",()=>{
        const skinClass = item.dataset.skin;
        data.info.skin = skinClass;
        saveData();
        renderPage();
        skinPanel.classList.add("hide");
    })
})

// 在线状态切换
onlineSelect.addEventListener("change",()=>{
    data.info.selfOnline = onlineSelect.value;
    saveData();
    renderPage();
})

// 保存情侣基础信息
saveSetBtn.addEventListener("click", () => {
    const nameA = document.getElementById("nameA").value.trim();
    const nameB = document.getElementById("nameB").value.trim();
    const startLove = document.getElementById("startLove").value;
    const meetDate = document.getElementById("meetDate").value;
    const myLng = document.getElementById("myLng").value.trim();
    const myLat = document.getElementById("myLat").value.trim();
    const taLng = document.getElementById("taLng").value.trim();
    const taLat = document.getElementById("taLat").value.trim();
    if(!nameA || !nameB || !startLove || !meetDate) {
        alert("请完整填写情侣基础信息！");
        return;
    }
    data.info = {
        ...data.info,
        nameA, nameB, startLove, meetDate,
        myLng, myLat, taLng, taLat
    };
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

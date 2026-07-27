import { savePairCode, getPairCode, syncAllCloudToLocal } from "./store.js";

// 页面跳转逻辑
document.querySelectorAll(".jump-link").forEach(item => {
    item.addEventListener("click", () => {
        const href = item.dataset.href;
        window.location.href = href;
    })
})

// 底部导航切换高亮
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");
    })
})

// ========== 情侣配对绑定交互 ==========
const pairCodeInput = document.getElementById("pairCodeInput");
const bindPairBtn = document.getElementById("bindPairBtn");
const syncAllBtn = document.getElementById("syncAllBtn");

// 回填已保存配对码
pairCodeInput.value = getPairCode();

// 绑定配对码按钮
bindPairBtn.addEventListener("click", async () => {
    const code = pairCodeInput.value.trim();
    if(!code) return alert("请输入配对码！");
    savePairCode(code);
    alert("绑定成功！已开启情侣双向云端同步，刷新页面生效");
    await syncAllCloudToLocal();
    location.reload();
})

// 一键拉取云端全部数据
syncAllBtn.addEventListener("click", async () => {
    const code = getPairCode();
    if(!code) return alert("请先绑定配对码！");
    alert("正在拉取云端情侣全部数据，请稍等...");
    await syncAllCloudToLocal();
    alert("云端数据同步完成！页面已刷新");
    location.reload();
})

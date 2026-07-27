// Firebase 初始化 无报错稳定版
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============ 替换为你自己Firebase项目配置 ============
const firebaseConfig = {
  apiKey: "填入你自己的apiKey",
  authDomain: "项目id.firebaseapp.com",
  projectId: "你的项目ID",
  storageBucket: "项目id.appspot.com",
  messagingSenderId: "数字ID",
  appId: "1:数字:web:xxxxxx"
};
// =============================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 全局情侣配对码
export let couplePairId = localStorage.getItem("couple_pair_id") || "";

// 设置配对码
export function setCouplePairId(id) {
  couplePairId = id.trim();
  localStorage.setItem("couple_pair_id", couplePairId);
}

// 获取数据集合（按配对码隔离情侣数据）
export function getColl(name) {
  return collection(db, "couple_data", couplePairId, name);
}

// 新增云端单条数据
export async function cloudAdd(collName, dataObj) {
  if (!couplePairId) throw new Error("请先绑定情侣配对码！");
  const coll = getColl(collName);
  await addDoc(coll, {
    ...dataObj,
    createTime: new Date()
  });
}

// 读取集合全部云端数据
export async function cloudGetAll(collName) {
  if (!couplePairId) return [];
  const coll = getColl(collName);
  const q = query(coll, orderBy("createTime", "desc"));
  const snapshot = await getDocs(q);
  const list = [];
  snapshot.forEach(doc => {
    list.push({ id: doc.id, ...doc.data() });
  });
  return list;
}

// 实时监听云端数据（双向同步核心，无内存泄漏）
export function cloudWatch(collName, callback) {
  if (!couplePairId) return () => {};
  const coll = getColl(collName);
  const q = query(coll, orderBy("createTime", "desc"));
  const unSub = onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    callback(list);
  });
  // 返回取消监听函数，页面关闭销毁
  return unSub;
}

// 清空集合全部云端数据
export async function cloudClearAll(collName) {
  if (!couplePairId) throw new Error("请先绑定情侣配对码！");
  const coll = getColl(collName);
  const snapshot = await getDocs(coll);
  const delTasks = [];
  snapshot.forEach(doc => delTasks.push(deleteDoc(doc.ref)));
  await Promise.all(delTasks);
}

export { db };

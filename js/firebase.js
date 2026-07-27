// Firebase 全局初始化
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

// ========== 替换为你自己Firebase后台的配置 ==========
const firebaseConfig = {
  apiKey: "替换成你的apiKey",
  authDomain: "替换成你的项目id.firebaseapp.com",
  projectId: "替换成你的项目id",
  storageBucket: "替换成你的项目id.appspot.com",
  messagingSenderId: "替换成数字id",
  appId: "1:数字id:web:一串字符"
};
// =========================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 全局情侣配对码
export let couplePairId = localStorage.getItem("couple_pair_id") || "";

// 设置配对码
export function setCouplePairId(id) {
  couplePairId = id.trim();
  localStorage.setItem("couple_pair_id", couplePairId);
}

// 获取数据集合（按配对码隔离数据）
export function getColl(name) {
  return collection(db, "couple_data", couplePairId, name);
}

// 新增云端单条数据
export async function cloudAdd(collName, dataObj) {
  if (!couplePairId) throw new Error("请先填写情侣配对码！");
  const coll = getColl(collName);
  await addDoc(coll, {
    ...dataObj,
    createTime: new Date()
  });
}

// 读取集合全部数据
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

// 实时监听云端数据变更（双向同步核心）
export function cloudWatch(collName, callback) {
  if (!couplePairId) return () => {};
  const coll = getColl(collName);
  const q = query(coll, orderBy("createTime", "desc"));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    callback(list);
  });
}

// 清空集合全部云端数据
export async function cloudClearAll(collName) {
  if (!couplePairId) throw new Error("请先填写情侣配对码！");
  const coll = getColl(collName);
  const snapshot = await getDocs(coll);
  const delList = [];
  snapshot.forEach(doc => delList.push(deleteDoc(doc.ref)));
  await Promise.all(delList);
}

export { db };

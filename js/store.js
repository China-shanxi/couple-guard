import {
  cloudAdd,
  cloudGetAll,
  cloudWatch,
  cloudClearAll,
  setCouplePairId,
  couplePairId
} from "./firebase.js";

// 本地存储key常量
const STORAGE_KEYS = {
  PAIR_ID: "couple_pair_id",
  DIARY: "couple_diary_list",
  MEMORY: "couple_memory_list",
  ALBUM: "couple_album_list",
  LOCATION: "couple_location_record"
};

// 云端同步开关
let syncEnable = !!localStorage.getItem(STORAGE_KEYS.PAIR_ID);

// 开启/关闭云端同步
export function toggleSync(enable) {
  syncEnable = enable;
}

// 本地读取封装
function localGet(key) {
  const str = localStorage.getItem(key);
  return str ? JSON.parse(str) : [];
}
// 本地写入封装
function localSet(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// ==================== 配对码管理 ====================
export function savePairCode(code) {
  setCouplePairId(code);
  syncEnable = true;
}
export function getPairCode() {
  return localStorage.getItem(STORAGE_KEYS.PAIR_ID) || "";
}

// ==================== 1、情侣日记 ====================
export function getDiaryList() {
  return localGet(STORAGE_KEYS.DIARY);
}
export async function addDiary(content) {
  const list = getDiaryList();
  const item = { time: new Date().toLocaleString(), text: content };
  list.unshift(item);
  if (list.length > 50) list.pop();
  localSet(STORAGE_KEYS.DIARY, list);
  // 开启同步上传云端
  if (syncEnable) await cloudAdd("diary", item);
}
export function watchDiaryCloud(callback) {
  return cloudWatch("diary", (cloudList) => {
    localSet(STORAGE_KEYS.DIARY, cloudList);
    callback(cloudList);
  });
}

// ==================== 2、纪念日 ====================
export function getMemoryList() {
  return localGet(STORAGE_KEYS.MEMORY);
}
export async function addMemory(name, date) {
  const list = getMemoryList();
  const item = { name, date };
  list.push(item);
  localSet(STORAGE_KEYS.MEMORY, list);
  if (syncEnable) await cloudAdd("memory", item);
}
export function watchMemoryCloud(callback) {
  return cloudWatch("memory", (cloudList) => {
    localSet(STORAGE_KEYS.MEMORY, cloudList);
    callback(cloudList);
  });
}

// ==================== 3、情侣相册 ====================
export function getAlbumList() {
  return localGet(STORAGE_KEYS.ALBUM);
}
export async function addAlbumImg(base64) {
  const list = getAlbumList();
  list.unshift(base64);
  if (list.length > 30) list.pop();
  localSet(STORAGE_KEYS.ALBUM, list);
  if (syncEnable) await cloudAdd("album", { imgBase64: base64 });
}
export function watchAlbumCloud(callback) {
  return cloudWatch("album", (cloudList) => {
    const formatList = cloudList.map(item => item.imgBase64);
    localSet(STORAGE_KEYS.ALBUM, formatList);
    callback(formatList);
  });
}

// ==================== 4、定位轨迹 ====================
export function getLocRecords() {
  return localGet(STORAGE_KEYS.LOCATION);
}
export async function addLocRecord(lat, lng) {
  const list = getLocRecords();
  const item = { time: new Date().toLocaleString(), latitude: lat, longitude: lng };
  list.unshift(item);
  if (list.length > 30) list.pop();
  localSet(STORAGE_KEYS.LOCATION, list);
  if (syncEnable) await cloudAdd("location", item);
}
export async function clearLocRecords() {
  localStorage.removeItem(STORAGE_KEYS.LOCATION);
  if (syncEnable) await cloudClearAll("location");
}
export function watchLocationCloud(callback) {
  return cloudWatch("location", (cloudList) => {
    localSet(STORAGE_KEYS.LOCATION, cloudList);
    callback(cloudList);
  });
}

// ==================== 一键拉取云端全部数据 ====================
export async function syncAllCloudToLocal() {
  if (!syncEnable) return;
  const diary = await cloudGetAll("diary");
  const memory = await cloudGetAll("memory");
  const albumRaw = await cloudGetAll("album");
  const location = await cloudGetAll("location");

  localSet(STORAGE_KEYS.DIARY, diary);
  localSet(STORAGE_KEYS.MEMORY, memory);
  localSet(STORAGE_KEYS.LOCATION, location);

  const albumList = albumRaw.map(item => item.imgBase64);
  localSet(STORAGE_KEYS.ALBUM, albumList);
}

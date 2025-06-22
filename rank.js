import { auth } from "./firebase-init.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();

const ranks = [
  { name: "ビギナー", point: 0 },
  { name: "スタートアップ", point: 100 },
  { name: "ブロンズ", point: 300 },
  { name: "シルバー", point: 700 },
  { name: "ゴールド", point: 1500 },
  { name: "プラチナ", point: 3000 },
  { name: "エリート", point: 5000 },
  { name: "VIP", point: 10000 },
  { name: "アルティメット", point: 20000 }
  { name: "Search 365 Up For Highest Rank", point: 1000000 }
];

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "auth.html";

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.exists() ? snap.data() : {};
  const points = data.points || 0;
  document.getElementById("current-points").textContent = points;

  let current = ranks[0];
  let next = null;

  for (let i = 0; i < ranks.length; i++) {
    if (points >= ranks[i].point) current = ranks[i];
    else {
      next = ranks[i];
      break;
    }
  }

  document.getElementById("rank-name").textContent = current.name;
  document.getElementById("next-goal").textContent = next
    ? `${next.name}まであと ${next.point - points} pt`
    : "最高ランクです！";

  const progress = next
    ? ((points - current.point) / (next.point - current.point)) * 100
    : 100;
  document.getElementById("progress").style.width = progress + "%";

  const list = document.getElementById("rank-list");
  list.innerHTML = "";
  for (const rank of ranks) {
    const li = document.createElement("li");
    li.innerHTML = `${rank.name}（${rank.point} pt〜）`;
    list.appendChild(li);
  }
});

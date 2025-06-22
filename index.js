import { auth } from "./firebase-init.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("ログインが必要です。");
    location.href = "auth.html";
    return;
  }

  document.getElementById("username").textContent = user.isAnonymous ? "ゲストユーザー" : user.email;
  const usertypeEl = document.getElementById("usertype");

  if (user.isAnonymous) {
    usertypeEl.textContent = "アカウント種別: 匿名（制限あり）";
    document.querySelectorAll(".premium-only").forEach(el => el.style.display = "none");
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const data = userDoc.exists() ? userDoc.data() : {};
  const plan = data.plan || "一般ユーザー";

  usertypeEl.textContent = "アカウント種別: " + plan;
  document.getElementById("point-count").textContent = data.points || 0;

  if (!plan.includes("プレミアム") && !plan.includes("VIP") && !plan.includes("Search365")) {
    document.querySelectorAll(".premium-only").forEach(el => el.style.display = "none");
  }

  // 選択中のテーマ読み込み
  const theme = data.theme || "light";
  document.body.className = `theme-${theme}`;
});

window.setTheme = async (mode) => {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;

  document.body.className = `theme-${mode}`;
  await updateDoc(doc(db, "users", user.uid), { theme: mode });
};

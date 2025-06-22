import { auth } from "./firebase-init.js";
import {
  getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();
const emailEl = document.getElementById("user-email");
const planEl = document.getElementById("user-plan");
const themeEl = document.getElementById("current-theme");
const ttlInfo = document.getElementById("ttl-info");
const distList = document.getElementById("distributed-list");

let currentUser, userData;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (!user) return location.href = "auth.html";
  emailEl.textContent = user.email || "匿名";

  if (user.isAnonymous) {
    planEl.textContent = "匿名ゲスト";
    ttlInfo.style.display = "block";
    ttlInfo.textContent = "このアカウントは1週間後に自動削除されます。";
    document.querySelectorAll(".premium-only, .distributable-only").forEach(e => e.remove());
    return;
  }

  const docSnap = await getDoc(doc(db, "users", user.uid));
  userData = docSnap.exists() ? docSnap.data() : {};
  const plan = userData.plan || "一般ユーザー";
  const theme = userData.theme || "light";
  planEl.textContent = plan;
  themeEl.textContent = theme;

  document.body.className = `theme-${theme}`;

  if (plan.includes("ファミリー") || plan.includes("Business") || plan.includes("Education")) {
    loadDistributedUsers();
  } else {
    document.querySelector(".distributable-only")?.remove();
  }

  const notify = localStorage.getItem("notify-enabled") === "true";
  document.getElementById("notify-toggle").checked = notify;
});

window.setTheme = async (theme) => {
  if (!currentUser || currentUser.isAnonymous) return;
  document.body.className = `theme-${theme}`;
  themeEl.textContent = theme;
  await updateDoc(doc(db, "users", currentUser.uid), { theme });
};

window.distribute = async () => {
  const inviteEmail = document.getElementById("invite-email").value.trim();
  if (!inviteEmail) return alert("メールを入力してください");
  await updateDoc(doc(db, "users", currentUser.uid), {
    distributed: arrayUnion(inviteEmail)
  });
  alert("分配しました");
  loadDistributedUsers();
};

const loadDistributedUsers = async () => {
  const list = userData?.distributed || [];
  distList.innerHTML = "<ul>" + list.map(email => `<li>${email}</li>`).join("") + "</ul>";
};

document.getElementById("notify-toggle").addEventListener("change", (e) => {
  localStorage.setItem("notify-enabled", e.target.checked);
});

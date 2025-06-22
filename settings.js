import { auth } from "./firebase-init.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("ログインが必要です");
    location.href = "auth.html";
    return;
  }

  document.getElementById("email").textContent = user.email;

  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    const plan = data.plan || "一般ユーザー";
    document.getElementById("rank").textContent = plan;

    // プレミアム以上ならテーマ・分配解放
    if (plan !== "一般ユーザー") {
      document.getElementById("theme-section").style.display = "block";

      if (["ファミリープレミアム会員", "Basic Businesses会員", "Search365 Up For Business会員", "Search365 Up For Education 会員", "Search365 Up For Education Unlimited 会員"].includes(plan)) {
        document.getElementById("license-section").style.display = "block";
        setupLicenseSharing(user.uid);
      }
    }
  } else {
    document.getElementById("rank").textContent = "未登録";
  }
});

// テーマ切替処理
document.getElementById("theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// 分配機能（Firestoreに追加）
function setupLicenseSharing(ownerUid) {
  document.getElementById("invite-btn").addEventListener("click", async () => {
    const email = document.getElementById("invite-email").value.trim();
    if (!email) return;

    const inviteResult = document.getElementById("invite-result");
    try {
      const inviteRef = doc(db, "licenseInvites", ownerUid);
      await setDoc(inviteRef, {
        shared: arrayUnion(email)
      }, { merge: true });

      inviteResult.textContent = `分配成功：${email}`;
    } catch (err) {
      console.error(err);
      inviteResult.textContent = "分配に失敗しました";
    }
  });
}

import { auth } from "./firebase-init.js";
import {
  getFirestore,
  doc,
  getDoc,
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

  const pointsEl = document.getElementById("points");
  const historyList = document.getElementById("history-list");

  const userDocRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userDocRef);

  if (!userSnap.exists()) {
    pointsEl.textContent = "0";
    historyList.innerHTML = "<li>履歴はありません</li>";
    return;
  }

  const userData = userSnap.data();
  pointsEl.textContent = userData.points || 0;

  if (userData.rewardHistory && userData.rewardHistory.length > 0) {
    historyList.innerHTML = "";
    userData.rewardHistory.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${new Date(entry.date).toLocaleString()}: ${entry.action} (+${entry.points}pt)`;
      historyList.appendChild(li);
    });
  } else {
    historyList.innerHTML = "<li>履歴はありません</li>";
  }
});

// ポイント付与（例：検索時などに呼ぶ想定）
export async function addRewardPoints(userId, points, actionDescription) {
  const userDocRef = doc(db, "users", userId);
  const userSnap = await getDoc(userDocRef);
  let newPoints = points;

  if (userSnap.exists()) {
    const data = userSnap.data();
    newPoints += data.points || 0;
  }

  await updateDoc(userDocRef, {
    points: newPoints,
    rewardHistory: arrayUnion({
      date: new Date().toISOString(),
      points,
      action: actionDescription
    })
  });
}

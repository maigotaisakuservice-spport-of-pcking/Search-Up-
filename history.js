import { auth } from "./firebase-init.js";
import {
  getFirestore, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getDatabase, ref, get, set
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const db = getFirestore();
const rtdb = getDatabase();

const listEl = document.getElementById("history-list");
const clearBtn = document.getElementById("clear-all");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("ログインが必要です");
    location.href = "auth.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  const isPremium = userData.plan && userData.plan !== "一般ユーザー";

  if (user.isAnonymous) {
    listEl.innerHTML = "<li>匿名アカウントでは履歴は保存されません。</li>";
    clearBtn.style.display = "none";
    return;
  }

  if (isPremium) {
    const history = userData.history || [];
    renderHistory(history, async (newHistory) => {
      await updateDoc(doc(db, "users", user.uid), {
        history: newHistory
      });
      location.reload();
    });
  } else {
    const snap = await get(ref(rtdb, "history/" + user.uid));
    const history = snap.exists() ? snap.val() : [];
    renderHistory(history, async (newHistory) => {
      await set(ref(rtdb, "history/" + user.uid), newHistory);
      location.reload();
    });
  }
});

function renderHistory(history, onUpdate) {
  listEl.innerHTML = "";
  if (!history || history.length === 0) {
    listEl.innerHTML = "<li>履歴はありません。</li>";
    return;
  }

  history.forEach((entry, index) => {
    const li = document.createElement("li");
    const dateStr = new Date(entry.date).toLocaleString();
    li.textContent = `[${dateStr}] ${entry.query}`;

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.onclick = () => {
      const updated = [...history];
      updated.splice(index, 1);
      onUpdate(updated);
    };
    li.appendChild(btn);
    listEl.appendChild(li);
  });

  clearBtn.onclick = () => {
    if (confirm("履歴を全て削除しますか？")) {
      onUpdate([]);
    }
  };
}

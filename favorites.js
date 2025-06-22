import { auth } from "./firebase-init.js";
import {
  getFirestore, doc, getDoc, updateDoc, arrayRemove
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getDatabase, ref, get, set, update, remove
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const db = getFirestore();
const rtdb = getDatabase();

const listEl = document.getElementById("favorites-list");

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
    listEl.innerHTML = "<li>匿名アカウントではお気に入り機能は利用できません。</li>";
    return;
  }

  if (isPremium) {
    // Firestoreから取得
    const favorites = userData.favorites || [];
    renderFavorites(favorites, async (item) => {
      await updateDoc(doc(db, "users", user.uid), {
        favorites: favorites.filter(f => f !== item)
      });
      location.reload();
    });
  } else {
    // RealtimeDBから取得
    const snap = await get(ref(rtdb, "favorites/" + user.uid));
    const favorites = snap.exists() ? snap.val() : [];
    renderFavorites(favorites, async (item) => {
      const updated = favorites.filter(f => f !== item);
      await set(ref(rtdb, "favorites/" + user.uid), updated);
      location.reload();
    });
  }
});

function renderFavorites(favorites, onDelete) {
  listEl.innerHTML = "";
  if (favorites.length === 0) {
    listEl.innerHTML = "<li>お気に入りはありません。</li>";
    return;
  }

  favorites.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.onclick = () => onDelete(item);
    li.appendChild(btn);

    listEl.appendChild(li);
  });
}

import { auth } from "./firebase-init.js";
import { getFirestore, doc, updateDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { addRewardPoints } from "./rewards.js"; // 既存機能

const db = getFirestore();
const rtdb = getDatabase();
const input = document.getElementById("search-input");
const button = document.getElementById("search-button");
const results = document.getElementById("results");

let currentUser;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
});

button.addEventListener("click", async () => {
  const keyword = input.value.trim();
  if (!keyword) return;

  results.textContent = "検索中…";

  // GAS経由でWikipediaAPI検索
  const apiURL = `https://script.google.com/macros/s/YOUR_DEPLOYED_GAS_URL/exec?q=${encodeURIComponent(keyword)}`;
  const res = await fetch(apiURL);
  const data = await res.json();

  const originalText = data.summary || "結果が見つかりませんでした。";
  results.textContent = "要約中…";

  // フロントエンドPython（Pyodide）で要約
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const code = `
def summarize(text):
    lines = text.split('.')
    return '.'.join(lines[:2]) + '.' if len(lines) > 2 else text

summarize("""${originalText}""")
  `;
  const summary = await pyodide.runPythonAsync(code);
  results.innerHTML = `<p><strong>要約:</strong> ${summary}</p><p><em>全文:</em> ${originalText}</p>`;

  // 保存処理（履歴・リワード・お気に入り用の履歴のみ）
  if (currentUser && !currentUser.isAnonymous) {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userDocRef);
    const isPremium = userSnap.exists() && userSnap.data().plan !== "一般ユーザー";

    const record = { query: keyword, date: new Date().toISOString() };

    if (isPremium) {
      await updateDoc(userDocRef, {
        history: arrayUnion(record)
      });
    } else {
      const snap = await get(ref(rtdb, "history/" + currentUser.uid));
      const current = snap.exists() ? snap.val() : [];
      current.push(record);
      await set(ref(rtdb, "history/" + currentUser.uid), current);
    }

    // リワード付与
    await addRewardPoints(currentUser.uid, 1, "検索実行");
  }
});

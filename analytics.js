import { auth } from "./firebase-init.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const db = getFirestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "auth.html";

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if (!userData || !userData.plan || userData.plan === "free") {
    alert("この機能はプレミアムプラン以上のユーザー向けです。");
    location.href = "index.html";
    return;
  }

  const q = query(collection(db, "search_logs"), where("uid", "==", user.uid));
  const snap = await getDocs(q);
  const logs = [];
  snap.forEach(doc => logs.push(doc.data()));

  if (logs.length === 0) {
    document.body.innerHTML += "<p>データがありません。</p>";
    return;
  }

  renderSearchTrend(logs);
  renderTimeChart(logs);
  renderKeywordRanking(logs);
  renderStats(logs);
});

function renderSearchTrend(logs) {
  const counts = {};
  for (const log of logs) {
    const date = new Date(log.timestamp).toLocaleDateString();
    counts[date] = (counts[date] || 0) + 1;
  }

  const labels = Object.keys(counts).sort();
  const data = labels.map(label => counts[label]);

  new Chart(document.getElementById("searchTrendChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "検索数",
        data,
        borderColor: "#4caf50",
        fill: false,
      }]
    }
  });
}

function renderTimeChart(logs) {
  const hours = Array(24).fill(0);
  for (const log of logs) {
    const h = new Date(log.timestamp).getHours();
    hours[h]++;
  }

  new Chart(document.getElementById("timeChart"), {
    type: "bar",
    data: {
      labels: hours.map((_, i) => `${i}時`),
      datasets: [{
        label: "検索数",
        data: hours,
        backgroundColor: "#81c784"
      }]
    }
  });
}

function renderKeywordRanking(logs) {
  const count = {};
  for (const log of logs) {
    const keyword = log.query;
    count[keyword] = (count[keyword] || 0) + 1;
  }

  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const ol = document.getElementById("keyword-list");
  ol.innerHTML = sorted.map(([kw, c]) => `<li>${kw} (${c}回)</li>`).join("");
}

function renderStats(logs) {
  const total = logs.length;
  const dates = logs.map(l => l.timestamp).sort();
  const start = new Date(dates[0]);
  const end = new Date(dates[dates.length - 1]);
  const days = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
  const avg = Math.round(total / days);

  const ul = document.getElementById("stats-list");
  ul.innerHTML = `
    <li>総検索回数: ${total} 回</li>
    <li>平均検索/日: ${avg} 回</li>
    <li>初回利用日: ${start.toLocaleDateString()}</li>
  `;
}

// main.js

// 検索ボタン押下時の処理
document.getElementById("search-btn").addEventListener("click", async () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  const resultsSection = document.getElementById("results");
  resultsSection.innerHTML = "<p>検索中...</p>";

  try {
    const summary = await fetchSummaryFromWikipedia(query);
    const aiSummary = generateAISummary(summary);
    resultsSection.innerHTML = `
      <h2>検索結果: ${query}</h2>
      <p>${aiSummary}</p>
    `;
  } catch (err) {
    resultsSection.innerHTML = `<p>検索に失敗しました。ネットワークやAPIを確認してください。</p>`;
    console.error(err);
  }
});

// Wikipedia APIまたはGAS経由で取得（後でGAS切替可）
async function fetchSummaryFromWikipedia(query) {
  const apiUrl = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("APIエラー");
  const data = await res.json();
  return data.extract || "要約が見つかりませんでした。";
}

// 簡易AI要約（文字数カット版）後で高度化
function generateAISummary(text) {
  const maxLength = 200;
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

// テーマ切り替え（プレミアム判定は後で追加予定）
document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // 例：テーマボタンがあれば機能追加
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
});

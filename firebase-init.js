// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCVRiicitvucJMgWCA25bDIa3dcxB4gpQw",
  authDomain: "search-up-catch.firebaseapp.com",
  databaseURL: "https://search-up-catch-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "search-up-catch",
  storageBucket: "search-up-catch.firebasestorage.app",
  messagingSenderId: "845861308360",
  appId: "1:845861308360:web:b175e4d53f32f1ff6f62fd",
  measurementId: "G-VJP3S94747"
};

// 初期化
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// 認証状態の監視（ログイン済みかどうか）
onAuthStateChanged(auth, (user) => {
  const authLink = document.getElementById('auth-link');
  if (user) {
    // ログイン中
    authLink.textContent = "マイページ";
    authLink.href = "settings.html";
  } else {
    // 未ログイン
    authLink.textContent = "ログイン";
    authLink.href = "auth.html";
  }
});

// 他ファイルで使えるように export
export { app, auth };

// auth.js
import { auth } from "./firebase-init.js";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const sendBtn = document.getElementById("send-link");
const messageEl = document.getElementById("message");
const emailInput = document.getElementById("email");

sendBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    messageEl.textContent = "メールアドレスを入力してください。";
    return;
  }

  const actionCodeSettings = {
    url: location.href, // このURLに戻ってくる
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
    messageEl.textContent = "ログインリンクを送信しました。メールをご確認ください。";
  } catch (error) {
    console.error(error);
    messageEl.textContent = "送信に失敗しました。メールアドレスが有効か確認してください。";
  }
});

// リンクからの認証処理（URLにcodeがある場合）
window.addEventListener("DOMContentLoaded", async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    const email = window.localStorage.getItem("emailForSignIn") || window.prompt("確認のため、メールアドレスを再入力してください");

    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem("emailForSignIn");
      window.location.href = "settings.html"; // ログイン成功後に遷移
    } catch (error) {
      console.error("ログインに失敗:", error);
    }
  }
});

"use client";

import { useState } from "react";
import styles from "../page.module.css";

export default function ToolTextCount() {
  const [text, setText] = useState("");

  const charCount = [...text].length;
  const stringLength = text.length;
  const byteCount = new Blob([text]).size;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>文字数カウント</h1>
          <p>入力されたテキストの字数を数えるツール</p>
          <textarea
            placeholder="テキスト"
            style={{ width: "100%" }}
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <p>文字数: <span style={{ color: "var(--link)" }}>{charCount}</span></p>
          <p>文字列長: {stringLength}</p>
          <p>バイト数: {byteCount}</p>
        </section>
      </main>
    </div>
  );
}

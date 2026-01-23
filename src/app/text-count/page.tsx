"use client";

import { useState } from "react";
import styles from "../page.module.css";

export default function ToolTextCount() {
  const [includeLineBreak, setIncludeLineBreak] = useState(false);
  const [includeSpace, setIncludeSpace] = useState(false);
  const [text, setText] = useState("");

  const fixedText = text
    .replace(/\r?\n/g, includeLineBreak ? "\n" : "")
    .replace(/ /g, includeSpace ? " " : "");

  const charCount = [...fixedText].length;
  const stringLength = fixedText.length;
  const byteCount = new Blob([fixedText]).size;

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
          <br />
          <input type="checkbox" id="includeLineBreak" checked={includeLineBreak} onChange={(e) => {
            setIncludeLineBreak((e.target as HTMLInputElement).checked);
          }} />
          <label htmlFor="includeLineBreak">改行を数える</label>
          <br />
          <input type="checkbox" id="includeSpace" checked={includeSpace} onChange={(e) => {
            setIncludeSpace((e.target as HTMLInputElement).checked);
          }} />
          <label htmlFor="includeSpace">スペースを数える</label>
          <br /><br />

          <p>文字数: <span style={{ color: "var(--link)" }}>{charCount}</span></p>
          <p>文字列長: {stringLength}</p>
          <p>バイト数: {byteCount}</p>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

type MediaDevice = {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
};

export default function ToolMediaDevices() {
  const [enableLog, setEnableLog] = useState(false);
  const [devices, setDevices] = useState<MediaDevice[]>([]);

  function log(str: any) {
    if (!enableLog) return;
    const log = document.getElementById("log") as HTMLTextAreaElement;
    log.value += str + "\n";
  }

  useEffect(() => {
    async function fetchDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setDevices(devices);

        log(JSON.stringify(devices, null, 2));
      } catch (err) {
        log("エラー: " + err);
      }
    }

    fetchDevices();
  });

  function kindToLabel(kind: string) {
    switch (kind) {
      case "videoinput":
        return "カメラ";
      case "audioinput":
        return "マイク";
      case "audiooutput":
        return "スピーカー";
      default:
        return kind;
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>メディアデバイスの情報</h1>
          <p>カメラ、マイク、スピーカーなどのデバイス情報を取得するツール</p>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>種類</th>
                <th style={{ textAlign: "left" }}>ラベル</th>
                <th style={{ textAlign: "left" }}>デバイスID</th>
                <th style={{ textAlign: "left" }}>グループID</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                <tr key={i}>
                  <td>{kindToLabel(d.kind)}</td>
                  <td>{d.label || "(ラベルなし)"}</td>
                  <td>{d.deviceId}</td>
                  <td>{d.groupId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h1>ログ</h1>
          <textarea id="log" placeholder="..." style={{width: "100%"}} rows={4} disabled></textarea>
          <input type="checkbox" id="enableLog" checked={enableLog} onChange={(e) => {
            setEnableLog((e.target as HTMLInputElement).checked);
          }} />
          <label htmlFor="enableLog">ログを有効にする</label>
        </section>
      </main>
    </div>
  );
}

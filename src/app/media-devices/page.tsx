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
  const [enableVideoInput, setEnableVideoInput] = useState(true);
  const [enableAudioInput, setEnableAudioInput] = useState(true);
  const [enableAudioOutput, setEnableAudioOutput] = useState(true);
  const [viewDeviceId, setViewDeviceId] = useState(true);
  const [viewGroupId, setViewGroupId] = useState(true);

  function log(str: any) {
    if (!enableLog) return;
    const log = document.getElementById("log") as HTMLTextAreaElement;
    log.value += str + "\n";
  }

  async function fetchDevices() {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices(devices);

      log(JSON.stringify(userMedia, null, 2))
      log(JSON.stringify(devices, null, 2));
    } catch (err) {
      log("エラー: " + err);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

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

          <label htmlFor="audioinput">マイク</label>
          <input type="checkbox" id="audioinput" checked={enableAudioInput} onChange={(e) => {
            setEnableAudioInput((e.target as HTMLInputElement).checked);
          }}/>
          <label htmlFor="videoinput">カメラ</label>
          <input type="checkbox" id="videoinput" checked={enableVideoInput} onChange={(e) => {
            setEnableVideoInput((e.target as HTMLInputElement).checked);
          }}/>
          <label htmlFor="audiooutput">スピーカー</label>
          <input type="checkbox" id="audiooutput" checked={enableAudioOutput} onChange={(e) => {
            setEnableAudioOutput((e.target as HTMLInputElement).checked);
          }}/><br />

          <input type="button" value="再試行" id="retry" onClick={
            (e) => {
              fetchDevices();
            }
          } /><br /><br />

          <label htmlFor="viewDeviceId">デバイスID</label>
          <input type="checkbox" id="viewDeviceId" checked={viewDeviceId} onChange={(e) => {
            setViewDeviceId((e.target as HTMLInputElement).checked);
          }}/>
          <label htmlFor="viewGroupId">グループID</label>
          <input type="checkbox" id="viewGroupId" checked={viewGroupId} onChange={(e) => {
            setViewGroupId((e.target as HTMLInputElement).checked);
          }}/><br />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>種類</th>
                <th style={{ textAlign: "left" }}>ラベル</th>
                {viewDeviceId && <th style={{ textAlign: "left" }}>デバイスID</th>}
                {viewGroupId && <th style={{ textAlign: "left" }}>グループID</th>}
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => (
                d.kind === "audioinput" && !enableAudioInput ||
                d.kind === "videoinput" && !enableVideoInput ||
                d.kind === "audiooutput" && !enableAudioOutput ? null : (
                <tr key={i}>
                  <td>{kindToLabel(d.kind)}</td>
                  <td>{d.label || "(ラベルなし)"}</td>
                  {viewDeviceId && <td style={{ wordBreak: "break-all" }}>{d.deviceId}</td>}
                  {viewGroupId && <td style={{ wordBreak: "break-all" }}>{d.groupId}</td>}
                </tr>)
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

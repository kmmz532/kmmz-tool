"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

type MediaDevice = {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
};

export default function ToolCameraInfo() {
  const [enableLog, setEnableLog] = useState(false);
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [viewDeviceId, setViewDeviceId] = useState(false);
  const [viewGroupId, setViewGroupId] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<Record<string, any>>({});

  function log(str: any) {
    if (!enableLog) return;
    const log = document.getElementById("log") as HTMLTextAreaElement;
    log.value += str + "\n";
  }

  async function fetchDevices() {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({ video: true });
      userMedia.getTracks().forEach(t => t.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices(devices);

      const info: Record<string, any> = {};

      for (const d of devices) {
        if (d.kind !== "videoinput") continue;
        info[d.deviceId] = await probeCamera(d.deviceId);
      }

      setCameraInfo(info);

      log(JSON.stringify(userMedia, null, 2));
      log(JSON.stringify(devices, null, 2));
    } catch (err) {
      log("エラー: " + err);
    }
  }

  async function probeCamera(deviceId: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 3840 },
        height: { ideal: 2160 }
      }
    });

    const track = stream.getVideoTracks()[0];
    const caps = track.getCapabilities();
    log(JSON.stringify(caps, null, 2));
    const settings = track.getSettings();
    track.stop();

    return {settings, caps};
  }

  function judgeFacing(settings: any) {
    if (!settings?.facingMode) return "不明";
    if (settings.facingMode === "user") return "フロント";
    if (settings.facingMode === "environment") return "バック";
    return "不明";
  }

  function judgeWide(settings: any, caps?: any) {
    // iphone
    if (caps?.zoom?.min < 1) return "超広角";

    let score = 0;

    if (!settings?.width) return "標準/不明";

    // 解像度が小さいならば広角かも
    if (settings.width && settings.width < 3000) score += 1;

    // 最短撮影距離が短い
    if (caps?.focusDistance?.min === 0) score += 1;

    // 横に広い
    if (settings.width && settings.height) {
      const ratio = settings.width / settings.height;
      if (ratio > 1.5) score += 1;
    }

    if (score >= 2) return "広角の可能性: " + score;
    return "標準/不明";
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>カメラ</h1>
          <p>カメラのデバイス情報を取得するツール</p>

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

          <div style={{ overflowX: "scroll" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>ラベル</th>
                  <th>向き</th>
                  <th>画角</th>
                  <th>解像度</th>
                  <th>横/縦</th>
                  {viewDeviceId && <th style={{ textAlign: "left" }}>デバイスID</th>}
                  {viewGroupId && <th style={{ textAlign: "left" }}>グループID</th>}
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  d.kind !== "videoinput" ? null : (
                  <tr key={i}>
                    <td>{d.label || "(ラベルなし)"}</td>
                    <td>{judgeFacing(cameraInfo[d.deviceId]?.settings)}</td>
                    <td>{judgeWide(
                      cameraInfo[d.deviceId]?.settings,
                      cameraInfo[d.deviceId]?.caps
                    )}</td>
                    <td>
                      {cameraInfo[d.deviceId]?.settings.width}x
                      {cameraInfo[d.deviceId]?.settings.height}
                    </td>
                    <td>
                      {cameraInfo[d.deviceId]?.settings.width && cameraInfo[d.deviceId]?.settings.height
                        ? (cameraInfo[d.deviceId].settings.width / cameraInfo[d.deviceId].settings.height).toFixed(2)
                        : "不明"}
                    </td>
                    {viewDeviceId && <td style={{ wordBreak: "break-all" }}>{d.deviceId}</td>}
                    {viewGroupId && <td style={{ wordBreak: "break-all" }}>{d.groupId}</td>}
                  </tr>)
                ))}
              </tbody>
            </table>
          </div>
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

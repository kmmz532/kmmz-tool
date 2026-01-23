"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import curlStyles from "./curl.module.css";

type SavedRequest = {
  requestName: string;
  url: string;
  method: string;
  headers: string;
  body: string;
  userAgent: string;
};

type ApiGroup = {
  groupName: string;
  requests: SavedRequest[];
};

const STORAGE_KEY = "curl-tool";

export default function ToolCurl() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("Content-Type: application/json");
  const [body, setBody] = useState("");
  const [userAgent, setUserAgent] = useState("curl/1.0");

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const [selectedRequest, setSelectedRequest] = useState(""); // "groupName::requestName"
  const [groupName, setGroupName] = useState("デフォルト");
  const [requestName, setRequestName] = useState("");

  useEffect(() => {
    const groupsRaw = localStorage.getItem(STORAGE_KEY);
    if (groupsRaw) {
      try {
        setApiGroups(JSON.parse(groupsRaw));
        return;
      } catch (e) {
        console.error("Failed to parse API groups from localStorage", e);
      }
    }
  }, []);

  const persistGroups = (groups: ApiGroup[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  };

  const handleSave = () => {
    if (!groupName || !requestName) {
      alert("グループ名とリクエスト名を入力してください。");
      return;
    }

    const newRequest: SavedRequest = { requestName, url, method, headers, body, userAgent };
    const newGroups = [...apiGroups];
    let group = newGroups.find(g => g.groupName === groupName);

    if (group) {
      const requestIndex = group.requests.findIndex(r => r.requestName === requestName);
      if (requestIndex > -1) {
        group.requests[requestIndex] = newRequest;
      } else {
        group.requests.push(newRequest);
      }
    } else {
      group = { groupName, requests: [newRequest] };
      newGroups.push(group);
    }
    
    setApiGroups(newGroups);
    persistGroups(newGroups);
    alert(`グループ「${groupName}」にリクエスト「${requestName}」を保存しました。`);
  };

  const handleLoad = () => {
    if (!selectedRequest) return;
    const [gName, rName] = selectedRequest.split("::");
    const group = apiGroups.find(g => g.groupName === gName);
    const request = group?.requests.find(r => r.requestName === rName);

    if (request) {
      setUrl(request.url);
      setMethod(request.method);
      setHeaders(request.headers);
      setBody(request.body);
      setUserAgent(request.userAgent);
      setGroupName(gName);
      setRequestName(rName);
    }
  };

  const handleDelete = () => {
    if (!selectedRequest) return;
    if (!confirm(`リクエスト「${selectedRequest.replace("::", " > ")}」を本当に削除しますか？`)) return;
    
    const [gName, rName] = selectedRequest.split("::");
    let newGroups = [...apiGroups];
    const group = newGroups.find(g => g.groupName === gName);

    if (group) {
        group.requests = group.requests.filter(r => r.requestName !== rName);
        if (group.requests.length === 0) {
            newGroups = newGroups.filter(g => g.groupName !== gName);
        }
        setApiGroups(newGroups);
        persistGroups(newGroups);
        setSelectedRequest("");
    }
  };

  const handleExport = () => {
    const groupsRaw = localStorage.getItem(STORAGE_KEY);
    if (!groupsRaw) {
      alert("エクスポートするデータがありません。");
      return;
    }

    try {
      const prettyJson = JSON.stringify(JSON.parse(groupsRaw), null, 2);
      const blob = new Blob([prettyJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      a.download = `curl-tool-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("エクスポートに失敗しました。", e);
      alert("エクスポートに失敗しました。");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("現在の設定は上書きされます。よろしいですか？")) {
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;
      try {
        const importedGroups = JSON.parse(text);
        if (Array.isArray(importedGroups)) {
          setApiGroups(importedGroups);
          persistGroups(importedGroups);
          alert("インポートに成功しました。");
        } else {
          throw new Error("無効なファイル形式です。");
        }
      } catch (err) {
        console.error("インポートエラー", err);
        alert(`インポートに失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    const requestHeaders = new Headers();
    headers.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        requestHeaders.append(key.trim(), valueParts.join(":").trim());
      }
    });
    requestHeaders.set("User-Agent", userAgent);

    try {
      const res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: method !== "GET" && method !== "HEAD" ? body : undefined,
      });
      const responseText = await res.text();
      setResponse(responseText);
    } catch (err: any) {
      setError(`リクエストエラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(response);
      setResponse(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert("有効なJSONではありません。");
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response).then(
      () => alert("レスポンスをクリップボードにコピーしました。"),
      () => alert("コピーに失敗しました。")
    );
  };

  return (
    <div className={styles.page}>
      <main className={`${styles.main} ${curlStyles.wideMain}`}>
        <div className={curlStyles.container}>
          <h1>HTTPリクエスト</h1>
          <p>ウェブ上でHTTPリクエストを行い、APIのデバッグや動作確認ができるツール</p>

          <section className={styles.section}>
            <h2>管理</h2>
            <div className={curlStyles.apiManagement}>
              <select
                className={`${curlStyles.select} ${curlStyles.apiSelect}`}
                value={selectedRequest}
                onChange={(e) => setSelectedRequest(e.target.value)}
              >
                <option value="">保存済みのリクエストを選択...</option>
                {apiGroups.map(group => (
                    <optgroup key={group.groupName} label={group.groupName}>
                        {group.requests.map(req => (
                            <option key={`${group.groupName}::${req.requestName}`} value={`${group.groupName}::${req.requestName}`}>
                                {req.requestName}
                            </option>
                        ))}
                    </optgroup>
                ))}
              </select>
              <button className={`${curlStyles.button} ${curlStyles.secondary}`} onClick={handleLoad} disabled={!selectedRequest}>読み込み</button>
              <button className={`${curlStyles.button} ${curlStyles.secondary}`} onClick={handleDelete} disabled={!selectedRequest}>削除</button>
            </div>
            <div className={curlStyles.apiManagement}>
              <button className={`${curlStyles.button} ${curlStyles.secondary}`} onClick={handleExport}>エクスポート</button>
              <button className={`${curlStyles.button} ${curlStyles.secondary}`} onClick={() => document.getElementById('import-input')?.click()}>インポート</button>
              <input type="file" id="import-input" style={{ display: 'none' }} accept=".json" onChange={handleImport} />
            </div>
            <hr />
            <div className={curlStyles.apiManagement}>
               <input
                type="text"
                className={`${curlStyles.input} ${curlStyles.apiInput}`}
                placeholder="グループ名 (例: User API)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
               <input
                type="text"
                className={`${curlStyles.input} ${curlStyles.apiInput}`}
                placeholder="リクエスト名 (例: users)"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
              <button className={curlStyles.button} onClick={handleSave}>保存</button>
            </div>
          </section>

          <form onSubmit={handleSubmit}>
            <section className={styles.section}>
              <h2>リクエスト</h2>
              <div className={curlStyles.grid}>
                <div className={curlStyles.fullWidth}>
                  <label className={curlStyles.label} htmlFor="url">URL</label>
                  <input
                    id="url"
                    type="text"
                    className={curlStyles.input}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    required
                  />
                </div>

                <div>
                  <label className={curlStyles.label} htmlFor="method">メソッド</label>
                  <select
                    id="method"
                    className={curlStyles.select}
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                    <option>HEAD</option>
                    <option>OPTIONS</option>
                  </select>
                </div>

                <div>
                  <label className={curlStyles.label} htmlFor="user-agent">User-Agent</label>
                  <input
                    id="user-agent"
                    type="text"
                    className={curlStyles.input}
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value)}
                  />
                </div>

                <div className={curlStyles.fullWidth}>
                  <label className={curlStyles.label} htmlFor="headers">ヘッダ (1行ずつ)</label>
                  <textarea
                    id="headers"
                    className={curlStyles.textarea}
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                  />
                </div>

                <div className={curlStyles.fullWidth}>
                  <label className={curlStyles.label} htmlFor="body">ボディ</label>
                  <textarea
                    id="body"
                    className={curlStyles.textarea}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={method === "GET" || method === "HEAD"}
                  />
                </div>
              </div>
              <button type="submit" className={curlStyles.button} disabled={loading}>
                {loading ? "送信中..." : "送信"}
              </button>
            </section>
          </form>

          {error && <p className={curlStyles.error}>{error}</p>}

          <section className={`${styles.section} ${curlStyles.responseSection}`}>
            <h2>レスポンス</h2>

            <pre className={curlStyles.responseBox}>
              <code>{response || ""}</code>
            </pre>
            <div className={curlStyles.responseActions}>
              <button onClick={copyResponse} className={`${curlStyles.button} ${curlStyles.secondary}`} disabled={!response}>コピー</button>
              <button onClick={formatJson} className={`${curlStyles.button} ${curlStyles.secondary}`} disabled={!response}>整形</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

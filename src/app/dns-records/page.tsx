"use client";

import { useState } from "react";
import styles from "../page.module.css";

export default function ToolDNSRecords() {
  const [enableLog, setEnableLog] = useState(false);
  const [displayAllRecords, setDisplayAllRecords] = useState(false);
  const [records, setRecords] = useState<{
    name: string;
    type: string;
    TTL: string;
    data: string;
  }[] | undefined>();

  function log(str: any) {
    if (!enableLog) return;
    const log = document.getElementById("log") as HTMLTextAreaElement;
    log.value += str + "\n";
  }

  const STANDARD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'];
  const RECORD_TYPES = ['A', 'AAAA', 'CAA', 'CERT', 'CNAME', 'DNSKEY', 'DS', 'HTTPS', 'LOC', 'MX', 'NAPTR', 'NS', 'OPENPGPKEY', 'PTR', 'RP', 'SMIMEA', 'SRV', 'SSHFP', 'SOA', 'SRV', 'SVCB', 'TLSA', 'TXT', 'URI'];

  async function getDNS(domain: string) {
    const promises = RECORD_TYPES.map(async (type) => {
      const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`;
      const res = await fetch(url, {
        headers: {'Accept': 'application/dns-json'}
      });
      const data = await res.json();
      const answers = data.Answer || [];

      for (let i = 0; i < answers.length; i++)
        answers[i].type = type;
      
      log(JSON.stringify(answers, null, 2));

      return answers;
    });

    const res = await Promise.all(promises);
    return res.flat();
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>DNSレコード</h1>
          <p>ドメインからDNSレコードの情報を取得するチェッカーツール
            (Cloudflare DNS API経由)</p>

          <form>
            <input id="input" placeholder="example.com" style={{width: "75%", marginRight: "4px"}} />
            <input type="submit" value="取得する" onClick={(e) => {
              e.preventDefault();
              const input = document.getElementById("input") as HTMLTextAreaElement;

              getDNS(input.value).then(records => setRecords(records));
            }} />
          </form>

          <input type="checkbox" id="displayAllRecords" checked={displayAllRecords} onChange={(e) => {
            setDisplayAllRecords((e.target as HTMLInputElement).checked);
          }} />
          <label htmlFor="displayAllRecords">すべてのレコードを表示する</label>

          <br />
          
          <table className={styles.records}>
            <thead>
              <tr>
                <th>タイプ</th>
                <th>名前</th>
                <th>コンテンツ</th>
                <th>TTL</th>
              </tr>
            </thead>
            <tbody>
              {records?.map((record, index) => (
                displayAllRecords || STANDARD_TYPES.includes(record.type) ?
                <tr key={index}>
                  <td>{record.type}</td>
                  <td>{record.name}</td>
                  <td>{record.data}</td>
                  <td>{record.TTL}</td>
                </tr>
                : ""
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

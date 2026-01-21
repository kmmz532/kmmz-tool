"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

export default function ToolMD5() {
  const [enableLog, setEnableLog] = useState(false);

  function log(str: any) {
    if (!enableLog) return;
    const log = document.getElementById("log") as HTMLTextAreaElement;
    log.value += str + "\n";
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>SHA256</h1>
          <p>テキストからSHA256ハッシュ値を算出</p>

          <textarea id="input" placeholder="テキスト" style={{width: "100%"}} rows={6}></textarea>
          <textarea id="output" placeholder="ハッシュ値" style={{width: "100%"}} rows={1} disabled></textarea>
          <input type="submit" value="算出する" onClick={(e) => {
            e.preventDefault();
            const input = document.getElementById("input") as HTMLTextAreaElement;
            const output = document.getElementById("output") as HTMLTextAreaElement;
            
            const text = input.value;
            
            // 数字を右に回す
            const rotr = (x: number, n: number) => {
              let res = ((x >>> n) | (x << (32 - n))) >>> 0;
              log("rotr(" + x + ", " + n + "): " + res);
              return res;
            };

            // 32bit整数
            const u32 = (x: number) => {
              let res = x >>> 0;
              // log("u32(" + x + "): " + res);
              return res;
            };

            const H0 = [
                0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 
                0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
            ];

            const K = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            ];

            const bytes = new TextEncoder().encode(text);
            const bitLen = bytes.length * 8;
            const paddedLen = ((bitLen + 64 + 511) >> 9) << 9;
            const padded = new Uint8Array(paddedLen / 8);
            padded.set(bytes);
            padded[bytes.length] = 0x80;
            const view = new DataView(padded.buffer);
            // view.setUint32(padded.length - 4, bitLen, false);

            const bitLenHi = Math.floor(bitLen / 2**32);
            const bitLenLo = bitLen >>> 0;
            view.setUint32(padded.length - 8, bitLenHi, false);
            view.setUint32(padded.length - 4, bitLenLo, false);

            let H = [...H0];

            for (let i = 0; i < padded.length; i += 64) {
              const W = new Array(64).fill(0);
              for (let j = 0; j < 16; j++) {
                W[j] = view.getUint32(i + j * 4, false);
              }

              for (let j = 16; j < 64; j++) {
                const s0 = rotr(W[j -15], 7) ^ rotr(W[j -15], 18) ^ (W[j -15] >>> 3);
                const s1 = rotr(W[j - 2], 17) ^ rotr(W[j - 2], 19) ^ (W[j - 2] >>> 10);
                W[j] = u32(W[j - 16] + s0 + W[j - 7] + s1);
            }

            let [a, b, c, d, e, f, g, h] = H;

            for (let j = 0; j < 64; j++) {
              const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
              const ch = (e & f) ^ (~e & g);
              const temp1 = u32(h + S1 + ch + K[j] + W[j]);
              const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
              const maj = (a & b) ^ (a & c) ^ (b & c);
              const temp2 = u32(S0 + maj);
              h = g;
              g = f;
              f = e;
              e = u32(d + temp1);
              d = c;
              c = b;
              b = a;
              a = u32(temp1 + temp2);
            }

            H = H.map((x, i) => u32(x + [a, b, c, d, e, f, g, h][i]));
          }

          
            output.value = H.map(x => x.toString(16).padStart(8, "0")).join("");
          }} />
          
          <input type="submit" value="コピー" onClick={(e) => {
            e.preventDefault();
            const output = document.getElementById("output") as HTMLTextAreaElement;
            navigator.clipboard.writeText(output.value);
            alert("クリップボードにコピーしました");
          }} />


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

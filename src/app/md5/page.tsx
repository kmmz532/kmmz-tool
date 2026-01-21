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
          <h1>MD5</h1>
          <p>テキストからMD5ハッシュ値を算出</p>

          <textarea id="input" placeholder="テキスト" style={{width: "100%"}} rows={6}></textarea>
          <textarea id="output" placeholder="ハッシュ値" style={{width: "100%"}} rows={1} disabled></textarea>
          <input type="submit" value="算出する" onClick={(e) => {
            e.preventDefault();
            const input = document.getElementById("input") as HTMLTextAreaElement;
            const output = document.getElementById("output") as HTMLTextAreaElement;
            
            const text = input.value;
            
            // 数字を左に回す
            const rotl = (x: number, n: number) => {
              let res = (x << n) | (x >>> (32 - n));
              log("rotl(" + x + ", " + n + "): " + res);
              return res;
            };

            // 32bit整数
            const u32 = (x: number) => {
              let res = x >>> 0;
              // log("u32(" + x + "): " + res);
              return res;
            };

            const F = (x: number, y: number, z: number) => {
              let res = (x & y) | (~x & z);
              log("F(" + x + ", " + y + ", " + z + "): " + res);
              return res;
            };

            const G = (x: number, y: number, z: number) => {
              let res = (x & z) | (y & ~z);
              log("G(" + x + ", " + y + ", " + z + "): " + res);
              return res;
            };

            const H = (x: number, y: number, z: number) => {
              let res = x ^ y ^ z;
              log("H(" + x + ", " + y + ", " + z + "): " + res);
              return res;
            };

            const I = (x: number, y: number, z: number) => {
              let res = y ^ (x | ~z);
              log("I(" + x + ", " + y + ", " + z + "): " + res);
              return res;
            };

            const BUFFERS = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
            
            const E = [
              7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
              5,9,14,20, 5,9,14,20, 5,9,14,20, 5,9,14,20,
              4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
              6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21
            ];

            const T = Array.from({ length: 64 }, (_, i) =>
              Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32)
            );

            const bytes = new TextEncoder().encode(text);
            const totalWords = (((bytes.length + 8) >> 6) + 1) * 16;
            const words: number[] = new Array(totalWords).fill(0);

            for (let i = 0; i < bytes.length; i++) {
              words[i >> 2] |= bytes[i] << ((i % 4) * 8);
            }

            words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
            words[((bytes.length + 8) >> 6) * 16 + 14] = bytes.length * 8;

            let [A, B, C, D] = [...BUFFERS];

            for (let i = 0; i < words.length; i += 16) {
              let [a, b, c, d] = [A, B, C, D];

              for (let j = 0; j < 64; j++) {
                let f = 0;
                let k = 0;

                if (j < 16) {
                  f = F(b, c, d);
                  k = j;
                } else if (j < 32) {
                  f = G(b, c, d);
                  k = (5 * j + 1) % 16;
                } else if (j < 48) {
                  f = H(b, c, d);
                  k = (3 * j + 5) % 16;
                } else {
                  f = I(b, c, d);
                  k = (7 * j) % 16;
                }

                const tmp = d;
                d = c;
                c = b;
                b = u32(b + rotl(u32(a + f + words[i + k] + T[j]), E[j]));
                a = tmp;
              }

              A = u32(A + a);
              B = u32(B + b);
              C = u32(C + c);
              D = u32(D + d);
            }

            const toHexLE = (x: number): string =>
              [0, 8, 16, 24]
                .map(s => ((x >>> s) & 0xff).toString(16).padStart(2, "0"))
                .join("");

            output.value = [A, B, C, D].map(toHexLE).join("");
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

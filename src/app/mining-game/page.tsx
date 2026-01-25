"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import gameStyles from "./game.module.css";

type Screen = "game" | "shop";

type Item = {
  name: string;
  count: number;
};

export default function ToolMiningGame() {
  const [enableLog, setEnableLog] = useState(true);

  const [money, setMoney] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [level, setLevel] = useState(0);
  const [days, setDays] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

  const [screen, setScreen] = useState<Screen>("game");

  const [msg, setMsg] = useState("");
  
  function addItem(name: string, count: number) {
    if (items.find(i => i.name === name)) {
      setItems(items.map(i => i.name === name ? { name, count: i.count + count } : i));
      return;
    }
    setItems([...items, { name, count }]);
  }

  function removeItemAll(name: string) {
    setItems(items.filter(i => i.name !== name));
  }

  function removeItem(name: string, count: number) {
    if (items.find(i => i.name === name)) {
      setItems(items.map(i => i.name === name ? { name, count: i.count - count } : i));
      return;
    }
  }

  function hasItem(name: string): boolean {
    return items.find(i => i.name === name) !== undefined;
  }

  function getCount(name: string): number {
    return items.find(i => i.name === name)?.count || 0;
  }

  function save() {
    localStorage.setItem("mining-game-money", money.toString());
    localStorage.setItem("mining-game-energy", energy.toString());
    localStorage.setItem("mining-game-level", level.toString());
    localStorage.setItem("mining-game-days", days.toString());
    localStorage.setItem("mining-game-items", JSON.stringify(items));
  }

  useEffect(() => {
    log(msg);
  }, [msg])

  useEffect(() => {
    const money = localStorage.getItem("mining-game-money");
    const energy = localStorage.getItem("mining-game-energy");
    const level = localStorage.getItem("mining-game-level");
    const days = localStorage.getItem("mining-game-days");
    const items = localStorage.getItem("mining-game-items");

    setMoney(money ? parseInt(money) : 0);
    setEnergy(energy ? parseInt(energy) : 5);
    setLevel(level ? parseInt(level) : 1);
    setDays(days ? parseInt(days) : 1);
    setItems(items ? JSON.parse(items) : []);
  }, []);

  useEffect(() => {
    save();
  }, [money, energy, level, days, items]);

  function log(str: any) {
    if (!enableLog) return;
    const log = document.getElementById("log") as HTMLTextAreaElement;
    log.value += str + "\n";
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>マイニングゲーム</h1>

          <span className={gameStyles.msg}>
            {msg ? <>{msg} <br /><hr /></> : ""}
          </span>

          <div className={gameStyles.status}>
            {days}日目<br />
            &nbsp;&nbsp;&nbsp;ステータス - [お金: {money}, エネルギー: {energy}, レベル: {level}]<br />
            &nbsp;&nbsp;&nbsp;　アイテム - [
            {
              items.map((item) => (
                <span key={item.name}>
                  {item.name}: {item.count},&nbsp;
                </span>
              ))
            }]
          </div>

          <hr />

          {screen === "game" && (
            <div className={gameStyles.panel}>
              <input type="button" value="採掘する" id="mine" onClick={
                (e) => {
                  e.preventDefault();
                  if (energy < 1) {
                    setMsg("エネルギーが足りません。");
                    return;
                  }
                  setEnergy(energy - 1);

                  const rand = Math.floor(Math.random() * 100);
                  if (rand >= 0 && rand < 30) {
                    const cnt = Math.floor(Math.random() * 15) + 1;
                    addItem("石", cnt);
                    setMsg("採掘して「石」を" + cnt + "コ、獲得しました！")
                  } else if (rand >= 30 && rand < 50) {
                    const cnt = Math.floor(Math.random() * 10) + 1;
                    addItem("鉄", cnt);
                    setMsg("採掘して「鉄」を" + cnt + "コ、獲得しました！")
                  } else if (rand >= 50 && rand < 70) {
                    const cnt = Math.floor(Math.random() * 10) + 1;
                    addItem("銅", cnt);
                    setMsg("採掘して「銅」を" + cnt + "コ、獲得しました！")
                  } else if (rand >= 70 && rand < 90) {
                    const cnt = Math.floor(Math.random() * 8) + 1;
                    addItem("銀", cnt);
                    setMsg("採掘して「銀」を" + cnt + "コ、獲得しました！")
                  } else if (rand >= 90 && rand < 95) {
                    const cnt = Math.floor(Math.random() * 7) + 1;
                    addItem("金", cnt);
                    setMsg("採掘して「金」を" + cnt + "コ、獲得しました！")
                  } else if (rand >= 95 && rand < 100) {
                    const cnt = Math.floor(Math.random() * 5) + 1;
                    addItem("ダイヤモンド", cnt);
                    setMsg("採掘して「ダイヤモンド」を" + cnt + "コ、獲得しました！")
                  }

                  setDays(days + 1);
                }
              } />
              &nbsp;
              <input type="button" value="ショップへ" id="shop" onClick={
                (e) => {
                  e.preventDefault();
                  setScreen("shop");
                }
              } />
              &nbsp;
              <input type="button" value="次の日へ" id="next" onClick={
                (e) => {
                  e.preventDefault();
                  setDays(days + 1);
                  setEnergy(energy + 1);

                  setMsg("何もせず、次の日に進みました。")
                }
              } />
            </div>
          )}

          {screen === "shop" && (
            <div className={gameStyles.panel}>
              <input type="button" value="戻る" id="back" onClick={
                (e) => {
                  e.preventDefault();
                  setScreen("game");
                }
              } /><br /><br />
              <h2>ショップ</h2>
              <select id="shop-sell-item">
                {items.map((item) => (
                  <option key={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              &nbsp;
              <select id="shop-sell-count">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
              </select>
              &nbsp;
              <input type="button" value="売却" id="sell" onClick={
                (e) => {
                  e.preventDefault();
                  const item = document.getElementById("shop-sell-item") as HTMLSelectElement;
                  const count = document.getElementById("shop-sell-count") as HTMLSelectElement;
                  if (hasItem(item.value)) {
                    if (getCount(item.value) < parseInt(count.value)) {
                      setMsg("数が足りないため、売却できません。")
                    } else {
                      setMoney(money + parseInt(count.value) * 100);
                      if (getCount(item.value) === parseInt(count.value)) {
                        removeItemAll(item.value);
                      } else {
                        removeItem(item.value, parseInt(count.value));
                      }
                      setMsg(item.value + "を" + count.value + "コ、売却して" + parseInt(count.value) * 100 + "円、獲得しました！")
                    }
                  }
                }
              } />

            </div>
          )}
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

import styles from "./page.module.css";

export default function Top() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.section}>
          <h1>かみみずツール</h1>
          <p>
            クライアントのみで完結するツールをまとめたものです。<br />
            基本的にバックエンドは経由しておらず、JS Web準拠のものかアルゴリズムもこちらで作成したものを使っています。<br />
            一部は外部APIを使っているものもありますが、必要最低限となっております。<br />
            <br />
            自分でつくることで動作やアルゴリズムを把握できるからこそ自身が安心して使えるという理由でこのウェブを設置しています。
          </p>

          <ul>
            <li><a href="/md5">MD5算出ツール</a></li>
            <li><a href="/sha256">SHA256算出ツール</a></li>
            <li><a href="/text-count">文字数カウントツール</a></li>
            <li><a href="/media-devices">メディアデバイス情報表示ツール</a></li>
            <li><a href="/camera-info">カメラ情報表示ツール</a></li>
            <li><a href="/curl">HTTPリクエスト送信ツール</a></li>
          </ul>

          <ul>
            <li><a href="/dns-records">DNSレコード取得ツール</a></li>
          </ul>
        </section>
      </main>
    </div>
  );
}

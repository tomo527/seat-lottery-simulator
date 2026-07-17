# 座席抽選シミュレーター

ライブやイベントの前に、今日の席運を気軽に試せるモバイルファーストのWebアプリです。会場を選ぶか、列と座席番号を自分で設定し、有効な座席から必ず1席を抽選します。

> 本アプリは遊びのためのシミュレーションです。実際の座席割り当てを予測・再現するものではなく、チケットサービスとも関係ありません。

## 技術構成

- React 19 / TypeScript / Vite 8
- Cloudflare Vite plugin / Workers Static Assets / Wrangler
- Vitest / Testing Library / Playwright
- React標準の状態管理、`localStorage`による選択会場の保存

## 必要環境

- Node.js 22以上
- npm 10以上
- E2Eテスト用のPlaywright Chromium

## セットアップと開発

```bash
npm install
npx playwright install chromium
npm run dev
```

## 検証

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm audit
```

`npm run preview`はproduction build後にVite previewを起動します。

## Cloudflare Workers

ローカルから手動デプロイする場合のみ、`npx wrangler login`後に`npm run deploy`を実行します。このスクリプトは最新buildを作成してから`wrangler deploy`を実行します。アカウントID、API token、その他の秘密情報をリポジトリへ保存しないでください。

GitHub連携のWorkers Buildsでは次を設定します。Cloudflare側で`npm run deploy`を指定するとbuildが重複するため使用しません。

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

`wrangler.jsonc`の`not_found_handling: "single-page-application"`によりSPAパスを`index.html`へフォールバックします。

## ディレクトリ構成

```text
scripts/                 公式データの再現可能な変換スクリプト
src/
  components/lottery/    抽選演出・テキスト結果
  components/venue/      会場選択・自作座席入力
  data/venues/           production会場と生成済み座席範囲
  domain/lottery/        乱数・抽選
  domain/seats/          座席生成・自作入力検証
  domain/venues/         productionデータ完全性検証
  hooks/                 reduced motion判定
  lib/                   localStorage・共有
  types/                 会場・座席型
tests/e2e/               Playwrightスモークテスト
docs/venues/             会場別の内部調査記録
```

## 主な仕様

- 会場名・都道府県・市区町村の検索、地域絞り込み、スクロール可能な会場一覧
- `?venue=...`と安全な`localStorage`復元
- アルファベット列・数字列の自作座席（最大50,000席、巨大入力を配列生成前に拒否）
- `crypto.getRandomValues()`とrejection samplingによる座席抽選
- 通常1,800ms、reduced motion時400msの決定論的な抽選演出
- 二重実行防止、条件変更・unmount時のタイマー取消、sequence guard
- Web Share APIとClipboardフォールバック
- 結果は会場・エリア（存在時のみ）・列・番号のテキスト表示。座席図や公式情報リンクはユーザー画面へ表示しません

## production会場データ

production一覧には、公式資料から代表パターン全席を構造化できた次の2会場だけを登録しています。

- 国立文楽劇場「文楽劇場 全席（標準）」: 753席
- 京セラドーム大阪「通常野球開催時 スタンド席」: 34,522席

部分的なサンプル範囲は公開しません。公式画像は保存・転載・外部表示・トレースせず、事実情報をデータへ変換します。情報源、確認日、採用理由、未採用パターンはユーザー画面から分離し、[会場データ追加ガイド](docs/VENUE_DATA_GUIDE.md)と`docs/venues/`へ記録しています。

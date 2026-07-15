# 座席抽選シミュレーター

ライブ、コンサート、舞台、イベントなどの座席発表前に、架空の座席抽選を楽しむモバイルファーストWebアプリです。会場データから選ぶ方法と、列・座席番号の範囲を自分で作る方法に対応しています。

> **重要:** 本アプリはエンターテインメント目的のシミュレーションです。実際のチケット抽選、当選確率、座席割り当てを予測・再現するものではなく、実在するチケットサービスとも関係ありません。

## 技術構成

- React 19 / TypeScript / Vite
- Tailwind CSS 4（Vite plugin）とプロジェクト固有CSS
- Cloudflare Vite plugin / Cloudflare Workers Static Assets / Wrangler
- Vitest / Testing Library / Playwright
- 状態管理はReact標準機能のみ。設定の一部は`localStorage`に保存

## 必要環境

- Node.js 22以上（開発時はNode.js 24で検証）
- npm 10以上
- E2E実行時はPlaywright Chromium
- デプロイ時のみCloudflareアカウント

## セットアップと開発

```bash
npm install
npx playwright install chromium
npm run dev
```

開発サーバーが表示するURLをブラウザで開きます。Cloudflare Vite pluginにより、ローカルでもWorkers Static Assetsに近い環境で動作します。

## 検証コマンド

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run preview
```

`npm run preview`は必ず最新のproduction buildを作成してから、Cloudflare互換のプレビュー環境を起動します。

## Cloudflare Workersへデプロイ

### Wranglerから手動デプロイ

1. `npx wrangler login`でCloudflareにログインします。
2. `npm run deploy`を実行します。このスクリプトは最新のproduction buildを作成してからデプロイします。
3. 必要に応じてCloudflare DashboardでCustom Domainを設定します。

`wrangler.jsonc`には公開可能なWorker名、互換日、SPAフォールバックだけを記載しています。Account ID、API token、秘密情報はコミットしないでください。Cloudflare Vite pluginがbuild成果物にStatic Assetsの出力先を自動設定するため、`assets.directory`は入力設定に記載していません。

### GitHubからCloudflareへ接続

1. このリポジトリをユーザー管理のGitHubリポジトリへpushします。
2. Cloudflare Dashboardの **Workers & Pages** でWorkerを作成し、Git repositoryの接続を選びます。
3. GitHubアカウントを認可し、対象リポジトリとproduction branch（通常`main`）を選びます。
4. Worker名を`wrangler.jsonc`の`seat-lottery-simulator`と一致させます。
5. Root directoryはリポジトリ直下、Build commandは`npm run build`、Deploy commandは`npx wrangler deploy`を設定します。
6. production以外のbranchには、既定の`npx wrangler versions upload`を使うとpreview versionを作成できます。
7. 初回build後、表示・SPAのURLフォールバック・共有URLを確認します。

Cloudflare側の画面構成は変更される場合があります。最新情報は[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)と[Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)を参照してください。

Cloudflare Workers Buildsでは、必ずBuild commandに`npm run build`、Deploy commandに`npx wrangler deploy`を指定してください。ローカル用の`npm run deploy`は安全のためbuildを内包しているため、Cloudflare側のDeploy commandに指定するとbuildが重複します。

## ディレクトリ構成

```text
src/
  components/
    lottery/       抽選設定・演出・結果
    seat-map/      データ駆動の簡易座席図
    venue/         会場選択・自作座席入力
  data/venues/     会場データ（UIから分離）
  domain/
    lottery/       乱数・当落・座席抽選
    seats/         会場／自作座席の生成と検証
  hooks/           reduced motion判定
  lib/             localStorage・共有
  test/            テスト共通設定
  types/           会場・座席の型
tests/e2e/         Playwrightスモークテスト
docs/              会場データ追加ガイド
```

## 主要仕様

- 会場選択は地域フィルター、会場名検索、URLクエリ（`?venue=...`）に対応
- 自作座席はA〜ZZまたは正の整数列に対応し、生成上限は50,000席
- 「座席だけ抽選」と「当落＋座席抽選」の2モード
- 本番乱数は`crypto.getRandomValues()`を使用し、整数抽選はrejection samplingで剰余偏りを回避
- 大規模データはブロック表示、小規模な自作座席はグリッド表示
- Web Share APIを優先し、Clipboard APIへフォールバック
- `prefers-reduced-motion`を尊重

## 会場データについて

現在登録されている会場はすべて動作確認用の架空データです。実在会場の未検証データや公式座席図画像を推測・コピーして追加してはいけません。追加方法は[docs/VENUE_DATA_GUIDE.md](docs/VENUE_DATA_GUIDE.md)を参照してください。

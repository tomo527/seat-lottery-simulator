# 東京production会場 調査記録

確認日: 2026-07-20。各会場の全range、変換方法、完全性の根拠、既知の制約は`data/venue-sources/<venue-id>.json`を正本とします。公式画像・PDFそのものはリポジトリに保存せず、番号を圧縮rangeへ転記しました。公演固有の販売停止・車椅子席への変更はシミュレーションに反映しません。

| 会場（所在地） | 種類 | 採用代表パターン | 席数 | 登録範囲の要約 | 公式情報源 |
|---|---|---|---:|---|---|
| Hakuju Hall（渋谷区） | hall | 通常公演 | 300 | A〜Q列の公式番号全席 | [通常公演座席表](https://www.hakujuhall.jp/hall_info/pdf/seat_normal.pdf?2024=) |
| 浜離宮朝日ホール 音楽ホール（中央区） | hall | 通常座席 | 552 | 1階1〜22列、2階L/R/Cの公式番号全席 | [座席表ページ](https://www.asahi-hall.jp/hamarikyu/ticket/seat.html) |
| イイノホール（千代田区） | hall | 通常座席 | 500 | A〜Q列の公式番号全席 | [座席表PDF](https://www.iino.co.jp/hall/wp-content/themes/iino_hall/assets/pdf/seatinglist.pdf) |
| 日本製鉄紀尾井小ホール（千代田区） | theater | 通常座席 | 250 | 1〜11列の公式番号全席 | [施設利用PDF](https://kioihall.jp/cms/wp-content/themes/kioihall/file/rent_hall/s_hall/kioihall_s_all.pdf?251223_2=) |
| 銀座 王子ホール（中央区） | hall | 通常座席 | 315 | A〜P列の公式番号全席 | [座席表ページ](https://www.ojihall.jp/facility/seats.html) |
| すみだトリフォニーホール 小ホール（墨田区） | hall | 通常座席 | 252 | 1〜16列の公式番号全席 | [小ホール座席表PDF](https://www.triphony.com/seat/common/pdf/hall_s.pdf) |
| サントリーホール ブルーローズ（港区） | hall | シューボックス型・縦使いA型 | 384 | 1〜16列・各1〜24番 | [A型座席表PDF](https://www.suntory.co.jp/suntoryhall/seat/pdf/bluerose_a.pdf) |
| TOKYO FMホール（千代田区） | hall | Aステージ | 308 | A〜M列の公式番号全席 | [資料ページ](https://www.tfmhall.com/document) |
| 東京芸術劇場 シアターイースト（豊島区） | theater | 基本パターンA | 272 | A〜N列の公式番号全席 | [施設ページ](https://www.geigeki.jp/facilities/theatre_east/) |
| TOPPANホール（文京区） | hall | 通常座席 | 408 | A〜S列の公式番号全席 | [座席表ページ](https://www.toppanhall.com/about/seatmap.html) |

## 未採用パターンと候補

- サントリーホール ブルーローズの縦使いB型・横使いC型、東京芸術劇場シアターイーストの基本パターンB、TOKYO FMホールの客席なしBステージは、代表パターンへ混在させていません。
- 東京ドーム、日本武道館、有明アリーナ、国立代々木競技場、東京体育館、東京国際フォーラム等は候補として確認しましたが、今回の調査範囲では代表パターン全体の列・番号を推測なしでrange化する条件を満たせなかったため採用していません。
- 完全な小〜中規模ホールを優先したため、今回の東京10件はhall/theater中心です。施設種別の見た目だけを満たす目的で部分データを追加していません。

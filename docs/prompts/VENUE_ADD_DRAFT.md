# 第1パス: 会場追加draft作成プロンプト

```text
座席抽選シミュレーターへ次の候補会場をdraftとして追加してください。

候補:
- 会場名:
- 都道府県:
- 市区町村:
- venueType:
- 想定する代表パターン:
- inventory ID:
- batch ID:

docs/VENUE_DATA_GUIDE.mdを守り、最初にvenues:newでdraftを作成してください。
公式座席表、公式PDF、施設運営者・主催者の公式資料だけを優先し、非公式座席表、まとめサイト、SNS、画像検索結果だけを根拠にしないでください。
公式PDFや画像はリポジトリへ保存、転載、表示、トレースしないでください。

代表パターンは1つだけ選び、異なるパターンを混在させないでください。公式資料から確認できた列、番号、欠番、areaだけを明示rangeへ入力し、規則性から未確認席を補完しないでください。sourceには安定ID、official、roles、publisher、title、HTTPS URL、checkedAtを記録してください。

生成直後の`ranges: []`と`expectedSeatCount: null`は未入力状態です。実在席に見える仮rangeやTODO席を作らず、確認できたrangeだけを追加してください。area省略はruntime上`main`になるため、省略形式と明示的`areaId: "main"`を混在させないでください。`checkedAt`はAsia/Tokyoの調査日を使ってください。

このパスではstatusをdraftのままにし、verificationをverifiedへ変更しないでください。venues:reviewは不完全な編集中データにも使えます。validation error、期待席数、計算可能なrange集計、gap、warning、production blockerを報告してください。完全に構造化できない点はunresolvedIssuesへ明示してください。generated productionファイルは変更しないでください。

対象の都道府県inventoryがある場合は、同じ候補を重複追加せず既存itemへvenueSourceIdを紐付け、researchStatusをdraft-createdまたはfirst-pass-completeへ更新してください。batch manifestのtargetと一致することを`venues:batch:report -- --batch ...`で確認してください。inventoryの未調査候補を削ってcoverage率を上げてはいけません。
```

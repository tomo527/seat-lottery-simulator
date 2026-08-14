# 第1パス: 会場追加draft作成プロンプト

```text
座席抽選シミュレーターへ次の候補会場をdraftとして追加してください。

候補:
- 会場名:
- 都道府県:
- 市区町村:
- venueType:
- 想定する代表パターンまたはrepresentative configuration:
- inventory ID:
- batch ID:

docs/VENUE_DATA_GUIDE.mdを守り、最初にvenues:newでdraftを作成してください。
現行公式座席図、current siteがリンクする旧公式図、公式basic/seated例、公式実公演図の順に優先してください。公式資料だけで番号が不足する場合は、公式capacity・floor structure・map shapeと大きく矛盾しない信頼できるsecondary seat mapを補助利用でき、`official: false`で出典を残します。SNS単独・出所不明画像は根拠にしないでください。
公式PDFや画像はリポジトリへ保存、転載、表示、トレースしないでください。

schema v1を使う場合は代表パターンを1つだけ選び、異なるパターンを混在させないでください。schema v2はconfigurationごとにselection basis、sourceGeneration、sourceIds、scope、wheelchairSemantics、confidence、expectedSeatCount、ranges、verificationを分離してください。最初から全variantは不要です。repository独自seat ID、capacity fittingは禁止です。公開資料から確認できた列、番号、欠番、areaだけを明示rangeへ入力し、規則性から未確認席を補完しないでください。

fixed-onlyは公開固定stand番号図の宣言scopeを完全転記できれば候補にできます。configuration名とscopeDisclosureには、固定席のみ、arena/floor等を含まない、最大収容配置ではない、の3点を明記してください。wheelchair転換番号が不明なら通常番号席を維持し、`accessibilityConversionNotReflected: true`を記録します。

生成直後の`ranges: []`と`expectedSeatCount: null`は未入力状態です。実在席に見える仮rangeやTODO席を作らず、確認できたrangeだけを追加してください。area省略はruntime上`main`になるため、省略形式と明示的`areaId: "main"`を混在させないでください。`checkedAt`はAsia/Tokyoの調査日を使ってください。

このパスではtop-levelと各configurationのstatusをdraftのままにし、selectableをfalse、verificationをpendingにしてください。venues:reviewは不完全な編集中データにも使えます。validation error、configuration別の期待席数、計算可能なrange集計、gap、warning、production blockerを報告してください。完全に構造化できないvariantはそのconfigurationだけをnon-selectableに保ち、他の完全なconfigurationへ混ぜないでください。generated productionファイルは変更しないでください。

対象の都道府県inventoryがある場合は、同じ候補を重複追加せず既存itemへvenueSourceIdを紐付け、researchStatusをdraft-createdまたはfirst-pass-completeへ更新してください。batch manifestのtargetと一致することを`venues:batch:report -- --batch ...`で確認してください。inventoryの未調査候補を削ってcoverage率を上げてはいけません。
```

# 第2パス: 独立レビュープロンプト

```text
次のdraft会場を第1パスの結論を正解とみなさず、公式資料から独立に再確認してください。

venue ID:
inventory ID:
batch ID:

docs/VENUE_DATA_GUIDE.mdを守り、source JSONのrangeを先に信用せず、公式資料から代表パターンまたは各issuer-defined configuration、全列、全番号、欠番、area、総席数を確認してください。schema v2はconfigurationごとにissuer condition、source generation、scope、wheelchair semantics、seat-structureとseat-countの根拠を独立確認し、異なる配置を混在させないでください。

venues:reviewの先頭・中央・末尾sample、不連続range、小さなgap候補、area別席数・row数を使って重点照合してください。推測やOCRだけで不足を埋めないでください。公式資料が曖昧、パターンが非一意、完全構造化できない場合はproductionへ変更せず、draftのunresolvedIssuesまたはrejectedのrejectionReasonへ記録してください。

すべて一致し未解決事項がない場合だけverificationを次の状態へ更新してください:
- status: verified
- method: independent-official-source-review
- seatStructure: matched
- seatCount: matched
- rangeDiff: 0
- unresolvedIssues: []

独立抽出を終えるまで第1パスのrangeを比較元として読まないでください。独立抽出後はconfiguration ID・名称・issuer condition・source generation・scope、canonical area、各rowのfrom/to/excluded、計算席数、source role、wheelchair semantics、先頭・中央・最終offsetをconfiguration単位で機械比較し、差分をすべて報告してください。差分が1件でも未解決ならそのconfigurationをdraft/non-selectableに保ちます。他の完全なconfigurationを一律にblockしませんが、未完了variant自体はproductionへ変更しません。

fixed-onlyでは、issuerによる独立seat set定義、全固定番号、厳密subtotal、arena/floor等の公式除外根拠、wheelchair semantics、3点のUI disclosureを独立に再確認してください。いずれかが欠ければfixed-onlyをproduction/selectableにしません。

空range、架空の仮座席、TODO/TBD/未設定/placeholder tokenが残っている場合はproductionへ変更しないでください。area省略はruntime上`main`になるため、明示的mainとの混在がないことも確認してください。`checkedAt`はAsia/Tokyoの調査日を使ってください。

その後にstatusをproductionへ変更し、venues:build、venues:check、venues:validate、venues:report、lint、typecheck、unit test、build、E2Eを実行してください。既存production会場のID、metadata、席数、座席集合、先頭・中央・末尾offset、legacy fingerprintに意図しない差分がないことも報告してください。legacy fingerprintが変わる場合はsnapshotだけを更新せず、公式資料から独立再確認してください。

対象inventory itemもactive・eligible・productionへ同期し、`venues:inventory:report`と`venues:batch:report -- --batch ...`でsourceとの双方向status整合を確認してください。
```

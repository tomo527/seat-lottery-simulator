# 第2パス: 独立レビュープロンプト

```text
次のdraft会場を第1パスの結論を正解とみなさず、公式資料から独立に再確認してください。

venue ID:
inventory ID:
batch ID:

docs/VENUE_DATA_GUIDE.mdを守り、source JSONのrangeを先に信用せず、利用可能な公開資料から代表パターン、全列、全番号、欠番、area、総席数差を確認してください。schema v2はconfigurationごとにselection basis、source generation、scope、wheelchair metadata、confidence、seat-structure根拠を確認し、異なる配置を混在させないでください。

venues:reviewの先頭・中央・末尾sample、不連続range、小さなgap候補、area別席数・row数を使って重点照合してください。推測やOCRだけで不足を埋めないでください。issuerがdefaultと明記しない、総数差がある、wheelchair置換番号が不明、独立generationがない、全variantが未解決という理由だけではHOLDにせず、宣言scopeの実在番号集合を根拠付きで完全転記できるかを判断してください。

独立照合と総数まで一致する場合はverificationを次の状態へ更新してください:
- status: verified
- method: independent-official-source-review
- seatStructure: matched
- seatCount: matched
- rangeDiff: 0
- unresolvedIssues: []

独立抽出を終えるまで第1パスのrangeを比較元として読まないでください。独立抽出後はconfiguration ID・名称・selection basis・source generation・scope、canonical area、各rowのfrom/to/excluded、計算席数、source role、wheelchair metadata、先頭・中央・最終offsetをconfiguration単位で機械比較し、差分をすべて報告してください。差分や未解決事項は削除せずmetadataへ残し、confidenceを`representative`または`approximate`にします。seat ID自体を推測しないとscopeを完成できない場合だけdraft/non-selectableに保ちます。

fixed-onlyでは、公開固定stand番号図の全番号、arena/floor等の除外scope、3点のUI disclosureを確認してください。公式subtotal差やwheelchair転換未反映はmetadataに残し、番号を削除して合わせません。

空range、架空の仮座席、TODO/TBD/未設定/placeholder tokenが残っている場合はproductionへ変更しないでください。area省略はruntime上`main`になるため、明示的mainとの混在がないことも確認してください。`checkedAt`はAsia/Tokyoの調査日を使ってください。

その後にstatusをproductionへ変更し、venues:build、venues:check、venues:validate、venues:report、lint、typecheck、unit test、build、E2Eを実行してください。既存production会場のID、metadata、席数、座席集合、先頭・中央・末尾offset、legacy fingerprintに意図しない差分がないことも報告してください。legacy fingerprintが変わる場合はsnapshotだけを更新せず、公式資料から独立再確認してください。

対象inventory itemもactive・eligible・productionへ同期し、`venues:inventory:report`と`venues:batch:report -- --batch ...`でsourceとの双方向status整合を確認してください。
```

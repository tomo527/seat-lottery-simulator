# 第2パス: 独立レビュープロンプト

これは作業開始用の入力templateです。独立レビュー規則の正本ではありません。

```text
座席抽選シミュレーターのbounded venue waveで、次のdraft会場を独立レビューしてください。

venue ID:
inventory ID:
batch ID:
difficulty lane:

docs/VENUE_WORKFLOW.mdの「3. Independent review」をcanonicalな順序として実行してください。
独立抽出が終わるまで第1パスのrangeや結論を正解として扱わず、docs/VENUE_DATA_GUIDE.mdのevidenceとproduction gateだけで判断してください。
独立抽出後にconfiguration scope、全range/exclusion、mapped totals、source generation/role、accessibility semantics、review sampleを機械比較し、差分を残してください。
production昇格またはnon-production dispositionを根拠付きで確定し、docs/VALIDATION.mdのtarget reviewとproportional profileを実行してください。
```

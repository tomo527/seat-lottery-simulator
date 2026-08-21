# 第1パス: 会場追加draft作成プロンプト

これは作業開始用の入力templateです。会場運用ルールの正本ではありません。

```text
座席抽選シミュレーターのbounded venue waveで、次の候補会場の第1パスを実行してください。

venue ID / 会場名:
inventory ID:
batch ID:
difficulty lane:

docs/VENUE_WORKFLOW.mdの「2. First pass」をcanonicalな順序として実行してください。
schema、evidence、production gate、range/inventory/batchの判断はdocs/VENUE_DATA_GUIDE.mdだけを正本としてください。
このパスではproductionへ昇格せず、in-scopeのsource・inventory・batch/readinessだけを同期してください。
docs/VALIDATION.mdに従ってtarget reviewとbounded batch reportを実行し、確認済みevidence、未解決点、blockerを報告してください。
```

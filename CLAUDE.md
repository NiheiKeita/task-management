コーディングルール（ディレクトリ構成と責務）

# 大事
プロンプトを入力する人はエンジニアではないので、渡す時はもう動く状態にして渡してください
フロント側を修正したら`npm run build`をしてください
DB構成を変えた時はマイグレーションを行なってください。
シーダを作成したらシーダーを流してください。


またDocker上でPHPが動いています。
JSはローカルでビルドします。

# フロントエンド
## views ディレクトリ
役割: ページ単位のロジックと表示を担当

構成:

index.tsx: ページ全体のコンポーネント
hooks.ts: ロジック（カスタムフック）を定義
components/: UI部品を切り出す
index.stories.tsx: Storybook カタログ + 必要なUIテスト
hooks.test.ts: hooks.ts のユニットテスト

例: /Pages/TopView/

```
TopView/
├── index.tsx            // ページコンポーネント
├── hooks.ts             // ロジック（useTopなど）
├── hooks.test.ts        // hooks のユニットテスト
├── index.stories.tsx    // Storybook + UIテスト（defaultはカタログ用）
└── components/
    └── Card/
        └── index.tsx    // UIパーツ（再利用性のある見た目重視のコンポーネント）
```
## 責務のまとめ
場所	役割・責務
Pages/	ページ単位の処理と画面構成
Pages/hooks.ts	カスタムフックでロジックを分離
Pages/components	UIパーツ（見た目のみ。ロジックなし）
Pages/hooks.test.ts	フックの単体テスト
Pages/index.stories.tsx	Storybook用のUIカタログ + 簡単なUIテスト

## 注意点
default エクスポートの Story にはテストを書かない（カタログ専用）
UI 部品にはロジックを入れず、表示のみに専念
ロジックのテストは hooks.test.ts に分離

# 修正が終わったらやること
以下を実行してエラーがないことを確認してください
```bash
npm run lint
npm run type-check
```



# バックエンド
## DB
マイグレーションファイルを書き換えたら必ず`/docs/treat-vault/database-er-diagram.md`を書き換えること

## 修正が終わったらやること
以下を実行してエラーがないことを確認してください
```bash
docker compose exec app vendor/bin/phpstan analyze
docker compose exec app composer phpcs .
docker compose exec app php artisan test --debug
```

## 注意点
API側を記述したらPHPUnitでテストを書いてください
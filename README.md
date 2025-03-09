# KokoDiary

KokoDiaryは、Markdownをサポートし、シークレットスポイラー機能を持つ日記アプリケーションです。

## 機能

- アカウントシステム（ユーザー登録・ログイン）
- Markdownによる日記作成
- 日記の公開/非公開設定
- シークレットスポイラー機能（非公開にできるカスタムタグ）
- モバイル対応のレスポンシブデザイン
- 自分の日記の検索機能

## 技術スタック

### フロントエンド
- Next.js
- React
- TypeScript
- TailwindCSS

### バックエンド
- Express.js
- MongoDB
- Docker

## 開発環境のセットアップ

### 前提条件
- Node.js (v16以上)
- npm (v7以上)
- Docker と Docker Compose

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/kokodiary.git
cd kokodiary
```

2. 依存関係をインストール
```bash
npm install
```

3. MongoDBコンテナを起動
```bash
npm run docker:up
```

4. 開発サーバーを起動
```bash
npm run dev
```

これで以下のURLでアプリケーションにアクセスできます：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000
- MongoDB管理画面: http://localhost:8081

## プロジェクト構造

```
kokodiary/
├── frontend/       # Next.js フロントエンド
├── backend/        # Express バックエンド
├── docker-compose.yml
└── package.json
```

## ライセンス

ISC

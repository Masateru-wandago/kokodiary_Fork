# KokoDiary 開発ドキュメント

このドキュメントは、KokoDiaryアプリケーションの開発に関する情報を提供します。

## 開発環境の要件

### 必要なソフトウェア

- **Node.js**: v16.0.0以上
- **npm**: v7.0.0以上
- **Docker**: 最新版
- **Docker Compose**: 最新版
- **Git**: 最新版

### 推奨開発ツール

- **Visual Studio Code**: 拡張機能
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

## プロジェクト構造

KokoDiaryはモノレポ構成で、フロントエンドとバックエンドを一つのリポジトリで管理しています。

```
kokodiary/
├── .gitignore                # Git除外ファイル設定
├── docker-compose.yml        # Docker Compose設定
├── package.json              # ルートパッケージ設定
├── README.md                 # プロジェクト概要
├── DEVELOP.md                # 開発ドキュメント（このファイル）
│
├── backend/                  # バックエンド（Express.js）
│   ├── .env                  # 環境変数
│   ├── package.json          # バックエンド依存関係
│   ├── tsconfig.json         # TypeScript設定
│   └── src/
│       ├── index.ts          # エントリーポイント
│       ├── controllers/      # コントローラー
│       ├── middleware/       # ミドルウェア
│       │   └── auth.middleware.ts  # 認証ミドルウェア
│       ├── models/           # データモデル
│       │   ├── user.model.ts # ユーザーモデル
│       │   └── diary.model.ts # 日記モデル
│       └── routes/           # APIルート
│           ├── auth.routes.ts # 認証ルート
│           └── diary.routes.ts # 日記ルート
│
└── frontend/                 # フロントエンド（Next.js）
    ├── .env.local            # 環境変数
    ├── package.json          # フロントエンド依存関係
    ├── tsconfig.json         # TypeScript設定
    ├── tailwind.config.js    # Tailwind CSS設定
    ├── postcss.config.js     # PostCSS設定
    ├── next.config.js        # Next.js設定
    └── src/
        ├── app/              # Next.js App Router
        │   ├── layout.tsx    # ルートレイアウト
        │   ├── page.tsx      # ホームページ
        │   ├── globals.css   # グローバルスタイル
        │   ├── login/        # ログインページ
        │   ├── register/     # 登録ページ
        │   ├── dashboard/    # ダッシュボードページ
        │   ├── diary/        # 日記関連ページ
        │   │   ├── page.tsx  # 日記一覧ページ
        │   │   ├── new/      # 新規作成ページ
        │   │   ├── [id]/     # 日記詳細ページ
        │   │   └── edit/[id]/ # 日記編集ページ
        │   ├── public/       # 公開日記ページ
        │   └── search/       # 検索ページ
        ├── components/       # コンポーネント
        │   ├── layout/       # レイアウトコンポーネント
        │   │   └── DashboardLayout.tsx # ダッシュボードレイアウト
        │   └── diary/        # 日記関連コンポーネント
        │       ├── DiaryList.tsx      # 日記リスト
        │       ├── DiaryEditor.tsx    # 日記エディタ
        │       └── MarkdownPreview.tsx # Markdownプレビュー
        └── context/          # Reactコンテキスト
            └── AuthContext.tsx # 認証コンテキスト
```

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/kokodiary.git
cd kokodiary
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

バックエンド（`backend/.env`）:

```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@localhost:27017/kokodiary?authSource=admin
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=30d
```

フロントエンド（`frontend/.env.local`）:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_JWT_EXPIRES_IN=30d
```

### 4. MongoDBの起動

```bash
npm run docker:up
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

これにより、以下のURLでアプリケーションにアクセスできます：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000
- MongoDB管理画面: http://localhost:8081

## 開発ガイドライン

### コーディング規約

- **TypeScript**: 型を適切に使用し、`any`型の使用を避ける
- **ESLint**: コードの品質を保つためにESLintを使用する
- **Prettier**: コードフォーマットの一貫性を保つためにPrettierを使用する

### Git ワークフロー

1. 新機能やバグ修正のための新しいブランチを作成
   ```bash
   git checkout -b feature/feature-name
   ```

2. 変更をコミット
   ```bash
   git add .
   git commit -m "feat: 機能の説明"
   ```

3. リモートリポジトリにプッシュ
   ```bash
   git push origin feature/feature-name
   ```

4. プルリクエストを作成

### コミットメッセージの規約

コミットメッセージは以下の形式に従ってください：

```
type: 簡潔な説明

詳細な説明（必要な場合）
```

typeは以下のいずれかを使用：
- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの意味に影響を与えない変更（空白、フォーマット、セミコロンの欠落など）
- **refactor**: バグ修正でも新機能追加でもないコード変更
- **test**: テストの追加・修正
- **chore**: ビルドプロセスやツールの変更

## 主要な機能と実装詳細

### 認証システム

- JWT（JSON Web Token）を使用した認証
- トークンはローカルストレージに保存
- 認証ミドルウェアによる保護されたルート

### 日記機能

- Markdownエディタによる日記作成
- 公開/非公開設定
- シークレットスポイラー機能（`:::secret` タグで囲まれた内容は非公開）

### シークレットスポイラーの実装

シークレットスポイラー機能は、以下のように実装されています：

1. フロントエンド：
   - `MarkdownPreview.tsx`コンポーネントで、`:::secret`タグで囲まれたコンテンツを検出
   - 所有者が閲覧する場合はコンテンツを表示し、それ以外の場合は非表示にする

2. バックエンド：
   - `diary.routes.ts`の`processContent`関数で、公開日記を取得する際にシークレットコンテンツを除外

## トラブルシューティング

### よくある問題と解決策

1. **MongoDBに接続できない**
   - Docker Composeが正常に起動しているか確認
   - 環境変数`MONGODB_URI`が正しく設定されているか確認

2. **APIリクエストが失敗する**
   - バックエンドサーバーが起動しているか確認
   - ブラウザのコンソールでエラーメッセージを確認
   - 認証が必要なエンドポイントの場合、ログインしているか確認

3. **TypeScriptエラー**
   - 依存関係が正しくインストールされているか確認
   - `npm install`を再実行
   - `node_modules`ディレクトリを削除して再インストール

## デプロイ

### 本番環境へのデプロイ手順

1. 環境変数の設定
   - 本番環境用の安全なシークレットキーを設定
   - 本番環境のMongoDBURIを設定

2. ビルド
   ```bash
   npm run build
   ```

3. サーバー起動
   ```bash
   npm start
   ```

### コンテナ化デプロイ

Docker Composeを使用して、アプリケーション全体をコンテナ化してデプロイすることも可能です。

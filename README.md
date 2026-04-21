# やることタイマー (Kids Task Timer)

3〜6歳の子ども向け・朝の支度をビジュアル化するタブレットアプリ。

## セットアップ

### 1. Supabase プロジェクト作成

1. https://supabase.com/dashboard で新規プロジェクト作成（無料枠でOK）
2. **Settings → API** を開き、以下をメモ：
   - `Project URL` (例: `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key（秘密！）
3. **SQL Editor** で `supabase/schema.sql` の中身を貼り付けて実行

### 2. ローカル起動

```bash
cd kids-task-timer
cp .env.local.example .env.local
# .env.local に Supabase の値を貼る
npm run dev
```

http://localhost:3000 を開く → 「新しい家族コードを作る」で開始

### 3. Vercelデプロイ

```bash
# GitHub に push した後
# https://vercel.com/new から import
```

Environment Variables に以下を登録：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 使い方

- **おうちのひと（/parent）**: ルーチン・やること・時間を設定
- **こども（/kids）**: 現在時刻に該当するルーチンを自動表示、タイマーで支度

### タブレットへの「アプリ」化

iPad で Safari で開く → 共有 → 「ホーム画面に追加」→ アイコン完成

## 構成

- Next.js 16 (App Router) + React 19 + Tailwind v4
- Supabase: DB (families/routines/tasks/completions) + Storage (task-images)
- 認証: 家族コード（6桁数字、localStorageに保存）

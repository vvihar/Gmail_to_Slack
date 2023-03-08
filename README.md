# Gmail to Slack

## これはなに

Gmail に届いたメールのうち、あらかじめ設定しておいたフィルターにマッチするものを、Slack の任意のチャンネルに転送します。

Slack の有料版では、標準で似た機能を利用できます。

## 使い方

1. FairWind の Google アカウントにログインした状態で Google ドライブを開きます。
2. 「**新規**」→「**その他**」→「**Google Apps Script**」を順にクリックし、GAS のファイルを新規作成します。
3. デフォルトでは`コード.gs`が開いていると思います。このファイルの中身を全て削除し、本リポジトリの`script.js`の中身に書き換えます。このとき、変数`EVENT_LABEL`と`WEBHOOK_URL`は適宜変更します。
4. `コード.gs`を保存し、トリガーを設定します。
5. Gmail の設定を開き、転送したいメールに`EVENT_LABEL`と同名のラベルを付与するように設定します。

## Incoming Webhook の URL の取得方法

1. [Slack App の管理画面](https://api.slack.com/apps/)から「**Create New App**」→「**From Scratch**」を順にクリックし、任意の App Name とワークスペースを指定します。「**Create App**」をクリックします。
2. 「**Incoming Webhooks**」をクリックし、これを *On* にします。
3. 「**Add New Webhook to Workspace**」をクリックし、投稿先のチャンネルを指定します。
4. 「**Webhook URL**」をコピーして、使用します。

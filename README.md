# time-event-announcer
日付の範囲を設定して、本日がその日付に該当する場合、設定した時刻に音声を再生する

### VoiceVoxAPI
* apiKey
E272w1052-M68-5

* apiKey sha256ハッシュ
973549a4ca87e7e728ba682918118673c86c25917a21f8bad87af7264ad9b0ce

> Step 2: apiKeyをtts.questに登録する。
コピーしたapiKeyのsha256ハッシュ値を、「sha256(apiKey)」欄に貼り付けて送信してください。それ以外の記入欄は空欄でも差し支えありません。申請にはGoogleアカウントが必要ですが、アカウント情報がsu-shiki.com並びにtts.questに共有されることはありません。別タブで開く場合はこちら。 

### 例
https://deprecatedapis.tts.quest/v2/voicevox/audio/?text=ここに何か入力&key=E272w1052-M68-5

https://deprecatedapis.tts.quest/v2/voicevox/audio/?key=E272w1052-M68-5&speaker=1&text=こんにちはなのだ

### ビルド
```bash
node build.js
```

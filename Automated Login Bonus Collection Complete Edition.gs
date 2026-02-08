/* =================================================================================
 *  【設定セクション】 トークンやアカウントの設定はここで行ってください
 * ================================================================================= */

const Accounts = [
  {
    /**
     * [1] アカウントの識別名（任意）
     */
    accountName: "マイアカウント",

    /**
     * [2] HoYoLAB（原神 / スタレ / ゼンゼロ / 崩壊3rd）の設定
     * 書き換え場所: 'token'
     */
    Genshin: true,
    StarRail: true,
    ZenlessZoneZero: true,
    Honkai3rd: true,
    // HoYoLABのトークン: ltuid_v2=xxxx; ltoken_v2=xxxx;
    token: "",

    /**
     * [3] アークナイツ：エンドフィールドの設定
     * 書き換え場所: 'Endfield_token'
     * 注意: HoYoLABのトークンとは別物です。
     * 取得方法: 公式サイト(https://game.skport.com/endfield/sign-in)にログインし、
     * DevTools > Application > Cookies > .skport.com > ACCOUNT_TOKEN の値をコピーしてください。
     */
    Endfield: true,

    // ACCOUNT_TOKEN(%を/に変える)
    Endfield_token: "",

    /**
     * [4] Discord通知設定（任意）
     * 失敗時のみ通知したい場合は、ここにWebhook URLを入力してください。
     */
    discordWebhookUrl: "",

    /**
     * [5] 通知カスタマイズ
     */
    mention: "@everyone", // メンション設定 ( "@everyone" や "<@ユーザーID>" など )
    notificationColor: 16711680, // 通知の色 (10進数のカラーコード)
    notificationTitle: "サインイン失敗通知"
  }
];

/* =================================================================================
 *  ※ これより下のコードは、不具合の原因となるため変更しないでください。
 * ================================================================================= */

const urlDict = {
  Genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=ja-jp&act_id=e202102251931481',
  StarRail: 'https://sg-public-api.hoyolab.com/event/luna/hkrpg/os/sign?lang=ja-jp&act_id=e202303301540311',
  ZZZ: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign?lang=ja-jp&act_id=e202406031448091',
  Honkai3rd: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=ja-jp&act_id=e202110291205111',
  Endfield: 'https://zonai.skport.com/web/v1/game/endfield/attendance',
  EndfieldGrant: 'https://as.gryphline.com/user/oauth2/v2/grant',
  EndfieldCred: 'https://zonai.skport.com/web/v1/user/auth/generate_cred_by_code',
  EndfieldRefresh: 'https://zonai.skport.com/web/v1/auth/refresh',
  EndfieldBinding: 'https://zonai.skport.com/api/v1/game/player/binding'
}

const endfield_constants = {
  APP_CODE: "6eb76d4e13aa36e6",
  PLATFORM: "3",
  VNAME: "1.0.0",
}

const games = {
  Genshin: {
    name: '原神　　　　　　　',
    infoUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/info?lang=ja-jp&act_id=e202102251931481',
    homeUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/home?lang=ja-jp&act_id=e202102251931481'
  },
  StarRail: {
    name: '崩壊：スターレイル',
    infoUrl: 'https://sg-public-api.hoyolab.com/event/luna/hkrpg/os/info?lang=ja-jp&act_id=e202303301540311',
    homeUrl: 'https://sg-public-api.hoyolab.com/event/luna/hkrpg/os/home?lang=ja-jp&act_id=e202303301540311'
  },
  ZZZ: {
    name: 'ゼンレスゾーンゼロ',
    infoUrl: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/info?lang=ja-jp&act_id=e202406031448091',
    homeUrl: 'https://sg-public-api.hoyolab.com/event/luna/zzz/os/home?lang=ja-jp&act_id=e202406031448091'
  },
  Honkai3rd: {
    name: '崩壊３ｒｄ　　　　',
    infoUrl: 'https://sg-public-api.hoyolab.com/event/mani/info?lang=ja-jp&act_id=e202110291205111',
    homeUrl: 'https://sg-public-api.hoyolab.com/event/mani/home?lang=ja-jp&act_id=e202110291205111'
  },
  Endfield: {
    name: 'エンドフィールド　',
    infoUrl: 'https://zonai.skport.com/web/v1/game/endfield/attendance',
    homeUrl: ''
  }
};

function main() {
  Accounts.forEach(account => {
    const result = autoSignFunction(account);
    console.log(result);
  });
}

function createOptions(method, token, extraHeaders = {}) {
  const headers = {
    'Cookie': token,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'x-rpc-app_version': '2.34.1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-rpc-client_type': '4',
    'Referer': 'https://act.hoyolab.com/',
    'Origin': 'https://act.hoyolab.com',
    ...extraHeaders
  };
  return {
    method,
    headers,
    muteHttpExceptions: true,
  };
}

function createEndfieldOptions(method, cred, roleId, sign, timestamp) {
  const headers = {
    'cred': cred,
    'sk-game-role': roleId,
    'platform': endfield_constants.PLATFORM,
    'vname': endfield_constants.VNAME,
    'sk-language': 'en',
    'timestamp': timestamp || Math.floor(Date.now() / 1000).toString(),
    'accept': '*/*',
    'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json',
    'Referer': 'https://game.skport.com/',
    'Origin': 'https://game.skport.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  };
  if (sign) {
    headers['sign'] = sign;
  }
  return {
    method,
    headers,
    muteHttpExceptions: true,
    ...(method === 'POST' ? { payload: "{}" } : {})
  };
}

function autoSignFunction(account) {
  const { 
    token, Genshin, StarRail, ZenlessZoneZero, Honkai3rd, Endfield, 
    accountName, Endfield_token, discordWebhookUrl,
    mention, notificationColor, notificationTitle 
  } = account;
  const urls = [];
  const postOptionsList = [];
  const getOptionsList = [];
  const failureMessages = [];

  // HoYoLAB Games
  if (Genshin) {
    urls.push(urlDict.Genshin);
    postOptionsList.push(createOptions('POST', token));
    getOptionsList.push(createOptions('GET', token));
  }
  if (StarRail) {
    urls.push(urlDict.StarRail);
    postOptionsList.push(createOptions('POST', token, { 'x-rpc-signgame': 'hkrpg' }));
    getOptionsList.push(createOptions('GET', token, { 'x-rpc-signgame': 'hkrpg' }));
  }
  if (ZenlessZoneZero) {
    urls.push(urlDict.ZZZ);
    postOptionsList.push(createOptions('POST', token, { 'x-rpc-signgame': 'zzz' }));
    getOptionsList.push(createOptions('GET', token, { 'x-rpc-signgame': 'zzz' }));
  }
  if (Honkai3rd) {
    urls.push(urlDict.Honkai3rd);
    postOptionsList.push(createOptions('POST', token));
    getOptionsList.push(createOptions('GET', token));
  }

  let response = `${accountName}\n`;

  // Process HoYoLAB Games
  if (urls.length > 0) {
    const httpResponses = UrlFetchApp.fetchAll(urls.map((url, i) => ({
      url,
      ...postOptionsList[i]
    })));
    for (const [i, hoyolabResponse] of httpResponses.entries()) {
      const parsedResponse = JSON.parse(hoyolabResponse);
      const checkInResult = parsedResponse.message;
      const enGameName = Object.keys(urlDict).find(key => urlDict[key] === urls[i]);
      const gameName = games[enGameName].name;
      const bannedCheck = parsedResponse.data?.gt_result?.is_risk;

      if (bannedCheck) {
        const msg = `${gameName} ≫ CAPTCHA認証に失敗しました。手動でログインを試みて下さい。`;
        response += `\n${msg}`;
        failureMessages.push(msg);
      } else {
        // "already"（取得済み）が含まれるメッセージの場合は失敗リストに入れない
        if (checkInResult !== "OK" && !checkInResult.toLowerCase().includes("already")) {
          failureMessages.push(`${gameName} ≫ ${checkInResult}`);
        }
        response = processGameCheckIn(gameName, checkInResult, games[enGameName].infoUrl, games[enGameName].homeUrl, response, getOptionsList[i]);
      }
    }
  }

  // Endfield Game (SKPort)
  if (Endfield && Endfield_token) {
    try {
      const auth = getEndfieldAuth(Endfield_token);
      if (!auth) {
        const msg = `${games.Endfield.name} ≫ ログインに失敗しました。トークンを確認してください。`;
        response += `\n${msg}`;
        failureMessages.push(msg);
      } else {
        const { cred, signToken, roleId } = auth;
        const endfieldUrl = urlDict.Endfield;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = computeSign("/web/v1/game/endfield/attendance", "{}", timestamp, signToken);
        const postOptions = createEndfieldOptions('POST', cred, roleId, signature, timestamp);
        
        const signResp = UrlFetchApp.fetch(endfieldUrl, postOptions);
        const signData = JSON.parse(signResp.getContentText());
        
        // コード 0: 完了, 1001/10001: 済み
        if (signData.code === 0) {
          response += `\n${games.Endfield.name} ≫ サインイン完了`;
        } else if (signData.code === 1001 || signData.code === 10001 || (signData.message && signData.message.includes("already"))) {
          response += `\n${games.Endfield.name} ≫ 本日はサインイン済みです`;
        } else {
          const msg = `${games.Endfield.name} ≫ エラー: ${signData.message || signData.msg || "不明なエラー"}`;
          response += `\n${msg}`;
          failureMessages.push(msg);
        }
      }
    } catch (e) {
      const msg = `${games.Endfield.name} ≫ システムエラー: ${e.message}`;
      console.error("Endfield Error:", e);
      response += `\n${msg}`;
      failureMessages.push(msg);
    }
  }

  // 失敗がある場合のみDiscord通知
  if (discordWebhookUrl && failureMessages.length > 0) {
    sendDiscordNotification(discordWebhookUrl, accountName, failureMessages, {
      mention: mention,
      color: notificationColor,
      title: notificationTitle
    });
  }

  return response;
}

function sendDiscordNotification(webhookUrl, accountName, messages, config) {
  const payload = {
    content: config.mention || "",
    embeds: [{
      title: config.title || "サインイン失敗通知",
      description: `アカウント: **${accountName}** で一部のサインインに失敗しました。`,
      color: config.color || 16711680,
      fields: messages.map(msg => ({
        name: "失敗詳細",
        value: msg,
        inline: false
      })),
      timestamp: new Date().toISOString()
    }]
  };

  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (e) {
    console.error("Discord notification failed:", e);
  }
}

function processGameCheckIn(gameName, checkInResult, infoUrl, homeUrl, response, getOptions) {
  if (checkInResult === "OK") {
    const daysData = fetchData(infoUrl, getOptions);
    const itemData = fetchData(homeUrl, getOptions);
    if (daysData && itemData) {
      response += `\n${gameName} ≫［${daysData.data.total_sign_day}日目］` + 
                  `${itemData.data.awards[daysData.data.total_sign_day - 1].name} ` +
                  `(${itemData.data.awards[daysData.data.total_sign_day - 1].cnt})`;
    } else {
      response += `\n${gameName} ≫ データの取得に失敗しました。`;
    }
  } else {
    response += `\n${gameName} ≫ ${checkInResult}`;
  }
  return response;
}

function fetchData(url, getOptions) {
  try {
    return JSON.parse(UrlFetchApp.fetch(url, getOptions));
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return null;
  }
}

/* --- Endfield Auth Helpers --- */

function getEndfieldAuth(token) {
  const oauthCode = getOAuthCode(token);
  if (!oauthCode) return null;

  const cred = getCred(oauthCode);
  if (!cred) return null;

  const signToken = getSignToken(cred);
  if (!signToken) return null;

  const roleId = getPlayerBinding(cred, signToken);
  
  return { cred, signToken, roleId };
}

function getOAuthCode(token) {
  const payload = { token: token, appCode: endfield_constants.APP_CODE, type: 0 };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(urlDict.EndfieldGrant, options);
  const json = JSON.parse(response.getContentText());
  return (json.status === 0 && json.data && json.data.code) ? json.data.code : null;
}

function getCred(oauthCode) {
  const payload = { kind: 1, code: oauthCode };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(urlDict.EndfieldCred, options);
  const json = JSON.parse(response.getContentText());
  return (json.code === 0 && json.data && json.data.cred) ? json.data.cred : null;
}

function getSignToken(cred) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const headers = { "cred": cred, "platform": endfield_constants.PLATFORM, "vname": endfield_constants.VNAME, "timestamp": timestamp, "sk-language": "en" };
  const options = { method: 'get', headers: headers, muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(urlDict.EndfieldRefresh, options);
  const json = JSON.parse(response.getContentText());
  return (json.code === 0 && json.data && json.data.token) ? json.data.token : null;
}

function getPlayerBinding(cred, signToken) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const path = "/api/v1/game/player/binding";
  const signature = computeSign(path, "", timestamp, signToken);
  const headers = { "cred": cred, "platform": endfield_constants.PLATFORM, "vname": endfield_constants.VNAME, "timestamp": timestamp, "sk-language": "en", "sign": signature };
  const options = { method: 'get', headers: headers, muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(urlDict.EndfieldBinding, options);
  const json = JSON.parse(response.getContentText());

  if (json.code === 0 && json.data && json.data.list) {
    const apps = json.data.list;
    for (let i = 0; i < apps.length; i++) {
      if (apps[i].appCode === "endfield" && apps[i].bindingList) {
        const binding = apps[i].bindingList[0];
        const role = binding.defaultRole || (binding.roles && binding.roles[0]);
        if (role) return `3_${role.roleId}_${role.serverId}`;
      }
    }
  }
  return null;
}

function computeSign(path, body, timestamp, signToken) {
  const headerObj = { "platform": endfield_constants.PLATFORM, "timestamp": timestamp, "dId": "", "vName": endfield_constants.VNAME };
  const headersJson = JSON.stringify(headerObj);
  const signString = path + body + timestamp + headersJson;
  const hmacBytes = Utilities.computeHmacSha256Signature(signString, signToken);
  const hmacHex = bytesToHex(hmacBytes);
  const md5Bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, hmacHex, Utilities.Charset.UTF_8);
  return bytesToHex(md5Bytes);
}

function bytesToHex(bytes) {
  return bytes.map(function (byte) { return ('0' + (byte & 0xFF).toString(16)).slice(-2); }).join('');
}



const event_label = "追い風ツアー";
// Slackに転送したいメールには、「Slack」と上のevent_labelの2つのラベルを自動で付与するようGmailで設定しておく
const webhook_url =
    "https://hooks.slack.com/services/XXXXXXXXXXX/XXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX";
// Incoming WebhookのURLを入力

function main() {
    const search_query = `label:${event_label} label:Slack`;
    const threads = GmailApp.search(search_query, 0, 100);

    threads.forEach((thread) => {
        thread.getMessages().forEach((message) => {
            send_to_slack(message);
        });
        const slack_label = GmailApp.getUserLabelByName("Slack");
        GmailApp.createLabel("Slack送信済み");
        const slack_done_label = GmailApp.getUserLabelByName("Slack送信済み");
        slack_label.removeFromThread(thread);
        slack_done_label.addToThread(thread);
    });
}

const emailRe = new RegExp(
    "[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*.)+[a-zA-Z]{2,}"
);
const nameRe = new RegExp('"[^"]*"');

function emailOf(s) {
    const m = s.match(emailRe);
    if (m) {
        // m != null
        return m[0];
    }
    return "";
}

function nameOf(s) {
    const m = s
        .replace(
            / <[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*.)+[a-zA-Z]{2,}>/,
            ""
        )
        .replace(/"/g, "");
    return m;
}

function send_to_slack(message) {
    const headers = { "Content-type": "application/json" };
    const from_name = nameOf(message.getFrom());
    const from_email = emailOf(message.getFrom());
    const has_attachments = message.getAttachments().length > 0;
    const data = {
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: message.getSubject(),
                    emoji: true,
                },
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `${from_name} (${from_email})`,
                },
            },
            {
                type: "divider",
            },
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: message
                        .getPlainBody()
                        .split(
                            "///////////////////////////////////////////"
                        )[0], // FWの署名を削除
                },
            },
        ],
    };
    if (has_attachments) {
        data.blocks.push(
            {
                type: "divider",
            },
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: "このメールには添付ファイルがあります。",
                },
            }
        );
    }
    const options = {
        method: "post",
        headers: headers,
        payload: JSON.stringify(data),
        muteHttpExceptions: true,
    };
    UrlFetchApp.fetch(webhook_url, options);
}

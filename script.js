const EVENT_LABEL = "追い風ツアー";
// Slackに転送したいメールには、上のEVENT_LABELを自動で付与するようGmailで設定しておく
const WEBHOOK_URL =
    "https://hooks.slack.com/services/XXXXXXXXXXX/XXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX";
// Incoming WebhookのURLを入力

function main() {
    const searchQuery = `label:${EVENT_LABEL} -label:Slack送信済み`;
    const threads = GmailApp.search(searchQuery, 0, 100);

    threads.forEach((thread) => {
        thread.getMessages().forEach((message) => {
            sendToSlack(message);
        });
        GmailApp.createLabel("Slack送信済み");
        const slackDoneLabel = GmailApp.getUserLabelByName("Slack送信済み");
        slackDoneLabel.addToThread(thread);
    });
}

function emailOf(s) {
    const emailRe = new RegExp(
        "[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*.)+[a-zA-Z]{2,}"
    );
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

function sendToSlack(message) {
    const headers = { "Content-type": "application/json" };
    const fromName = nameOf(message.getFrom());
    const fromEmail = emailOf(message.getFrom());
    const hasAttachments = message.getAttachments().length > 0;
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
                    type: "plain_text",
                    text: `${fromName} (${fromEmail})`,
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
    if (hasAttachments) {
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
    UrlFetchApp.fetch(WEBHOOK_URL, options);
}

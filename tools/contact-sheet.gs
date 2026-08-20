/* ==========================================================
   CONTACT FORM -> GOOGLE SHEET

   Records every contact-form submission as a row, so there is a
   permanent, searchable list of everyone who has written in.
   Web3Forms still delivers the email; this only keeps the record.

   SETUP (about five minutes, in Adhithya's Google account)

   1. Create a new Google Sheet. Name it something like
      "Adhithya - Website Enquiries".

   2. In that Sheet: Extensions > Apps Script.
      Delete whatever is in the editor and paste this whole file.
      The script must be created FROM the Sheet this way, so that
      getActiveSpreadsheet() below resolves to it.

   3. Save, then Deploy > New deployment.
        Select type      : Web app
        Description      : contact form
        Execute as       : Me
        Who has access   : Anyone            <-- required, see note
      Deploy, approve the permission prompt, and copy the
      "Web app URL". It ends in /exec

   4. Paste that URL into index.html, on the contact form:
        data-sheet-endpoint="https://script.google.com/.../exec"

   "Who has access: Anyone" sounds broad but only means the URL can
   receive an unauthenticated POST -- which is what a public contact
   form needs. The script only ever appends a row; it never reads the
   Sheet back out or returns its contents. The Sheet itself stays
   private to the account that owns it.

   To check it works, open the /exec URL in a browser. A GET returns
   a small JSON status rather than writing anything.
========================================================== */

var SHEET_NAME = "Enquiries";

/* Set to true and fill in NOTIFY_TO if you ever want this script to
   send the email too -- useful as a backstop if Web3Forms runs out of
   its 250 free submissions in a month. Off by default, because
   Web3Forms is handling delivery. */

var ALSO_EMAIL = false;
var NOTIFY_TO  = "adhithyadinesh11@gmail.com";


function doPost(e) {

    try {

        var data = {};

        /* The site posts JSON as text/plain, which keeps it a "simple"
           CORS request and avoids a preflight Apps Script cannot answer.
           Fall back to normal form parameters just in case. */

        if (e && e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else if (e && e.parameter) {
            data = e.parameter;
        }

        var name    = String(data.name    || "").slice(0, 200);
        var email   = String(data.email   || "").slice(0, 200);
        var message = String(data.message || "").slice(0, 5000);

        if (!email && !name && !message) {
            return respond_({ ok: false, error: "empty submission" });
        }

        sheet_().appendRow([
            new Date(),
            name,
            email,
            message,
            String(data.page || ""),
            String(data.userAgent || "").slice(0, 300)
        ]);

        if (ALSO_EMAIL) {
            MailApp.sendEmail({
                to: NOTIFY_TO,
                subject: "Website enquiry from " + (name || email || "a visitor"),
                replyTo: email || undefined,
                body: "Name:  " + name +
                    "\nEmail: " + email +
                    "\n\n" + message
            });
        }

        return respond_({ ok: true });

    } catch (err) {

        /* Log and report, but never throw -- the site treats this call
           as best-effort and must not show the visitor an error just
           because the record failed. */

        console.error(err);

        return respond_({ ok: false, error: String(err) });

    }

}


function doGet() {

    var sheet = sheet_();

    return respond_({
        ok: true,
        sheet: SHEET_NAME,
        rows: Math.max(0, sheet.getLastRow() - 1)
    });

}


function sheet_() {

    var book  = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = book.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {

        sheet.appendRow([
            "Received", "Name", "Email", "Message", "Page", "User agent"
        ]);

        sheet.setFrozenRows(1);

        sheet.setColumnWidth(1, 150);
        sheet.setColumnWidth(2, 160);
        sheet.setColumnWidth(3, 220);
        sheet.setColumnWidth(4, 420);

    }

    return sheet;

}


function respond_(payload) {

    return ContentService
        .createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);

}

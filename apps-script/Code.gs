/**
 * ราตรีบัณฑิต 2569 — BACK TO SCHOOL (Bio KKU)
 * Backend: Google Apps Script Web App ผูกกับ Google Sheet + Drive
 *
 * ล็อกอิน/ระบุตัวตนด้วย "รหัสนักศึกษา" (ไม่ใช้ Google) — รหัส นศ. = unique key
 *
 * วิธีใช้ (ดู README):
 *  1) วางโค้ดนี้ใน Apps Script ที่ผูกกับ Google Sheet
 *  2) รัน setup() หนึ่งครั้ง
 *  3) Deploy > Web app (Execute as: Me, Who has access: Anyone)
 */

// ====== ตั้งค่า ======
var SHEET_NAME = 'registrations';
var SUMMARY_NAME = 'summary';
var PHOTO_FOLDER = 'profile_photos';
var TICKET_PREFIX = 'BIO69';

var HEADERS = [
  'ticket_id', 'created_at', 'updated_at', 'student_id',
  'first_name', 'last_name', 'nickname', 'year_level', 'major', 'faculty',
  'phone', 'line_id', 'instagram', 'food_type', 'food_allergy', 'bio',
  'profile_image_url', 'show_photo_on_ticket', 'status', 'checked_in_at',
];

// ====== Entry point ======
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var out;
    switch (body.action) {
      case 'getMe': out = handleGetMe(body); break;
      case 'register': out = handleRegister(body); break;
      case 'updateProfile': out = handleUpdateProfile(body); break;
      case 'deleteMe': out = handleDelete(body); break;
      case 'checkin': out = handleCheckin(body); break;
      case 'getStats': out = handleGetStats(); break;
      default: out = err('BAD_ACTION', 'ไม่รู้จักคำสั่งนี้');
    }
    return json(out);
  } catch (ex) {
    return json(err('SERVER_ERROR', 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์: ' + ex));
  }
}

function doGet() {
  return json(ok({ service: 'ratree-bundit-2569', up: true }));
}

// ====== ตรวจรหัสนักศึกษา ======
function normId(id) {
  return String(id == null ? '' : id).trim();
}
function validId(id) {
  return /^[0-9][0-9-]{6,14}$/.test(id);
}

// ====== Handlers ======
function handleGetMe(body) {
  var sid = normId(body.student_id);
  if (!sid) return err('NO_ID', 'กรุณากรอกรหัสนักศึกษา');
  var row = findRowById(sid);
  if (!row) return ok(null);
  return ok(rowToRecord(row.values, true));
}

function handleRegister(body) {
  var sid = normId(body.student_id);
  if (!validId(sid)) return err('BAD_ID', 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (findRowById(sid)) {
      return err('ALREADY_REGISTERED', 'รหัสนักศึกษานี้ลงทะเบียนไว้แล้ว');
    }
    var sheet = getSheet();
    var ticketId = nextTicketId(sheet);
    var now = nowTh();

    var imageUrl = '';
    if (body.imageBase64) imageUrl = savePhoto(ticketId, body.imageBase64);

    var rec = {
      ticket_id: ticketId,
      created_at: now,
      updated_at: now,
      student_id: sid,
      first_name: body.first_name,
      last_name: body.last_name,
      nickname: body.nickname,
      year_level: body.year_level,
      major: body.major,
      faculty: body.faculty,
      phone: body.phone,
      line_id: body.line_id || '',
      instagram: body.instagram || '',
      food_type: body.food_type,
      food_allergy: body.food_allergy || '',
      bio: body.bio || '',
      profile_image_url: imageUrl,
      show_photo_on_ticket: !!body.show_photo_on_ticket,
      status: 'registered',
      checked_in_at: '',
    };
    sheet.appendRow(HEADERS.map(function (h) { return sanitize(rec[h]); }));
    return ok(recordWithPhoto(rec, body.imageBase64));
  } finally {
    lock.releaseLock();
  }
}

function handleUpdateProfile(body) {
  var sid = normId(body.student_id);
  if (!sid) return err('NO_ID', 'กรุณาระบุรหัสนักศึกษา');
  var found = findRowById(sid);
  if (!found) return err('NOT_REGISTERED', 'ยังไม่ได้ลงทะเบียน');

  var rec = rowToRecord(found.values, false);
  // แก้ได้เฉพาะฟิลด์เหล่านี้ (ticket_id / student_id / created ไม่เปลี่ยน)
  var editable = ['first_name', 'last_name', 'nickname', 'year_level', 'major', 'faculty',
    'phone', 'line_id', 'instagram', 'food_type', 'food_allergy', 'bio',
    'show_photo_on_ticket'];
  editable.forEach(function (f) {
    if (body[f] !== undefined && body[f] !== null) rec[f] = body[f];
  });
  if (body.imageBase64) rec.profile_image_url = savePhoto(rec.ticket_id, body.imageBase64);
  rec.updated_at = nowTh();

  var sheet = getSheet();
  var rowData = HEADERS.map(function (h) { return sanitize(rec[h]); });
  sheet.getRange(found.rowIndex, 1, 1, HEADERS.length).setValues([rowData]);
  return ok(recordWithPhoto(rec, body.imageBase64 || readPhotoBase64(rec.profile_image_url)));
}

function handleDelete(body) {
  var sid = normId(body.student_id);
  if (!sid) return err('NO_ID', 'กรุณาระบุรหัสนักศึกษา');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var found = findRowById(sid);
    if (!found) return err('NOT_REGISTERED', 'ไม่พบข้อมูลการลงทะเบียน');
    var rec = rowToRecord(found.values, false);
    deletePhoto(rec.ticket_id);
    getSheet().deleteRow(found.rowIndex);
    return ok({ deleted: true });
  } finally {
    lock.releaseLock();
  }
}

// เช็คอินด้วยรหัสนักศึกษา (ผู้จัดงานสแกน QR) — เทียบกับ Sheet
function handleCheckin(body) {
  var sid = normId(body.student_id);
  if (!sid) return err('NO_ID', 'ไม่พบรหัสนักศึกษาจาก QR');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var found = findRowById(sid);
    if (!found) return err('NOT_FOUND', 'ไม่พบรหัสนี้ในระบบ (ยังไม่ได้ลงทะเบียน)');
    var rec = rowToRecord(found.values, false);
    var already = String(rec.status) === 'checked_in';
    if (!already) {
      rec.status = 'checked_in';
      rec.checked_in_at = nowTh();
      getSheet().getRange(found.rowIndex, 1, 1, HEADERS.length)
        .setValues([HEADERS.map(function (h) { return sanitize(rec[h]); })]);
    }
    return ok({
      already: already,
      ticket_id: rec.ticket_id,
      student_id: rec.student_id,
      first_name: rec.first_name,
      last_name: rec.last_name,
      nickname: rec.nickname,
      year_level: rec.year_level,
      food_type: rec.food_type,
      checked_in_at: rec.checked_in_at,
    });
  } finally {
    lock.releaseLock();
  }
}

function handleGetStats() {
  var sheet = getSheet();
  var total = Math.max(0, sheet.getLastRow() - 1);
  return ok({ total: total });
}

// ====== Sheet helpers ======
function getSS() { return SpreadsheetApp.getActiveSpreadsheet(); }

function getSheet() {
  var s = getSS().getSheetByName(SHEET_NAME);
  if (!s) throw { code: 'NO_SHEET', msg: 'ยังไม่ได้รัน setup()' };
  return s;
}

function findRowById(sid) {
  var sheet = getSheet();
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var col = HEADERS.indexOf('student_id') + 1;
  var ids = sheet.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (normId(ids[i][0]) === sid) {
      var rowIndex = i + 2;
      var values = sheet.getRange(rowIndex, 1, 1, HEADERS.length).getValues()[0];
      return { rowIndex: rowIndex, values: values };
    }
  }
  return null;
}

function nextTicketId(sheet) {
  var last = sheet.getLastRow();
  var n = 1;
  if (last >= 2) {
    var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    var max = 0;
    ids.forEach(function (r) {
      var m = String(r[0]).match(/(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    n = max + 1;
  }
  return TICKET_PREFIX + '-' + ('0000' + n).slice(-4);
}

function rowToRecord(values, withPhoto) {
  var rec = {};
  HEADERS.forEach(function (h, i) { rec[h] = values[i]; });
  rec.show_photo_on_ticket = rec.show_photo_on_ticket === true ||
    String(rec.show_photo_on_ticket).toLowerCase() === 'true';
  rec.student_id = normId(rec.student_id);
  if (withPhoto) return recordWithPhoto(rec, readPhotoBase64(rec.profile_image_url));
  return rec;
}

// แนบรูป base64 กลับไปให้ frontend วาดตั๋ว (เลี่ยง CORS จาก Drive URL)
function recordWithPhoto(rec, base64) {
  var out = {};
  for (var k in rec) out[k] = rec[k];
  out.profile_image_base64 = base64 || null;
  return out;
}

// ====== Drive / รูป ======
function getPhotoFolder() {
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(PHOTO_FOLDER);
}

function savePhoto(ticketId, dataUrl) {
  var m = String(dataUrl).match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) return '';
  var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], ticketId + '.jpg');
  var folder = getPhotoFolder();
  var existing = folder.getFilesByName(ticketId + '.jpg');
  while (existing.hasNext()) existing.next().setTrashed(true);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?id=' + file.getId();
}

function deletePhoto(ticketId) {
  try {
    var folder = getPhotoFolder();
    var files = folder.getFilesByName(ticketId + '.jpg');
    while (files.hasNext()) files.next().setTrashed(true);
  } catch (e) { /* ไม่มีรูปก็ข้าม */ }
}

function readPhotoBase64(url) {
  if (!url) return null;
  var m = String(url).match(/[?&]id=([^&]+)/);
  if (!m) return null;
  try {
    var blob = DriveApp.getFileById(m[1]).getBlob();
    return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (e) {
    return null;
  }
}

// ====== Util ======
function nowTh() {
  return Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
}

// กัน formula injection: ขึ้นต้นด้วย = + - @ ให้เติม ' นำหน้า
function sanitize(v) {
  if (v === null || v === undefined) return '';
  if (v === true) return 'true';
  if (v === false) return 'false';
  var s = String(v);
  if (/^[=+\-@]/.test(s)) return "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function ok(data) { return { ok: true, data: data }; }
function err(code, msg) { return { ok: false, error: code, message: msg }; }

// ====== setup() — รันครั้งเดียว ======
function setup() {
  var ss = getSS();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  var foodCol = colLetter(HEADERS.indexOf('food_type') + 1);
  var statusCol = colLetter(HEADERS.indexOf('status') + 1);

  var sum = ss.getSheetByName(SUMMARY_NAME) || ss.insertSheet(SUMMARY_NAME);
  sum.clear();
  sum.getRange('A1').setValue('สรุปการลงทะเบียน');
  sum.getRange('A2').setValue('ลงทะเบียนทั้งหมด');
  sum.getRange('B2').setFormula('=COUNTA(' + SHEET_NAME + '!A2:A)');
  sum.getRange('A3').setValue('เช็กอินแล้ว');
  sum.getRange('B3').setFormula('=COUNTIF(' + SHEET_NAME + '!' + statusCol + '2:' + statusCol + ',"checked_in")');
  var foods = ['ทั่วไป', 'มังสวิรัติ', 'เจ', 'ฮาลาล'];
  foods.forEach(function (f, i) {
    sum.getRange(5 + i, 1).setValue('อาหาร: ' + f);
    sum.getRange(5 + i, 2).setFormula('=COUNTIF(' + SHEET_NAME + '!' + foodCol + '2:' + foodCol + ',"' + f + '")');
  });

  getPhotoFolder();
  Logger.log('setup เสร็จแล้ว');
}

function colLetter(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

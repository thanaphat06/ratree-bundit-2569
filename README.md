# ราตรีบัณฑิต 2569 — BACK TO SCHOOL (Bio KKU)

เว็บลงทะเบียนเข้างานราตรีบัณฑิต สาขาชีววิทยา มข.
กรอกรหัสนักศึกษา → ยอมรับ PDPA → กรอกข้อมูล → บันทึกลง Google Sheet → ได้ตั๋ว PNG ดาวน์โหลดได้

> ระบุตัวตนด้วย **รหัสนักศึกษา** (1 รหัส = 1 ตั๋ว) ไม่ต้องใช้ Google ล็อกอิน
> กลับมาดู/แก้ตั๋วได้โดยกรอกรหัสเดิม

- **Frontend:** Vite + React + TypeScript + Tailwind
- **Backend:** Google Apps Script Web App + Google Sheet + Google Drive (ฟรี ไม่ต้องมี server)

---

## ภาพรวมการตั้งค่า (ทำครั้งเดียว)

ทำ 3 อย่างนี้ตามลำดับ แล้วเว็บจะใช้งานได้ (**ไม่ต้องตั้งค่า Google OAuth**):

1. สร้าง Google Sheet + วางโค้ด Apps Script + รัน `setup()`
2. Deploy Apps Script เป็น Web App → ได้ URL
3. ใส่ URL ใน `.env` แล้ว deploy frontend ขึ้น GitHub

> ⚠️ ต้องแก้ค่า "สถานที่" และ "Dress code" ใน `src/config/event.ts` ก่อนเปิดใช้งานจริง

---

## 1) Google Sheet + Apps Script

1. สร้าง Google Sheet ใหม่ ตั้งชื่อ `RatreeBundit2569_Registrations`
2. เมนู **Extensions → Apps Script**
3. ลบโค้ดเดิม แล้ววางเนื้อหาจากไฟล์ `apps-script/Code.gs` ทั้งหมด
4. กด **Save** แล้วเลือกฟังก์ชัน `setup` จากดรอปดาวน์ → กด **Run**
   - ครั้งแรกจะขออนุญาตเข้าถึง Sheet/Drive → กด Allow
   - จะได้แท็บ `registrations`, `summary` และโฟลเดอร์ `profile_photos` อัตโนมัติ

## 2) Deploy Apps Script เป็น Web App

1. ในหน้า Apps Script กด **Deploy → New deployment**
2. เลือกชนิด **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
3. กด Deploy → คัดลอก **Web app URL** (ลงท้าย `/exec`)

> ทุกครั้งที่แก้ `Code.gs` ต้อง **Deploy → Manage deployments → แก้ไข version เป็น New version** ไม่งั้นโค้ดเก่ายังทำงานอยู่

## 3) Frontend

```bash
cp .env.example .env     # แล้วเติมค่า VITE_API_URL (URL จากขั้นที่ 2)
npm install
npm run dev              # เปิด http://localhost:5173
```

### Deploy ขึ้น GitHub

**ทางเลือก A — Vercel (ง่ายสุด):**
1. push โค้ดขึ้น GitHub repo
2. ไป https://vercel.com → Import repo → ใส่ Environment Variable `VITE_API_URL` → Deploy

**ทางเลือก B — GitHub Pages:**
1. ตั้งค่า base ให้ตรงชื่อ repo: ตอน build ให้ตั้ง env `VITE_BASE=/<ชื่อ-repo>/`
2. build แล้วเอาโฟลเดอร์ `dist/` ขึ้น branch `gh-pages` (หรือใช้ GitHub Action)
3. เพราะเป็น SPA (มีหลายหน้า) ให้ก็อป `dist/index.html` เป็น `dist/404.html` ด้วย เพื่อให้ refresh หน้า `/ticket` ไม่ 404

---

## แก้ค่าของงาน

ทุกอย่างอยู่ที่ `src/config/event.ts` ที่เดียว:
- สถานที่ (`venue`), Dress code (`dressCode`) — ปัจจุบันเป็น TBD
- `registrationDeadlineISO` — ใส่วันปิดรับ ฟอร์มจะปิดอัตโนมัติ (null = ไม่ปิด)
- ลิงก์ Facebook / Instagram

สีและฟอนต์อยู่ที่ `tailwind.config.js` (ดึงจากโปสเตอร์ธีมแล้ว)

---

## โครงสร้าง

```
apps-script/Code.gs      backend ทั้งหมด (verify token, register, getMe, updateProfile, getStats, setup)
public/theme-poster.png  โปสเตอร์ธีม
src/config/event.ts      ข้อมูลงาน + config
src/lib/                 auth (GIS), api, image (crop), ticket (วาด Canvas), schema (zod)
src/components/          Hero/Countdown/Stepper/PhotoUploader/TicketCanvas ...
src/pages/               Landing, Register, Ticket
```

## ความปลอดภัย & ข้อควรรู้

- ระบุตัวตนด้วย **รหัสนักศึกษา** กันลงทะเบียนซ้ำ: 1 รหัส = 1 ตั๋ว (ใช้ LockService กันเลขตั๋วชน)
- Sanitize ข้อความก่อนเขียน Sheet (กัน formula injection)
- Google Sheet และโฟลเดอร์รูป **อย่าแชร์สาธารณะ** แชร์เฉพาะทีมจัดงาน (ไฟล์รูปเป็น link-only เพื่อให้แสดงบนตั๋วได้)
- มีหน้าขอความยินยอม (PDPA) ก่อนเริ่มกรอกข้อมูล ผู้ใช้ต้องติ๊กยอมรับก่อน
- ⚠️ เนื่องจากใช้รหัสนักศึกษาอย่างเดียว (ไม่มีรหัสผ่าน) ใครที่รู้รหัสนักศึกษาของคนอื่นสามารถเปิดดู/แก้ตั๋วนั้นได้ — เป็นการแลกความสะดวกกับความปลอดภัย ยอมรับได้สำหรับงานนี้

## หมายเหตุ

- ตั๋ว export เป็น PNG 1080×1920 (9:16) วาดด้วย Canvas รอฟอนต์โหลดก่อนเพื่อให้ภาษาไทยคมถูกต้อง
- บน iOS Safari การดาวน์โหลดตรง ๆ อาจไม่ได้ ระบบจะเปิดรูปในแท็บใหม่ให้กดค้างเพื่อบันทึกแทน
"# ratree-bundit-2569" 

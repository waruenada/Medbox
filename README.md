# medbox

ขั้นตอนการใช้งาน

1. สร้าง bot บน [onchat](https://chat-develop.one.th/) : [https://chat-develop.one.th/](https://chat-develop.one.th/)

2. เตรียมโค้ดบอท
```
git clone https://github.com/developer-space/medbox.git
cd medbox
npm install
```
3. ตั้งค่า
- config/default.json
```
    {
        "PORT": 9000,                           <=== port สำหรับ expose บอท
                                                     default : 9000
        "BOTID": "Bdef36b...",                  <=== bot_id จาก bot ที่ทำการสร้างไว้ 
                                                     https://chat-develop.one.th/develop/homepage
        "AUTHORIZATION": "Bearer Af7e8af0...",  <=== Token Service (Authorization)
                                                     https://chat-develop.one.th/develop/information_dev
        "LOGSERVER": "https://example.com"      <=== url server สำหรับเก็บ log การใช้งาน
    }
```

- public/js/medbox.js
```
    # บรรทัดที่ 140-143
    let serviceuuid = <service_uuid>;
    let characteristicuuid = <characteristic_uuid>;
    let datawrite = '0006CC59513C4CAA6116D34BF71000B12EF8';
    let data_type = 'hex'; // text/hex
```

4. run bot
```
    node index.js                               <=== start bot
    
    # กรณีใช้ ngrok สำหรับ expose ให้สามารถเข้าใช้งานผ่านอินเตอร์เน็ตได้ (สำหรับทดสอบบนเครื่องส่วนตัว)
    run ngrog port 9000
    
    # e.g. url ngrok สำหรับใช้งาน
    https://abc.ngrok.io/botmenu/medicinebox
```

5. Link Url สำหรับนำไปใช้งานบนเมนูของบอท
```
    https://<URL>:9000/botmenu/medicinebox
```

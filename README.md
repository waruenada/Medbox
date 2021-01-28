# medbox

data ที่ต้องแก้ไขสำหรับเรียกใช้
- medicinebox.ejs
    บรรทัดที่ 16 ==> logEndpoint : <URL> //URL สำหรับอ่านค่า logEndpoint

- medbox.js
    บรรทัดที่ 140-143 ==>  let serviceuuid = <service_uuid>;
                        let characteristicuuid = <characteristic_uuid>;
                        let datawrite = '0006CC59513C4CAA6116D34BF71000B12EF8';
                        let data_type = 'hex'; // text/hex

- index.ja (botmenu)
    บรรทัดที่ 25-26 ==>    let bot_id = <bot-id>; // *bot id
                        let bearer = <Token Service (Authorization)>; // *Token Service (Authorization)

การเรียกใช้งาน 
    run file ==> node index.js
    run ngrog port 9000
    https://.........URL............/botmenu/medicinebox
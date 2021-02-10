let scan_job; 
let write_job;

function clearScanJob() {
    scan_job = {
        name : '',
        manufacturer_data : '',
        callback : ''
    }
}
clearScanJob();

function clearWriteJob() {
    write_job = {
        uuid : '',
        service: '',
        characteristic : '',
        callback : ''
    }
}
clearWriteJob();


function logtoHTML(input){
    //alert(input)
    let out = input;
    if (typeof(input) == 'object') {
      try {
          out =  JSON.stringify(input, undefined, 4);
      }
      catch(e) {
          alert(e);
      }
    }

    let debugbox = document.getElementById("devicelist");
    if (debugbox) {
      debugbox.innerHTML = out + '<br>-------------------------------------------------<br>' + document.getElementById("devicelist").innerHTML;
    }
}

function oneChatBluetoothCallBackData(type, data) {
    let message = '';
    try {
        if (type == 'get_device_service') {
            let obj = JSON.parse(data);

            for (let i = 0; i < obj.data.length; i++) {
                let d = obj.data[i];
                let mfdata = 'N/A';
                let m = {}, mx;

                if (d.manufacturer_data) {
                    try {
                        mx = d.manufacturer_data.replace(/[{} ]/g,'');
                        let arr= mx.split(',');
                        for (let c of arr) {
                            let b = c.split('=');
                            m[b[0]] = b[1];
                        }

                        if (m) {
                            mfdata = m.bytes;
                        }

                        if (scan_job.manufacturer_data && (scan_job.manufacturer_data == mfdata)) {
                            webkit.messageHandlers.OneChat_stopScanDevice.postMessage();
                            if (typeof (scan_job.callback) == 'function') {
                                scan_job.callback({
                                    count : i,
                                    name : d.bluetooth_name,
                                    uuid : d.uuid,
                                    manufacturer_data : d.manufacturer_data,
                                    state : d.state,
                                    rssi: d.rssi
                                });
                                clearScanJob();
                            }
                        }
                    }
                    catch(e) {
                        m = 'error'
                    }
                }
                else {
                    if (scan_job.name && (scan_job.name == d.bluetooth_name)) {
                        logtoHTML('****** to write --><br>' + JSON.stringify({type, data}));

                        webkit.messageHandlers.OneChat_stopScanDevice.postMessage();
                        if (typeof (scan_job.callback) == 'function') {
                            scan_job.callback({
                                round : i,
                                name : d.bluetooth_name,
                                uuid : d.uuid,
                                manufacturer_data : d.manufacturer_data,
                                state : d.state,
                                rssi: d.rssi
                            });
                            clearScanJob();
                        }
                    }
                }

                // message += `
                //     name : ${d.bluetooth_name}<br>
                //     uuid : ${d.uuid}<br>
                //     manufacturer_data : ${mfdata}<br>
                //     state : ${d.state}<br>
                //     rssi : ${d.rssi}<br>
                //     raw : ${d.manufacturer_data}<br>
                // `;
            }

            //logtoHTML(message);
        }
        else if (type == 'write_characteristic_by_uuid') {
            logtoHTML(data);
            if (data) {
                try {
                    let datajson = JSON.parse(data);
                    if (datajson.device_uuid) {
                        setTimeout(() => {
                            webkit.messageHandlers.OneChat_disconnectBluetoothByUUID.postMessage(datajson.device_uuid);
                            logtoHTML("disconnecting...");
                          }, 2000);

                        if (typeof(write_job.callback) == 'function') {
                            write_job.callback();
                        }
                    }
                }
                catch(e) {
                }
            }
        }
        else {
            if (type != 'return_once_device'  && type != 'start_scan_bluetooth' &&  type != 'stop_scan_bluetooth' ) {
                //alert(JSON.stringify({type, data}, undefined, 4));
                scandebug = false;
                logtoHTML(data);
            }
        }
    }
    catch(error) {

    }        
}


let MedBox = function(param) {
    this.logEndpoint = param.logEndpoint;
    this.oneID = param.oneID;
    this.timeout = param.timeout || 10000;
}


MedBox.prototype.log = function(data){
    fetch(this.logEndpoint, {
        method: 'post',
        credentials: 'include',
        mode: 'no-cors',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        console.log('Success:', res.json);
        alert(JSON.stringify(data));
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error:', error);
    });
}


MedBox.prototype.openBoxByQRCode = function(qrcode, callback){
      const time_scan = 10000;
      const scandebug = false;
      const TIMEOUT = this.timeout;

      function scanDevice(filter={}, callback) {
          try {
              if (filter.manufacturer_data) {
                  scan_job.manufacturer_data = filter.manufacturer_data;
                  if (callback) {
                      scan_job.callback = callback;
                  }
              }
              else if(filter.name) {
                  scan_job.name = filter.name;
                  if (callback) {
                      scan_job.callback = callback;
                  }
              }
              webkit.messageHandlers.scanDevice.postMessage(time_scan);
          }
          catch(error) {
        			alert('scanDevice ' + error);
          }
      }

      function unlockBLELock(mid, callback) {
          let timer = 0;
          timer = setTimeout(() => {
              write_job.callback = '';
              callback(404, 'Box not found');
          }, TIMEOUT);

          scanDevice(mid, function(info) {
              if (timer) {
                  clearTimeout(timer);
                  timer = 0;
              }
              timer = setTimeout(() => {
                  write_job.callback = '';
                  callback(500, 'Unlock Fail');
              }, TIMEOUT);

              logtoHTML(info);
              webkit.messageHandlers.OneChat_writeCharacteristicByUUID.postMessage({
                  device_uuid: info.uuid,
                  service_uuid: 'FF00',
                  characteristic_uuid: 'FF01',
                  data: '0006CC59513C4CAA6116D34BF71000B12EF8',
                  data_type : 'hex'
              });

              write_job.callback = function() {
                  if (timer) {
                      clearTimeout(timer);
                      timer = 0;
                  }
                  callback(200, 'Unlock OK');
              }
          });
      }

      if(qrcode) {
          let payload = {};
          let data = { "boxid": qrcode.toString() , "oneid": this.oneid, "time": new Date().getTime(), "result": "success"};

          if (qrcode.toLowerCase().startsWith('lys')) {
              payload = {'manufacturer_data':'0x'+qrcode.substr(3)};
          }
          else {
              payload = {'name': qrcode };
          }
          logtoHTML('Performing BLE scan for' + JSON.stringify(payload));
          unlockBLELock(payload, callback);
      }
}

function MedBoxController(param) {
  	return new MedBox(param);
}

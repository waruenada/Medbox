let MedBox = function(param) {
  	this.logEndpoint = param.logEndpoint;
    	this.oneID = param.oneID;
}
let scan_job;

function clearScanJob() {
    scan_job = {
        name : '',
        manufacturer_data : '',
        callback : ''
    }
}

clearScanJob();

function logtoHTML(input){
    let out = input;
    if (typeof(input) == 'object') {
      try {
          out =  JSON.stringify(input, undefined, 4);
      }
      catch(e) {
          alert(e);
      }
    }
    document.getElementById("devicelist").innerHTML = out + '<br>' + document.getElementById("devicelist").innerHTML;
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
                message += `
                    name : ${d.bluetooth_name}<br>
                    uuid : ${d.uuid}<br>
                    manufacturer_data : ${mfdata}<br>
                    state : ${d.state}<br>
                    rssi : ${d.rssi}<br>
                    raw : ${d.manufacturer_data}<br>
                    -----------------------------------------------------<br>
                `;
            }

            logtoHTML(message);
        }
        else {
            if (type != 'return_once_device'  && type != 'start_scan_bluetooth' && type != 'write_characteristic_by_uuid' && type != 'stop_scan_bluetooth' ) {
                scandebug = false;
                logtoHTML(data);
            }
        }
    }
    catch(error) {

    }
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
        //alert(JSON.stringify(data));
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error:', error);
    });
}

MedBox.prototype.openBoxByQRCode = function(qrcode){
      const time_scan = 10000;
      let serviceuuid = '....<service_uuid>....';
      let characteristicuuid = '.....<characteristic_uuid>.....';
      let datawrite = '0006CC59513C4CAA6116D34BF71000B12EF8';
      let data_type = 'hex';

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

      function unlockBLELock(mid) {
          scanDevice(mid, function(info) {
              logtoHTML(info);
              webkit.messageHandlers.OneChat_writeCharacteristicByUUID.postMessage({
                  device_uuid: info.uuid,
                  service_uuid: serviceuuid,
                  characteristic_uuid: characteristicuuid,
                  data: datawrite,
                  data_type : data_type
              });
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
          unlockBLELock(payload);
          logtoHTML('Performing BLE scan for' + JSON.stringify(payload));
          this.log(data);
      }

}

function MedBoxController(param) {
  	return new MedBox(param);
}


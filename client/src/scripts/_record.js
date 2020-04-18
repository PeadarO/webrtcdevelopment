/*-----------------------------------------------------------------------------------*/
/*                       Record JS                                                   */
/*-----------------------------------------------------------------------------------*/

/**
 * Create Record Button to call start and stop recoriding functions
 * @method
 * @name createRecordButton
 * @param {string} controlBarName
 * @param {json} peerinfo
 * @param {string} streamid
 * @param {blob} stream
 */
function createRecordButton(controlBarName, peerinfo, streamid, stream) {
    let recordButton = document.createElement("div");
    recordButton.id = controlBarName + "recordButton";
    recordButton.setAttribute("title", "Record");
    // recordButton.setAttribute("data-placement", "bottom");
    // recordButton.setAttribute("data-toggle", "tooltip");
    // recordButton.setAttribute("data-container", "body");
    recordButton.className = videoRecordobj.button.class_off;
    recordButton.innerHTML = videoRecordobj.button.html_off;
    recordButton.onclick = function (e) {
        if (recordButton.className == videoRecordobj.button.class_on) {
            recordButton.className = videoRecordobj.button.class_off;
            recordButton.innerHTML = videoRecordobj.button.html_off;
            stopRecord(peerinfo, streamid, stream);
        } else if (recordButton.className == videoRecordobj.button.class_off) {
            recordButton.className = videoRecordobj.button.class_on;
            recordButton.innerHTML = videoRecordobj.button.html_on;
            startRecord(peerinfo, streamid, stream);
        }
    };
    return recordButton;
}


var listOfRecorders = {};


/**
 * start Recording the stream using recordRTC
 * @method
 * @name startRecord
 * @param {json} peerinfo
 * @param {string} streamid
 * @param {blob} stream
 */
function startRecord(peerinfo, streamid, stream) {
    let recorder = RecordRTC(stream, {
        type: 'video',
        recorderType: MediaStreamRecorder,
    });
    recorder.startRecording();
    listOfRecorders[streamid] = recorder;
}

/**
 * stop Recording the stream using recordRTC
 * @method
 * @name stopRecord
 * @param {json} peerinfo
 * @param {string} streamid
 * @param {blob} stream
 */
function stopRecord(peerinfo, streamid, stream) {
    /*var streamid = prompt('Enter stream-id');*/

    if (!listOfRecorders[streamid]) {
        /*throw 'Wrong stream-id';*/
        webrtcdev.log("wrong stream id ");
    }
    let recorder = listOfRecorders[streamid];
    recorder.stopRecording(function () {
        let blob = recorder.getBlob();
        // if (!peerinfo) {
            if (selfuserid)
                peerinfo = findPeerInfo(selfuserid);
            else
                peerinfo = findPeerInfo(rtcConn.userid);
        // }

        /*        
        window.open( URL.createObjectURL(blob) );
        // or upload to server
        var formData = new FormData();
        formData.append('file', blob);
        $.post('/server-address', formData, serverCallback);*/

        let recordVideoname = "recordedvideo" + new Date().getTime();
        peerinfo.filearray.push(recordVideoname);
        let numFile = document.createElement("div");
        numFile.value = peerinfo.filearray.length;
        let fileurl = URL.createObjectURL(blob);

        displayList(peerinfo.uuid, peerinfo, fileurl, recordVideoname, "videoRecording");
        displayFile(peerinfo.uuid, peerinfo, fileurl, recordVideoname, "videoRecording");
    });
}

/**
 * stopping session Record
 * @method
 * @name stopSessionRecord
 * @param {json} peerinfo
 * @param {string} scrrecordStreamid
 * @param {blob} scrrecordStream
 * @param {string} scrrecordAudioStreamid
 * @param {blob} scrrecordAudioStream
 */
function stopSessionRecord(peerinfo, scrrecordStreamid, scrrecordStream, scrrecordAudioStreamid, scrrecordAudioStream) {
    /*var streamid = prompt('Enter stream-id');*/

    if (!listOfRecorders[scrrecordStreamid]) {
        /*throw 'Wrong stream-id';*/
        webrtcdev.log("wrong stream id scrrecordStreamid");
    }

    if (!listOfRecorders[scrrecordAudioStreamid]) {
        /*throw 'Wrong stream-id';*/
        webrtcdev.log("wrong stream id scrrecordAudioStreamid");
    }

    var recorder = listOfRecorders[scrrecordStreamid];
    recorder.stopRecording(function () {
        let blob = recorder.getBlob();
        webrtcdev.log("scrrecordStreamid stopped recording blob is ", blob);
    });

    var recorder2 = listOfRecorders[scrrecordAudioStreamid];
    recorder2.stopRecording(function () {
        let blob = recorder2.getBlob();
        webrtcdev.log("scrrecordStreamid stopped recording blob is ", blob);
    });

}

/*function startRecord(){
    rtcMultiConnection.streams[streamid].startRecording({
        audio: true,
        video: true
    });
}

function stopRecord(){
    rtcMultiConnection.streams[streamid].stopRecording(function (dataRecordedVideo) {
        for(i in webcallpeers ){
            if(webcallpeers[i].userid==rtcMultiConnection.userid){
                var recordVideoname = "recordedvideo"+ new Date().getTime();
                webcallpeers[i].filearray.push(recordVideoname);
                var numFile= document.createElement("div");
                numFile.value= webcallpeers[i].filearray.length;
                var fileurl=URL.createObjectURL(dataRecordedVideo.video);
                if(fileshareobj.active){
                    syncSnapshot(fileurl , "videoRecording" , recordVideoname );
                    displayList(rtcMultiConnection.uuid , rtcMultiConnection.userid  ,fileurl , recordVideoname , "videoRecording");
                    displayFile(rtcMultiConnection.uuid , rtcMultiConnection.userid , fileurl , recordVideoname , "videoRecording");
                }else{
                    displayFile(rtcMultiConnection.uuid , rtcMultiConnection.userid , fileurl , recordVideoname , "videoRecording");
                }
            }
        }
    }, {audio:true, video:true} );
}*/

/*-----------------------------------------------------------------------------------*/
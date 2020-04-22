/**
 * find information about a peer form array of peers based on userid
 * @method
 * @name findPeerInfo
 * @param {string} userid
 */
var findPeerInfo = function (userid) {
    /* find selfuser id faster which is index 0 of webcallpeers
    if(rtcConn.userid == userid){
        webrtcdev.log("PeerInfo is found for initiator", webcallpeers[0]);
        return webcallpeers[0];
    }
    */
    for (x in webcallpeers) {
        if (webcallpeers[x].userid == userid) {
            return webcallpeers[x];
        }
    }
    return null;
};

/**
 * get All Active Peers
 * @method
 * @name getAllActivePeers
 */
function getAllActivePeers () {
    return rtcConn.peers.getAllParticipants();
}


/**
 * update already existing webcallpeers obj by appending a value , mostly used for timer zone
 * @method
 * @name appendToPeerValue
 * @param {string} userid
 * @param {json} value
 */
function appendToPeerValue(userid, value) {
    for (x in webcallpeers) {
        if (webcallpeers[x].userid == userid) {
            webcallpeers[x].key = value;
        }
    }
}

/**
 * remove info about a peer in list of peers (webcallpeers)
 * @method
 * @name removePeerInfo
 * @param {string} userid
 * @param {string} usernamess
 * @param {string} usercolor
 * @param {string} type
 */
function removePeerInfo(index) {
    return new Promise(function (resolve, reject) {
        webrtcdev.log(" [peerinfomanager] removePeerInfo - remove index: ", index, webcallpeers[index]);
        webcallpeers.splice(index, 1);
        resolve("done");
    })
        .catch((err) => {
            webrtcdev.error("[peerinfomanager] removePeerInfo - Promise rejected ", err);
            reject("err");
        });
}

/**
 * update info about a peer in list of peers (webcallpeers)
 * @method
 * @name updatePeerInfo
 * @param {string} userid
 * @param {string} username
 * @param {string} usercolor
 * @param {string} type
 */
function updatePeerInfo(userid, username, usecolor, useremail, userrole, type) {
    webrtcdev.log("[peerinfomanager] updating peerInfo: ", userid, username, usecolor, useremail, userrole, type);
    var updateflag = -1;

    return new Promise(function (resolve, reject) {
        // if userid deosnt exist , exit
        if (!userid) {
            webrtcdev.error("[peerinfomanager] userid is null / undefined, cannot create PeerInfo");
            reject("userid is null / undefined, cannot create PeerInfo");
            return;
        }

        // if userid is already present in webcallpeers , exit
        for (var x in webcallpeers) {
            if (webcallpeers[x].userid == userid) {
                webrtcdev.log("[peerinfomanager] UserID is already existing in webcallpeers, update the fields only at index ", x);
                updateflag = x;
                break;
            }
        }

        // check if total capacity of webcallpeers has been reached 
        peerInfo = {
            videoContainer: "video" + userid,
            videoHeight: null,
            videoClassName: null,
            userid: userid,
            name: username,
            color: usecolor,
            email: useremail,
            role: userrole,
            controlBarName: "control-video" + userid,
            filearray: [],
            vid: "video" + type + "_" + userid
        };

        if (fileshareobj.active) {
            if (fileshareobj.props.fileShare == "single") {
                peerInfo.fileShare = {
                    outerbox: "widget-filesharing-box",
                    container: "widget-filesharing-container",
                    minButton: "widget-filesharing-minbutton",
                    maxButton: "widget-filesharing-maxbutton",
                    rotateButton: "widget-filesharing-rotatebutton",
                    closeButton: "widget-filesharing-closebutton"
                };
            } else {
                peerInfo.fileShare = {
                    outerbox: "widget-filesharing-box" + userid,
                    container: "widget-filesharing-container" + userid,
                    minButton: "widget-filesharing-minbutton" + userid,
                    maxButton: "widget-filesharing-maxbutton" + userid,
                    rotateButton: "widget-filesharing-rotatebutton" + userid,
                    closeButton: "widget-filesharing-closebutton" + userid
                };
            }

            if (fileshareobj.props.fileList == "single") {
                peerInfo.fileList = {
                    outerbox: "widget-filelisting-box",
                    container: "widget-filelisting-container"
                };
            } else {
                peerInfo.fileList = {
                    outerbox: "widget-filelisting-box" + userid,
                    container: "widget-filelisting-container" + userid
                };
            }
        }

        if (updateflag > -1) {
            webcallpeers[updateflag] = peerInfo;
            webrtcdev.log("[peerinfomanager] updated peerInfo: ", peerInfo);
        } else {
            webcallpeers.push(peerInfo);
            webrtcdev.log("[peerinfomanager] created peerInfo: ", peerInfo);
        }
        resolve("done");
    })
        .catch((err) => {
            webrtcdev.error("[peerinfomanager] Promise rejected ", err);
        });
}

/**
 * getwebcallpeers
 * @method
 * @name getwebcallpeers
 */
this.getwebcallpeers = function () {
    return webcallpeers;
};

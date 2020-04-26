exports.realtimecomm = function (app, properties, log, cache, socketCallback) {

    var listOfUsers = {};
    var shiftedModerationControls = {};
    var ScalableBroadcast;

    var webrtcdevchannels = {};
    var channels = [];
    var users = {};
    var sessions = {};

    var io = require('socket.io');

    try {
        io = io(app);
        // io.set({
        //     transports: [
        //         'websocket'
        //     ]
        // });
        io.origins('*:*');
        io.on('connection', onConnection);

    } catch (e) {
        console.error(" Realtime connection threw Exception ", e);
        /* transport options 
            'websocket', 
            'flashsocket', 
            'htmlfile', 
            'xhr-polling', 
            'jsonp-polling', 
            'polling'
        */
    }

    function appendUser(socket) {
        var alreadyExists = listOfUsers[socket.userid];
        var extra = {};

        if (alreadyExists && alreadyExists.extra) {
            extra = alreadyExists.extra;
        }

        let userdata = {
            socket: socket,
            connectedWith: {},
            isPublic: false, // means: isPublicModerator
            extra: extra || {}
        };
        if (cache) {
            cache.hmset(socket.userid, userdata);
        } else {
            listOfUsers[socket.userid] = userdata;
        }
    }

    function onConnection(socket) {
        var params = socket.handshake.query;
        var socketMessageEvent = params.msgEvent || 'RTCMultiConnection-Message';

        if (params.enableScalableBroadcast) {
            if (!ScalableBroadcast) {
                ScalableBroadcast = require('./Scalable-Broadcast.js');
            }
            ScalableBroadcast(socket, params.maxRelayLimitPerUser);
        }

        // temporarily disabled
        if (false && !!listOfUsers[params.userid]) {
            params.dontUpdateUserId = true;

            var useridAlreadyTaken = params.userid;
            params.userid = (Math.random() * 1000).toString().replace('.', '');
            socket.emit('userid-already-taken', useridAlreadyTaken, params.userid);
        }

        socket.userid = params.userid;
        appendUser(socket);

        socket.on('extra-data-updated', function (extra) {
            try {
                if (!listOfUsers[socket.userid]) return;
                listOfUsers[socket.userid].extra = extra;

                for (var user in listOfUsers[socket.userid].connectedWith) {
                    listOfUsers[user].socket.emit('extra-data-updated', socket.userid, extra);
                }
            } catch (e) {
                pushLogs('extra-data-updated', e);
            }
        });

        /*
        socket.on('become-a-public-moderator', function() {
            try {
                if (!listOfUsers[socket.userid]) return;
                listOfUsers[socket.userid].isPublic = true;
            } catch (e) {
                pushLogs('become-a-public-moderator', e);
            }
        });

        socket.on('dont-make-me-moderator', function() {
            try {
                if (!listOfUsers[socket.userid]) return;
                listOfUsers[socket.userid].isPublic = false;
            } catch (e) {
                pushLogs('dont-make-me-moderator', e);
            }
        });

        socket.on('get-public-moderators', function(userIdStartsWith, callback) {
            try {
                userIdStartsWith = userIdStartsWith || '';
                var allPublicModerators = [];
                for (var moderatorId in listOfUsers) {
                    if (listOfUsers[moderatorId].isPublic && moderatorId.indexOf(userIdStartsWith) === 0 && moderatorId !== socket.userid) {
                        var moderator = listOfUsers[moderatorId];
                        allPublicModerators.push({
                            userid: moderatorId,
                            extra: moderator.extra
                        });
                    }
                }

                callback(allPublicModerators);
            } catch (e) {
                pushLogs('get-public-moderators', e);
            }
        });
        */

        socket.on('changed-uuid', function (newUserId, callback) {
            callback = callback || function () {
            };

            if (params.dontUpdateUserId) {
                delete params.dontUpdateUserId;
                return;
            }

            try {
                if (listOfUsers[socket.userid] && listOfUsers[socket.userid].socket.id == socket.userid) {
                    if (newUserId === socket.userid) return;

                    var oldUserId = socket.userid;
                    listOfUsers[newUserId] = listOfUsers[oldUserId];
                    listOfUsers[newUserId].socket.userid = socket.userid = newUserId;
                    delete listOfUsers[oldUserId];

                    callback();
                    return;
                }

                socket.userid = newUserId;
                appendUser(socket);

                callback();
            } catch (e) {
                pushLogs('changed-uuid', e);
            }
        });

        socket.on('set-password', function (password) {
            try {
                if (listOfUsers[socket.userid]) {
                    listOfUsers[socket.userid].password = password;
                }
            } catch (e) {
                pushLogs('set-password', e);
            }
        });

        socket.on('disconnect-with', function (remoteUserId, callback) {
            try {
                if (listOfUsers[socket.userid] && listOfUsers[socket.userid].connectedWith[remoteUserId]) {
                    delete listOfUsers[socket.userid].connectedWith[remoteUserId];
                    socket.emit('user-disconnected', remoteUserId);
                }

                if (!listOfUsers[remoteUserId]) return callback();

                if (listOfUsers[remoteUserId].connectedWith[socket.userid]) {
                    delete listOfUsers[remoteUserId].connectedWith[socket.userid];
                    listOfUsers[remoteUserId].socket.emit('user-disconnected', socket.userid);
                }
                callback();
            } catch (e) {
                pushLogs('disconnect-with', e);
            }
        });

        socket.on('close-entire-session', function (callback) {
            try {
                var connectedWith = listOfUsers[socket.userid].connectedWith;
                Object.keys(connectedWith).forEach(function (key) {
                    if (connectedWith[key] && connectedWith[key].emit) {
                        try {
                            connectedWith[key].emit('closed-entire-session', socket.userid, listOfUsers[socket.userid].extra);
                        } catch (e) {
                        }
                    }
                });

                delete shiftedModerationControls[socket.userid];
                callback();
            } catch (e) {
                pushLogs('close-entire-session', e);
            }
        });

        socket.on('check-presence', function (userid, callback) {
            if (userid === socket.userid && !!listOfUsers[userid]) {
                callback(false, socket.userid, listOfUsers[userid].extra);
                return;
            }

            var extra = {};
            if (listOfUsers[userid]) {
                extra = listOfUsers[userid].extra;
            }

            callback(!!listOfUsers[userid], userid, extra);
        });

        socket.on('open-channel', function (data) {
            console.log("------------open channel------------- ", data.channel, " by ", data.sender);

            var newchannel = null;

            if (data.channel) {
                newchannel = data.channel;
            } else {
                console.log(" Err :  channel is empty");
            }

            if (channels.indexOf(newchannel) < 0) {
                channels.push(newchannel);
                console.log("registered new in channels ", channels);
            } else {
                console.log("channel already exists channels ", channels);
            }

            try {
                webrtcdevchannels[newchannel] = {
                    channel: newchannel,
                    timestamp: new Date().toLocaleString(),
                    maxAllowed: data.maxAllowed,
                    users: [data.sender],
                    status: "waiting",
                    endtimestamp: 0,
                    log: [new Date().toLocaleString() + ":-channel created . User " + data.sender + " waiting "]
                };
                console.log("information added to channel", webrtcdevchannels);
            } catch (e) {
                console.log(" Err : info couldnt be aded to channel ", e);
            }

            //send back the resposne to web client 
            var oevent = {
                status: true,
                channel: newchannel
            };
            socket.emit("open-channel-resp", oevent);
        });

        socket.on('open-channel-screenshare', function (data) {
            console.log("------------open channel screenshare------------- ", data.channel, " by ", data.sender);
            var oevent = {
                status: true,
                channel: data.channel
            };
            socket.emit("open-channel-screenshare-resp", oevent);
        });

        socket.on('join-channel', function (data) {
            var isallowed = false;
            var channel = data.channel;
            if (webrtcdevchannels[data.channel].users.length < webrtcdevchannels[data.channel].maxAllowed ||
                webrtcdevchannels[data.channel].maxAllowed == "unlimited")
                isallowed = true;

            console.log("------------join channel------------- ", data.channel, " by ", data.sender, " isallowed ", isallowed);

            if (isallowed) {
                webrtcdevchannels[data.channel].users.push(data.sender);
                webrtcdevchannels[data.channel].status = webrtcdevchannels[data.channel].users.length + " active members";
                webrtcdevchannels[data.channel].log.push(new Date().toLocaleString() + ":-User " + data.sender + " joined the channel ");

                // send back the join response to webclient
                var jevent = {
                    status: true,
                    channel: data.channel,
                    users: webrtcdevchannels[data.channel].users
                };
                socket.emit("join-channel-resp", jevent);

                var cevent = {
                    status: true,
                    type: "new-join",
                    msgtype: "success",
                    data: data
                };
                socket.broadcast.emit('channel-event', cevent);
            } else {

                console.warn(" Not aloowed to join channel , maxAllowed : ", webrtcdevchannels[data.channel].maxAllowed,
                    " current-users : ", webrtcdevchannels[data.channel].users.length);

                var jevent = {
                    status: false,
                    msgtype: "error",
                    msg: "Sorry cant join this channel"
                };
                socket.emit("join-channel-resp", jevent);

                var cevent = {
                    status: true,
                    type: "new-join",
                    msgtype: "error",
                    msg: "Another user is trying to join this channel but max count [ " + webrtcdevchannels[data.channel].maxAllowed + " ] is reached"
                };
                socket.broadcast.emit('channel-event', cevent);
            }
        });

        socket.on('update-channel', function (data) {
            console.log("------------update channel------------- ", data.channel, " by ", data.sender, " -> ", data);
            switch (data.type) {
                case "change-userid":
                    var index = webrtcdevchannels[data.channel].users.indexOf(data.extra.old);
                    console.log("old userid", webrtcdevchannels[data.channel].users[index]);
                    webrtcdevchannels[data.channel].users[index] = data.extra.new;
                    console.log("changed userid", webrtcdevchannels[data.channel].users);
                    break;
                default:
                    console.log("do nothing ");
            }
        });

        socket.on('presence', function (data, callback) {
            var presence = (webrtcdevchannels[data.channel] ? true : false);
            console.log(" Presence Check index of ", data.channel, " is ", presence);
            socket.emit("presence", presence);
        });

        // Supports Admin functioality on channel
        socket.on("admin_enquire", function (data) {
            switch (data.ask) {
                case "channels":
                    if (data.find) {
                        socket.emit('response_to_admin_enquire', module.getChannel(data.find, data.format));
                    } else {
                        socket.emit('response_to_admin_enquire', module.getAllChannels(data.format));
                    }
                    break;
                case "users":
                    socket.emit('response_to_admin_enquire', module.getAllActiveUsers(data.format));
                    break;
                case "channel_clients":
                    socket.emit('response_to_admin_enquire', module.getChannelClients(data.channel));
                    break;
                default :
                    socket.emit('response_to_admin_enquire', "no case matched ");
            }
        });

        function onMessageCallback(message) {
            try {
                if (!listOfUsers[message.sender]) {
                    socket.emit('user-not-found', message.sender);
                    return;
                }

                if (!message.message.userLeft && !listOfUsers[message.sender].connectedWith[message.remoteUserId] && !!listOfUsers[message.remoteUserId]) {
                    listOfUsers[message.sender].connectedWith[message.remoteUserId] = listOfUsers[message.remoteUserId].socket;
                    listOfUsers[message.sender].socket.emit('user-connected', message.remoteUserId);

                    if (!listOfUsers[message.remoteUserId]) {
                        listOfUsers[message.remoteUserId] = {
                            socket: null,
                            connectedWith: {},
                            isPublic: false,
                            extra: {}
                        };
                    }

                    listOfUsers[message.remoteUserId].connectedWith[message.sender] = socket;

                    if (listOfUsers[message.remoteUserId].socket) {
                        listOfUsers[message.remoteUserId].socket.emit('user-connected', message.sender);
                    }
                }

                if (listOfUsers[message.sender].connectedWith[message.remoteUserId] && listOfUsers[socket.userid]) {
                    message.extra = listOfUsers[socket.userid].extra;
                    listOfUsers[message.sender].connectedWith[message.remoteUserId].emit(socketMessageEvent, message);
                }
            } catch (e) {
                pushLogs('onMessageCallback', e);
            }
        }

        var numberOfPasswordTries = 0;
        socket.on(socketMessageEvent, function (message, callback) {
            if (message.remoteUserId && message.remoteUserId === socket.userid) {
                // remoteUserId MUST be unique
                return;
            }

            try {
                if (message.remoteUserId && message.remoteUserId != 'system' && message.message.newParticipationRequest) {
                    if (listOfUsers[message.remoteUserId] && listOfUsers[message.remoteUserId].password) {
                        if (numberOfPasswordTries > 3) {
                            socket.emit('password-max-tries-over', message.remoteUserId);
                            return;
                        }

                        if (!message.password) {
                            numberOfPasswordTries++;
                            socket.emit('join-with-password', message.remoteUserId);
                            return;
                        }

                        if (message.password != listOfUsers[message.remoteUserId].password) {
                            numberOfPasswordTries++;
                            socket.emit('invalid-password', message.remoteUserId, message.password);
                            return;
                        }
                    }
                }

                if (message.message.shiftedModerationControl) {
                    if (!message.message.firedOnLeave) {
                        onMessageCallback(message);
                        return;
                    }
                    shiftedModerationControls[message.sender] = message;
                    return;
                }

                // for v3 backward compatibility; >v3.3.3 no more uses below block
                if (message.remoteUserId == 'system') {
                    if (message.message.detectPresence) {
                        if (message.message.userid === socket.userid) {
                            callback(false, socket.userid);
                            return;
                        }

                        callback(!!listOfUsers[message.message.userid], message.message.userid);
                        return;
                    }
                }

                if (!listOfUsers[message.sender]) {
                    listOfUsers[message.sender] = {
                        socket: socket,
                        connectedWith: {},
                        isPublic: false,
                        extra: {}
                    };
                }

                // if someone tries to join a person who is absent
                if (message.message.newParticipationRequest) {
                    var waitFor = 120; // 2 minutes
                    var invokedTimes = 0;
                    (function repeater() {
                        invokedTimes++;
                        if (invokedTimes > waitFor) {
                            socket.emit('user-not-found', message.remoteUserId);
                            return;
                        }

                        if (listOfUsers[message.remoteUserId] && listOfUsers[message.remoteUserId].socket) {
                            onMessageCallback(message);
                            return;
                        }

                        setTimeout(repeater, 1000);
                    })();

                    return;
                }

                onMessageCallback(message);
            } catch (e) {
                pushLogs('on-socketMessageEvent', e);
            }
        });

        socket.on('disconnect', function () {
            try {
                delete socket.namespace.sockets[this.id];
            } catch (e) {
                pushLogs('disconnect', e);
            }

            try {
                var message = shiftedModerationControls[socket.userid];

                if (message) {
                    delete shiftedModerationControls[message.userid];
                    onMessageCallback(message);
                }
            } catch (e) {
                pushLogs('disconnect', e);
            }

            try {
                // inform all connected users
                if (listOfUsers[socket.userid]) {
                    for (var s in listOfUsers[socket.userid].connectedWith) {
                        listOfUsers[socket.userid].connectedWith[s].emit('user-disconnected', socket.userid);

                        if (listOfUsers[s] && listOfUsers[s].connectedWith[socket.userid]) {
                            delete listOfUsers[s].connectedWith[socket.userid];
                            listOfUsers[s].socket.emit('user-disconnected', socket.userid);
                        }
                    }
                }
            } catch (e) {
                pushLogs('disconnect', e);
            }

            delete listOfUsers[socket.userid];
        });

        if (socketCallback) {
            socketCallback(socket);
        }
    }

    module.getAll = function (format) {
        var channels = [];
        for (i in webrtcdevchannels) {
            channels.push(webrtcdevchannels[i]);
        }
        var output = {
            response: 'channels',
            channels: channels,
            format: format
        };
        return output;
    };

    module.getAllChannels = function (format) {
        var sessions = [];
        for (i in Object.keys(webrtcdevchannels)) {
            sessions.push(Object.keys(webrtcdevchannels)[i]);
        }
        var output = {
            response: 'all',
            channelinfo: sessions,
            format: format
        };
        return output;
    };

    module.getChannel = function (channelid, format) {

        var output = {
            response: 'channel',
            channelinfo: webrtcdevchannels[channelid] ? webrtcdevchannels[channelid] : null,
            format: format
        };
        return output;
    };

    module.getAllActiveUsers = function (format) {
        var users = [];
        for (i in Object.keys(webrtcdevchannels)) {
            var key = Object.keys(webrtcdevchannels)[i];
            for (j in webrtcdevchannels[key].users) {
                users.push(webrtcdevchannels[key].users[j]);
            }
        }

        var output = {
            response: 'users',
            users: users,
            format: format
        };
        return output;
    };

    module.getUser = function (userid, format) {

        var output = {
            response: 'users',
            users: (users[userid] ? users[userid] : "notfound"),
            format: format
        };
        return output;
    };

    module.getChannelClients = function (channel) {

        var output = {
            response: 'users',
            clients: io.of('/' + channel).clients(),
            format: data.format
        };
        return output;
    };

    console.log("----------------realtimecomm----------------------");
    console.log(" Socket.io env => " + properties.enviornment + " running at\n " + properties.httpsPort);

    return module;
};


var enableLogs = false;

try {
    var _enableLogs = require('./config.json').enableLogs;

    if (_enableLogs) {
        enableLogs = true;
    }
} catch (e) {
    enableLogs = false;
}

var fs = require('fs');

function pushLogs() {
    if (!enableLogs) return;

    var logsFile = process.cwd() + '/logs.json';

    var utcDateString = (new Date).toUTCString().replace(/ |-|,|:|\./g, '');

    // uncache to fetch recent (up-to-dated)
    uncache(logsFile);

    var logs = {};

    try {
        logs = require(logsFile);
    } catch (e) {
    }

    if (arguments[1] && arguments[1].stack) {
        arguments[1] = arguments[1].stack;
    }

    try {
        logs[utcDateString] = JSON.stringify(arguments, null, '\t');
        fs.writeFileSync(logsFile, JSON.stringify(logs, null, '\t'));
    } catch (e) {
        logs[utcDateString] = arguments.toString();
    }
}

// removing JSON from cache
function uncache(jsonFile) {
    searchCache(jsonFile, function (mod) {
        delete require.cache[mod.id];
    });

    Object.keys(module.constructor._pathCache).forEach(function (cacheKey) {
        if (cacheKey.indexOf(jsonFile) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
}

function searchCache(jsonFile, callback) {
    var mod = require.resolve(jsonFile);

    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        (function run(mod) {
            mod.children.forEach(function (child) {
                run(child);
            });

            callback(mod);
        })(mod);
    }
}
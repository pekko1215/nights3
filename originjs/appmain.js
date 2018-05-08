controlRerquest("data/control.smr", main)

function main() {
    window.scrollTo(0, 0);
    var sbig;
    var notplaypaysound = false;
    var hyperzone = 0;
    var hypergame = 0;
    slotmodule.on("allreelstop", function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0) return
            var matrix = e.hityaku[0].matrix;
            var count = 0;
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            if (e.hityaku[0].name.indexOf("Dummy") != -1 || e.hityaku[0].name.indexOf("1枚役") != -1 || e.hityaku[0].name == "チェリー") {
                notplaypaysound = true;
            } else {
                notplaypaysound = false;
                if (e.hityaku[0].name === "JACIN") {
                    slotmodule.setFlash(replaceMatrix(flashdata.syoto, matrix, colordata.LINE_F, null), 1000, function() {
                        slotmodule.clearFlashReservation()
                    });
                } else {
                    slotmodule.setFlash(null, 0, function(e) {
                        slotmodule.setFlash(flashdata.default, 20)
                        slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                    })
                }
            }
        }
        if (e.hits == 0 && jacflag && gamemode == "big") {
            slotmodule.setFlash(flashdata.syoto)
            slotmodule.once('bet', function() {
                slotmodule.clearFlashReservation()
            })
        }
        if (gamemode == "big") {
            bonusdata.bonusgame--;
            changeBonusSeg()
        }
        if (gamemode == "jac" || gamemode == "reg") {
            bonusdata.jacgamecount--;
            changeBonusSeg()
        }
        replayflag = false;
        var nexter = true;
        e.hityaku.forEach(function(d) {
            var matrix = d.matrix;
            switch (gamemode) {
                case 'normal':
                    switch (d.name) {
                        case "7":
                        case "月":
                        case "BAR":
                            bonusflag = "none";
                            slotmodule.freeze();
                            sounder.playSound("bonuspay", false, () => {
                                sounder.playSound("moonstart", false, () => {
                                    if (hyperzone) {
                                        sbig = true;
                                        hyperzone = 3;
                                    } else {
                                        hyperzone = !rand(3) ? 3 : 0;
                                    }
                                    if (hyperzone == 3) {
                                        hypergame = 50;
                                    }
                                    var BGM = "NBIG"
                                    if (sbig) {
                                        BGM = "SBIG"
                                    }
                                    sounder.playSound(["moonfailed", "moonsuccess"][sbig ? 1 : 0], false, () => {
                                        sounder.playSound(BGM, true)
                                        bonusdata = {
                                            bonusget: 300,
                                            geted: 0
                                        }
                                        setGamemode('big');
                                        changeBonusSeg()
                                        slotmodule.resume();
                                    })
                                })
                            })
                            break;
                        case "チェリー":
                        case "重複リプレイ":
                            sounder.playSound("cherrypay");
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                            slotmodule.setFlash(null, 0, function(e) {
                                slotmodule.setFlash(flashdata.default, 20)
                                slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                            })
                            slotmodule.freeze()
                            var fflag = true;
                            slotmodule.once("pressAllmity", () => {
                                if (fflag) {
                                    sounder.playSound("3bet")
                                    fflag = false
                                    slotmodule.resume()
                                }
                            })
                            slotmodule.once("pressLever", () => {
                                if (fflag) {
                                    sounder.playSound("3bet")
                                    fflag = false
                                    slotmodule.resume()
                                }
                            })
                        case "リプレイ":
                            replayflag = true;
                            break;
                    }
                    break;
                case 'big':
                    if (d.name == "JACIN") {
                        setGamemode('jac');
                        bonusdata.jacincount--;
                        bonusdata.jacgamecount = 4;
                        bonusdata.jacgetcount = 4;
                        jacflag = false
                    }
                    changeBonusSeg()
                    break;
                case 'reg':
                case 'jac':
                    if (d.name === "JACGAME") {
                        slotmodule.clearFlashReservation()
                        var matrix = [
                            [1, 0, 0],
                            [0, 1, 0],
                            [0, 0, 1]
                        ];
                        if (slotmodule.getReelPos(0) == 13) {
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                        }
                        slotmodule.setFlash(null, 0, function(e) {
                            slotmodule.setFlash(flashdata.default, 20)
                            slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                        })
                    }
                    bonusdata.jacgetcount--;
                    changeBonusSeg()
            }
        })
        if ((gamemode == "reg" || gamemode == 'jac' || gamemode == "big") && bonusdata.bonusgame == 0) {
            setGamemode('normal');
            sounder.stopSound("bgm")
            segments.effectseg.reset();
        }else{
            if (gamemode == "reg" || gamemode == 'jac') {
                if (bonusdata.jacgamecount == 0 || bonusflag.jacgetcount == 0) {
                    setGamemode('big');
                }
            }
        }
        if (nexter) {
            e.stopend()
        }
    })
    slotmodule.on("bonusend", () => {
        sounder.stopSound("bgm")
        setGamemode("normal")
    });
    slotmodule.on("payend", function() {
        if (gamemode != "normal") {
            if (bonusdata.geted >= bonusdata.bonusget) {
                slotmodule.emit("bonusend");
                setGamemode("normal")
            }
        }
    })
    slotmodule.on("leveron", function() {})
    slotmodule.on("bet", function(e) {
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                var thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 70)
                } else {
                    e.betend();
                }
            })(e)
        }
        if (gamemode == "jac") {
            segments.payseg.setSegments(bonusdata.jacgamecount)
        } else {
            segments.payseg.reset();
        }
    })
    slotmodule.on("pay", function(e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (gamemode != "normal") {
            changeBonusSeg();
        }
        if (!("paycount" in e)) {
            e.paycount = 0
            switch (gamemode) {
                case 'normal':
                    switch (pays) {
                        case 3:
                            sounder.playSound("bonuspay");
                            break;
                        case 6:
                            if (hyperzone) {
                                sounder.playSound("bell2");
                                if (bonusflag == 'none' && hypergame == 0) {
                                    switch (hyperzone) {
                                        case 1:
                                            if (!rand(4)) {
                                                hyperzone = 2;
                                                hypergame = 10;
                                            } else {
                                                if (rand(3) < 2) {
                                                    hyperzone = 0;
                                                    hypergame = 0;
                                                }
                                            }
                                            break
                                        case 2:
                                            if (!rand(4)) {
                                                hyperzone = 1;
                                                hypergame = 0;
                                            }
                                            break
                                        case 3:
                                            if (rand(3)) {
                                                hyperzone = 2;
                                                hypergame = 10;
                                            }
                                            break
                                    }
                                }
                            } else {
                                sounder.playSound("pay");
                            }
                            break;
                    }
                    break;
                case 'big':
                case 'jac':
                    switch (pays) {
                        case 2:
                        case 3:
                            sounder.playSound("cherrypay");
                            break;
                        case 15:
                            sounder.playSound("pay15");
                            break;
                    }
                    break;
            }
        }
        if (pays == 0) {
            if (replayflag && replayflag && e.hityaku.hityaku[0].name != "チェリー") {
                sounder.playSound("replay", false, function() {
                    e.replay();
                    slotmodule.emit("bet", e.playingStatus);
                });
            } else {
                if (replayflag) {
                    e.replay();
                    slotmodule.clearFlashReservation()
                } else {
                    e.payend()
                }
            }
        } else {
            e.hityaku.pay--;
            coin++;
            e.paycount++;
            outcoin++;
            if (gamemode != "normal") {
                bonusdata.geted++;
            }
            changeCredit(1);
            segments.payseg.setSegments(e.paycount)
            setTimeout(function() {
                arg.callee(e)
            }, 100)
        }
    })
    var jacflag = false;
    slotmodule.on("lot", function(e) {
        var ret = -1;
        switch (gamemode) {
            case "normal":
                var lot = normalLotter.lot().name
                lot = window.power || lot;
                window.power = undefined
                if (hypergame) {
                    hypergame--;
                }
                switch (lot) {
                    case "リプレイ":
                        ret = lot
                        break;
                    case "スイカ":
                        slotmodule.once('payend', () => {
                            if (!hyperzone && bonusflag == "none") {
                                hyperzone = 2;
                                hypergame = 10;
                                sounder.playSound("bell2");
                            }
                        })
                    case "ベル":
                    case "チェリー":
                        ret = lot;
                        break;
                    case "BIG":
                        if (bonusflag == "none") {
                            bonusflag = "BIG1";
                            switch (rand(8)) {
                                case 0:
                                    ret = "チェリー"
                                    break;
                                case 1:
                                case 2:
                                    ret = "BIG1"
                                    break;
                                case 3:
                                case 4:
                                    ret = "BIG2"
                                    break;
                                case 5:
                                case 6:
                                    ret = "BIG3"
                                    break;
                                case 7:
                                    ret = "BIG4"
                                    break;
                            }
                        } else {
                            ret = bonusflag;
                        }
                        break;
                    default:
                        ret = "はずれ"
                        if (bonusflag != "none") {
                            ret = bonusflag
                        }
                }
                break;
            case "big":
                var lot = bigLotter.lot().name
                lot = window.power || lot;
                window.power = undefined
                switch (lot) {
                    case "JACIN":
                        jacflag = true;
                        if (jacflag == true) {}
                    default:
                        if (jacflag) {
                            ret = 'JAC' + rand(3, 1)
                        } else {
                            ret = 'BIG3枚' + rand(3, 1)
                        }
                }
                break;
            case "reg":
            case "jac":
                ret = "JAC15枚" + rand(3, 1);
                if (!rand(3)) {
                    jacflag = true
                }
                break;
        }
        effect(ret);
        console.log(ret)
        return ret;
    })
    slotmodule.on("reelstop", function() {
        sounder.playSound("stop")
    })
    $("#saveimg").click(function() {
        SaveDataToImage();
    })
    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })
    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })
    $("#dummyfiler").change(function(e) {
        var file = this.files[0];
        var image = new Image();
        var reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                var canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                var ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                var imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                var loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })
    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 100)
        } else {
            sounder.playSound("start")
        }
        okure = false;
    })
    var okure = false;
    var sounder = new Sounder();
    sounder.addFile("sound/stop.wav", "stop").addTag("se");
    sounder.addFile("sound/start.wav", "start").addTag("se");
    sounder.addFile("sound/bet.wav", "3bet").addTag("se");
    sounder.addFile("sound/yokoku_low.mp3", "yokoku_low").addTag("se");
    sounder.addFile("sound/yokoku_high.mp3", "yokoku_high").addTag("se");
    sounder.addFile("sound/pay.wav", "pay").addTag("se");
    sounder.addFile("sound/replay.wav", "replay").addTag("se");
    sounder.addFile("sound/NormalBIG.wav", "NBIG").addTag("bgm")
    sounder.addFile("sound/VBIG.wav", "VBIG").addTag("bgm")
    sounder.addFile("sound/big15.wav", "pay15")
    sounder.addFile("sound/SBIG.mp3", "SBIG").addTag("bgm");
    sounder.addFile("sound/JACNABI.wav", "jacnabi").addTag("se");
    sounder.addFile("sound/big1hit.wav", "big1hit").addTag("se");
    sounder.addFile("sound/moonsuccess.mp3", "moonsuccess").addTag("se");
    sounder.addFile("sound/moonfailed.mp3", "moonfailed").addTag("se");
    sounder.addFile("sound/bell2.wav", "bell2").addTag("se");
    sounder.addFile("sound/nabi.wav", "nabi").addTag("voice").addTag("se");
    sounder.addFile("sound/reg.wav", "reg").addTag("bgm");
    sounder.addFile("sound/big2.mp3", "big2").addTag("bgm");
    sounder.addFile("sound/moonstart.mp3", "moonstart").addTag("se");
    sounder.addFile("sound/bigselect.mp3", "bigselect").addTag("se")
    sounder.addFile("sound/syoto.mp3", "syoto").addTag("se")
    sounder.addFile("sound/cherrypay.wav", "cherrypay").addTag("se");
    sounder.addFile("sound/bonuspay.wav", "bonuspay").addTag("voice").addTag("se");
    sounder.addFile("sound/bpay.wav", "bpay").addTag("se").setVolume(0.5);
    sounder.setVolume("se", 0.2)
    sounder.setVolume("bgm", 0.2)
    sounder.loadFile(function() {
        window.sounder = sounder
        console.log(sounder)
    })
    var normalLotter = new Lotter(lotdata.normal);
    var bigLotter = new Lotter(lotdata.big);
    var jacLotter = new Lotter(lotdata.jac);
    var gamemode = "normal";
    var bonusflag = "none"
    var coin = 0;
    var bonusdata;
    var replayflag;
    var isCT = false;
    var CTBIG = false;
    var isSBIG;
    var ctdata = {};
    var regstart;
    var afterNotice;
    var bonusSelectIndex;
    var ctNoticed;
    var playcount = 0;
    var allplaycount = 0;
    var incoin = 0;
    var outcoin = 0;
    var bonuscounter = {
        count: {},
        history: []
    };
    slotmodule.on("leveron", function() {
        if (gamemode == "normal") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                bonuscounter.history.push({
                    bonus: gamemode,
                    game: playcount
                })
                playcount = 0;
            }
        }
        changeCredit(0)
    })

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "ゲッター7",
            id: "getter7"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        // slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }
    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }
    window.SaveData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }
    window.LoadData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = localStorage.getItem("savedata")
        try {
            var data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }
    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;
        SaveData();
        changeCredit(0)
    }
    var setGamemode = function(mode) {
        switch (mode) {
            case 'normal':
                gamemode = 'normal'
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                isSBIG = false
                break;
            case 'big':
                gamemode = 'big';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(1)
                });
                slotmodule.setMaxbet(2);
                break;
            case 'reg':
                gamemode = 'reg';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(1);
                break;
            case 'jac':
                gamemode = 'jac';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(1);
                break;
        }
    }
    var segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 4)
    }
    var credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.effectseg.setOffColor(5, 5, 5);
    segments.creditseg.reset();
    segments.payseg.reset();
    segments.effectseg.reset();
    var lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        var tmp = bonusdata.bonusget - bonusdata.geted
        if (tmp < 0) {
            tmp = 0;
        }
        segments.effectseg.setSegments("" + tmp);
    }

    function changeCTGameSeg() {
        segments.effectseg.setOnColor(230, 0, 0);
        segments.effectseg.setSegments(ctdata.ctgame);
    }

    function changeCTCoinSeg() {
        segments.effectseg.setOnColor(50, 100, 50);
        segments.effectseg.setSegments(200 + ctdata.ctstartcoin - coin);
    }
    var LampInterval = {
        right: -1,
        left: -1,
        counter: {
            right: true,
            left: false
        }
    }

    function setLamp(flags, timer) {
        flags.forEach(function(f, i) {
            if (!f) {
                return
            }
            LampInterval[["left", "right"][i]] = setInterval(function() {
                if (LampInterval.counter[["left", "right"][i]]) {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(200%)"
                    })
                } else {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(100%)"
                    })
                }
                LampInterval.counter[["left", "right"][i]] = !LampInterval.counter[["left", "right"][i]];
            }, timer)
        })
    }

    function setLampBrightness(selector, parsent) {
        $(selector).css({
            filter: `brightness(${parsent}%)`
        })
    }

    function setLampColor(selector, color) {
        $(selector).attr({
            src: `img/lamp/` + color + '.png'
        })
    }

    function effect(lot) {
        switch (gamemode) {
            case 'normal':
                var effectReserve = null;
                switch (lot) {
                    case 'はずれ':
                        if (!rand(128)) {
                            effectReserve = {
                                color: null,
                                sound: 'low'
                            }
                            if (!rand(4)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        break
                    case 'リプレイ':
                        if (!rand(6)) {
                            effectReserve = {
                                color: 'blue',
                                sound: 'low'
                            }
                            if (!rand(4)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        if (bonusflag != "none") {
                            if (rand(3)) {
                                effectReserve = {
                                    color: 'red',
                                    sound: 'low'
                                }
                                if (!rand(2)) {
                                    effectReserve.sound = 'high'
                                }
                            }
                        }
                        break
                    case 'ベル':
                        if (!rand(6)) {
                            effectReserve = {
                                color: 'yellow',
                                sound: 'low'
                            }
                            if (!rand(4)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        if (bonusflag != "none") {
                            if (rand(3)) {
                                effectReserve = {
                                    color: 'green',
                                    sound: 'low'
                                }
                                if (!rand(2)) {
                                    effectReserve.sound = 'high'
                                }
                            }
                        }
                        break
                    case 'スイカ':
                        effectReserve = {
                            color: 'green',
                            sound: 'low'
                        }
                        if (!rand(4)) {
                            effectReserve.sound = 'high'
                        }
                        break
                    case 'チェリー':
                        if (!rand(10)) {
                            effectReserve = {
                                color: 'red',
                                sound: 'low'
                            }
                            if (!rand(64)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        if (bonusflag != "none" && rand(2)) {
                            effectReserve = {
                                color: 'red',
                                sound: ['low', 'high'][rand(2)]
                            }
                        }
                        break
                    case 'BIG1':
                        if (!rand(3)) {
                            effectReserve = {
                                color: null,
                                sound: 'low'
                            }
                            if (!rand(3)) {
                                effectReserve.sound = 'high'
                            }
                        }
                        break;
                    case 'BIG2':
                        if (rand(3)) {
                            var efTable = [10, 10, 0, 0, 10, 15, 25, 30, 0, 0]
                            var r = rand(100);
                            var e = efTable.findIndex(f => {
                                r -= f;
                                return r < 0
                            });
                            effectReserve = {
                                color: [null, 'blue', 'yellow', 'green', 'red'][parseInt(e / 2)],
                                sound: ['low', 'high'][e % 2]
                            }
                        }
                        break;
                    case 'BIG3':
                        if (rand(3)) {
                            var efTable = [10, 10, 0, 0, 25, 30, 10, 15, 0, 0]
                            var r = rand(100);
                            var e = efTable.findIndex(f => {
                                r -= f;
                                return r < 0
                            });
                            effectReserve = {
                                color: [null, 'blue', 'yellow', 'green', 'red'][parseInt(e / 2)],
                                sound: ['low', 'high'][e % 2]
                            }
                        }
                        break
                    case 'BIG4':
                        if (rand(3)) {
                            var efTable = [10, 10, 10, 30, 0, 0, 0, 0, 10, 30]
                            var r = rand(100);
                            var e = efTable.findIndex(f => {
                                r -= f;
                                return r < 0
                            });
                            effectReserve = {
                                color: [null, 'blue', 'yellow', 'green', 'red'][parseInt(e / 2)],
                                sound: ['low', 'high'][e % 2]
                            }
                        }
                        break
                }
                if (effectReserve) {
                    sounder.playSound('yokoku_' + effectReserve.sound);
                    var img = effectReserve.color;
                    if (!img) {
                        setLampColor('#moon', 'moon');
                    } else {
                        setLampColor('#moon', 'moon_' + img);
                    }
                    slotmodule.once('allreelstop', () => {
                        setLampColor('#moon', 'moon');
                    })
                }
                break
            case 'big':
            case 'jac':
                if (sbig) {
                    sounder.playSound('nabi')
                    for (var i = 1; i <= 3; i++) {
                        if (i == lot.slice(-1)) {
                            setLampBrightness('#nabi' + i, 100)
                        } else {
                            setLampBrightness('#nabi' + i, 20)
                        }
                    }
                    slotmodule.once('bet', () => {
                        for (var i = 1; i <= 3; i++) {
                            setLampBrightness('#nabi' + i, 20)
                        }
                    })
                }
                break
        }
    }
    $(window).bind("unload", function() {
        SaveData();
    });
    LoadData();
    setInterval(function lanpAnimation() {
        switch (hyperzone) {
            case 0:
                setLampBrightness('#fire', 20);
                break
            case 1:
                setLampBrightness('#fire', rand(20, 40));
                break
            case 2:
                setLampBrightness('#fire', rand(20, 60));
                break
            case 3:
                setLampBrightness('#fire', rand(20, 80));
                break
        }
    }, 500)
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function rand(m, n = 0) {
    return Math.floor(Math.random() * m) + n;
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    var cangvas = $(selector)[0];
    var sc = new SegmentControler(cangvas, size, 0, -3, 50, 30);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}
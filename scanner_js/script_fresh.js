$(document).on("click", "#scan-icon", function() {
    var $video = document.getElementById('PVideo');
    var $cvsContainer = document.getElementById('canvasContainer');
    var scanner = null;
    var runtimeSettings = null;

    var prodName = "";
    var image = "";
    var ingredients = "";
    var nutrFacts = "";

    let deafultBarcodeFormatIds = null;

    function getQueryStringArgs() {
        var qs = (window.location.search.length > 0 ? window.location.search.substring(1) : ''),
            args = {},
            items = qs.length ? qs.split('&') : [],
            item = null,
            name = null,
            value = null,
            i = 0,
            len = items.length;
        for (i = 0; i < len; i++) {
            item = items[i].split('=');
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);
            if (name.length) {
                args[name] = value;
            }
        }
        return args;
    }

    let objQueryStringArgs = getQueryStringArgs();
    if(objQueryStringArgs.full){
        Dynamsoft.BarcodeReader._bUseFullFeature = !!(getQueryStringArgs().full);
        deafultBarcodeFormatIds = Dynamsoft.EnumBarcodeFormat.BF_ALL;
        $('#div-full-feature').hide();
    }else{
        deafultBarcodeFormatIds = (Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_QR_CODE | Dynamsoft.EnumBarcodeFormat.BF_PDF417 | Dynamsoft.EnumBarcodeFormat.BF_DATAMATRIX);
        $("#s1DAll").prop("disabled", true);
        $("#s1DAll").parent().children("label").first().hide();
        $("#s2DAll").prop("disabled", true);
        $("#s2DAll").parent().children("label").first().hide();
    }

    let funcTryRedirectToFull = function(txt){
        if(Dynamsoft.BarcodeReader._bUseFullFeature) return Promise.resolve();
        $("#dialog-redirect-why").text(txt);
        return new Promise((resolve)=>{
            $("#dialog-redirect").show();
            document.getElementById("dialog-redirect-cancel").onclick = function(){
                this.onclick = null;
                $("#dialog-redirect").hide();
                resolve();
            };
        });
    };

    $("#dialog-redirect-ok").click(function(){
        let locQuestion = window.location.href.lastIndexOf('?');
        let locHash = window.location.href.lastIndexOf('#');
        let strSearch = "full=true";
        let $iptInterval = $('.ls-option input[name="settingInterval"]:checked');
        if($iptInterval.length){
            strSearch += "&interval="+$iptInterval[0].value;
        }
        let $iptMode = $('.ls-option input[name="settingMode"]:checked');
        if($iptMode.length){
            strSearch += "&mode="+$iptMode[0].value;
        }
        if($('#ipt-invertcolor').prop("checked"))strSearch += "&invertcolor=true";
        if($('#ipt-dpm').prop("checked"))strSearch += "&dpm=true";
        if(-1 === locQuestion){
            if(-1 === locHash){
                // no ?, no #
                window.location.href += "?"+strSearch;
            }else{
                // have #
                window.location.href = window.location.href.substring(0, locQuestion) + "?"+strSearch + window.location.href.substring(locQuestion);
            }
        }else{
            // have ?
            window.location.href = window.location.href.substring(0, locQuestion + 1) + strSearch+"&" + window.location.href.substring(locQuestion + 1);
        }
    });

    Dynamsoft.BarcodeScanner.createInstance().then(async (instance)=>{
        scanner = instance;
        scanner.UIElement = document.body;
        scanner.onFrameRead = function (results) {

            for (let i = 0; i < results.length; i++) {
                // console.log(result.barcodeFormatString + '\t' + result.barcodeText);
                let result = results[i];
                let cvs = document.createElement('canvas');
                cvs.style.position = 'absolute';
                let x1 = result.localizationResult.x1;
                let y1 = result.localizationResult.y1;
                let x2 = result.localizationResult.x2;
                let y2 = result.localizationResult.y2;
                let x3 = result.localizationResult.x3;
                let y3 = result.localizationResult.y3;
                let x4 = result.localizationResult.x4;
                let y4 = result.localizationResult.y4;

                let leftMin = Math.min(x1, x2, x3, x4);
                let rightMax = Math.max(x1, x2, x3, x4);
                let topMin = Math.min(y1, y2, y3, y4);
                let bottomMax = Math.max(y1, y2, y3, y4);
                cvs.style.left = leftMin + 'px';
                cvs.style.top = topMin + 'px';
                cvs.width = rightMax - leftMin;
                cvs.height = bottomMax - topMin;

                let _x1 = x1 - leftMin;
                let _x2 = x2 - leftMin;
                let _x3 = x3 - leftMin;
                let _x4 = x4 - leftMin;
                let _y1 = y1 - topMin;
                let _y2 = y2 - topMin;
                let _y3 = y3 - topMin;
                let _y4 = y4 - topMin;
                let ctx = cvs.getContext('2d');
                ctx.fillStyle = 'rgba(254,180,32,0.3)';
                ctx.beginPath();
                ctx.moveTo(_x1, _y1);
                ctx.lineTo(_x2, _y2);
                ctx.lineTo(_x3, _y3);
                ctx.lineTo(_x4, _y4);
                ctx.fill();
                $cvsContainer.append(cvs);

                setTimeout(function () {
                    $(cvs).remove();
                }, 300);
            }
            $('.rc-text').each(function () {
                let txt = this.dbrResultBoxTxt;
                let format = this.dbrResultBoxFormat;
                for (let i = 0; i < results.length; ++i) {
                    var result = results[i];
                    if (result.barcodeText === txt && (result.barcodeFormat|result.barcodeFormat_2) === format) {
                        ++this.dbrCount;

                        let spCount;
                        let lastEl = this.children[this.children.length - 1];
                        if (lastEl.dbrComeUpCount) {
                            spCount = lastEl;
                        } else {
                            spCount = document.createElement('span');
                            this.appendChild(spCount);
                        }
                        spCount.className = 'rc-count';
                        spCount.dbrComeUpCount = this.dbrCount;
                        spCount.innerText = ' x' + this.dbrCount;

                        this.dbrRmTimeoutId && clearTimeout(this.dbrRmTimeoutId);
                        this.dbrRmTimeoutId = setTimeout(()=>{
                            $(this).remove();
                        }, 5000);
                        break;
                    }
                }
            });
        };

        scanner.onUnduplicatedRead = function (txt, result) {
            ringBell();
            /* global  $, Dynamsoft, ringBell*/

            var $video = document.getElementById('PVideo');
            var $cvsContainer = document.getElementById('canvasContainer');
            var $resultContainer = document.getElementById('resultContainer');
            var scanner = null;
            var runtimeSettings = null;

            let deafultBarcodeFormatIds = null;
            function getQueryStringArgs() {
                var qs = (window.location.search.length > 0 ? window.location.search.substring(1) : ''),
                    args = {},
                    items = qs.length ? qs.split('&') : [],
                    item = null,
                    name = null,
                    value = null,
                    i = 0,
                    len = items.length;
                for (i = 0; i < len; i++) {
                    item = items[i].split('=');
                    name = decodeURIComponent(item[0]);
                    value = decodeURIComponent(item[1]);
                    if (name.length) {
                        args[name] = value;
                    }
                }
                return args;
            }
            let objQueryStringArgs = getQueryStringArgs();
            if(objQueryStringArgs.full){
                Dynamsoft.BarcodeReader._bUseFullFeature = !!(getQueryStringArgs().full);
                deafultBarcodeFormatIds = Dynamsoft.EnumBarcodeFormat.BF_ALL;
                $('#div-full-feature').hide();
            }else{
                deafultBarcodeFormatIds = (Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_QR_CODE | Dynamsoft.EnumBarcodeFormat.BF_PDF417 | Dynamsoft.EnumBarcodeFormat.BF_DATAMATRIX);
                $("#s1DAll").prop("disabled", true);
                $("#s1DAll").parent().children("label").first().hide();
                $("#s2DAll").prop("disabled", true);
                $("#s2DAll").parent().children("label").first().hide();
            }
            let funcTryRedirectToFull = function(txt){
                if(Dynamsoft.BarcodeReader._bUseFullFeature) return Promise.resolve();
                $("#dialog-redirect-why").text(txt);
                return new Promise((resolve)=>{
                    $("#dialog-redirect").show();
                    document.getElementById("dialog-redirect-cancel").onclick = function(){
                        this.onclick = null;
                        $("#dialog-redirect").hide();
                        resolve();
                    };
                });
            };

            $("#dialog-redirect-ok").click(function(){
                let locQuestion = window.location.href.lastIndexOf('?');
                let locHash = window.location.href.lastIndexOf('#');
                let strSearch = "full=true";
                let $iptInterval = $('.ls-option input[name="settingInterval"]:checked');
                if($iptInterval.length){
                    strSearch += "&interval="+$iptInterval[0].value;
                }
                let $iptMode = $('.ls-option input[name="settingMode"]:checked');
                if($iptMode.length){
                    strSearch += "&mode="+$iptMode[0].value;
                }
                if($('#ipt-invertcolor').prop("checked"))strSearch += "&invertcolor=true";
                if($('#ipt-dpm').prop("checked"))strSearch += "&dpm=true";
                if(-1 === locQuestion){
                    if(-1 === locHash){
                        // no ?, no #
                        window.location.href += "?"+strSearch;
                    }else{
                        // have #
                        window.location.href = window.location.href.substring(0, locQuestion) + "?"+strSearch + window.location.href.substring(locQuestion);
                    }
                }else{
                    // have ?
                    window.location.href = window.location.href.substring(0, locQuestion + 1) + strSearch+"&" + window.location.href.substring(locQuestion + 1);
                }
            });

            Dynamsoft.BarcodeScanner.createInstance().then(async (instance)=>{
                scanner = instance;
                scanner.UIElement = document.body;
                scanner.onFrameRead = function (results) {

                    for (let i = 0; i < results.length; i++) {
                        // console.log(result.barcodeFormatString + '\t' + result.barcodeText);
                        let result = results[i];
                        let cvs = document.createElement('canvas');
                        cvs.style.position = 'absolute';
                        let x1 = result.localizationResult.x1;
                        let y1 = result.localizationResult.y1;
                        let x2 = result.localizationResult.x2;
                        let y2 = result.localizationResult.y2;
                        let x3 = result.localizationResult.x3;
                        let y3 = result.localizationResult.y3;
                        let x4 = result.localizationResult.x4;
                        let y4 = result.localizationResult.y4;

                        let leftMin = Math.min(x1, x2, x3, x4);
                        let rightMax = Math.max(x1, x2, x3, x4);
                        let topMin = Math.min(y1, y2, y3, y4);
                        let bottomMax = Math.max(y1, y2, y3, y4);
                        cvs.style.left = leftMin + 'px';
                        cvs.style.top = topMin + 'px';
                        cvs.width = rightMax - leftMin;
                        cvs.height = bottomMax - topMin;

                        let _x1 = x1 - leftMin;
                        let _x2 = x2 - leftMin;
                        let _x3 = x3 - leftMin;
                        let _x4 = x4 - leftMin;
                        let _y1 = y1 - topMin;
                        let _y2 = y2 - topMin;
                        let _y3 = y3 - topMin;
                        let _y4 = y4 - topMin;
                        let ctx = cvs.getContext('2d');
                        ctx.fillStyle = 'rgba(254,180,32,0.3)';
                        ctx.beginPath();
                        ctx.moveTo(_x1, _y1);
                        ctx.lineTo(_x2, _y2);
                        ctx.lineTo(_x3, _y3);
                        ctx.lineTo(_x4, _y4);
                        ctx.fill();
                        $cvsContainer.append(cvs);

                        setTimeout(function () {
                            $(cvs).remove();
                        }, 300);
                    }
                    $('.rc-text').each(function () {
                        let txt = this.dbrResultBoxTxt;
                        let format = this.dbrResultBoxFormat;
                        for (let i = 0; i < results.length; ++i) {
                            var result = results[i];
                            if (result.barcodeText === txt && (result.barcodeFormat|result.barcodeFormat_2) === format) {
                                ++this.dbrCount;

                                let spCount;
                                let lastEl = this.children[this.children.length - 1];
                                if (lastEl.dbrComeUpCount) {
                                    spCount = lastEl;
                                } else {
                                    spCount = document.createElement('span');
                                    this.appendChild(spCount);
                                }
                                spCount.className = 'rc-count';
                                spCount.dbrComeUpCount = this.dbrCount;
                                spCount.innerText = ' x' + this.dbrCount;

                                this.dbrRmTimeoutId && clearTimeout(this.dbrRmTimeoutId);
                                this.dbrRmTimeoutId = setTimeout(()=>{
                                    $(this).remove();
                                }, 5000);
                                break;
                            }
                        }
                    });
                };
                scanner.onUnduplicatedRead = function (txt, result) {
                    let bDuplicated = false;
                    $('.rc-text').each(function () {
                        if(txt == this.dbrResultBoxTxt && (result.barcodeFormat|result.barcodeFormat_2) == this.dbrResultBoxFormat){
                            bDuplicated = true;
                        }
                    });
                    if(bDuplicated){return;}
                    let _div = document.createElement('div');
                    _div.className = 'rc-text';

                    let possibleLink = txt;
                    if (!txt.startsWith('http') && (txt.startsWith('www') || -1 !== txt.indexOf('.com') ||
                        -1 !== txt.indexOf('.net') || -1 !== txt.indexOf('.org') || -1 !== txt.indexOf('.edu'))) {
                        possibleLink = 'http://' + txt;
                    }

                    let a;
                    if (possibleLink.startsWith('http')) {
                        a = document.createElement('a');
                        a.href = possibleLink;
                        a.target = '_blank';
                        a.style.color = '#45cbef';
                        a.style.textDecoration = 'underline';
                    } else {
                        a = document.createElement('div');
                        a.style.color = '#ffffff';
                    }
                    a.className = 'inRCTxt';
                    a.innerText = txt;

                    _div.innerText = (result.barcodeFormat?result.barcodeFormatString:result.barcodeFormatString_2) + ': ';
                    _div.innerHTML += a.outerHTML;
                    _div.dbrResultBoxTxt = txt;
                    _div.dbrResultBoxFormat = result.barcodeFormat|result.barcodeFormat_2;
                    _div.dbrCount = 1;
                    _div.dbrRmTimeoutId = setTimeout(()=>{
                        $(_div).remove();
                    }, 5000);
                };
                if(Dynamsoft.BarcodeReader._bUseFullFeature){
                    runtimeSettings = await scanner.getRuntimeSettings();
                    runtimeSettings.barcodeFormatIds_2 = 0x1f00000;
                    scanner.updateRuntimeSettings(runtimeSettings);
                }
                runtimeSettings = await scanner.getRuntimeSettings();
                // update settings
                if(objQueryStringArgs.interval){
                    $("#ipt-interval-"+objQueryStringArgs.interval).prop('checked', true);
                    $("#ipt-interval-"+objQueryStringArgs.interval).change();
                }else{
                    $('#ipt-interval-100').prop('checked', true);
                    $('#ipt-interval-100').change();
                }
                if(objQueryStringArgs.dpm){ // dpm can work when mode change, so not invork change
                    $('#ipt-dpm').prop("checked", true);
                }
                if(objQueryStringArgs.mode){
                    $("#ipt-mode-"+objQueryStringArgs.mode).prop('checked', true);
                    $("#ipt-mode-"+objQueryStringArgs.mode).change();
                }else{
                    $('#ipt-mode-bestspeed').prop('checked', true);
                    $('#ipt-mode-bestspeed').change();
                }

                if(objQueryStringArgs.invertcolor){
                    $('#ipt-invertcolor').prop("checked", true);
                    $('#ipt-invertcolor').change();
                }
                return await scanner.open();
            }).then(async function () {
                // camera exist
                $('.picker').fadeIn(300);
                // ui update frame scanning
                $('.scanning-container').css({
                    'width': $('#PVideo').css('width'),
                    'height': $('#PVideo').css('height')
                });
                // ui update video source
                let curCam = await scanner.getCurrentCamera();
                let allCam = await scanner.getAllCameras();
                for (var i = 0; i < allCam.length; i++) {
                    $('#SSource .ls-body').append('<div class="ls-option"><input type="radio" name="source" id="sou' +
                        i + '" value="' + allCam[i].deviceId + '"><label for="sou' + i + '" class="radio-btn"></label><label for="sou' + i + '">' + allCam[i].label + '</label></div>');
                    if (curCam && allCam[i].deviceId === curCam.deviceId) {
                        $('#sou' + i).prop('checked', true);
                    }
                }
                // video source changed
                $('.ls-option input[name="source"]').change(function () {
                    scanner.play(this.value).then(function (resolution) {
                        $('.scanning-container').css({
                            'width': resolution.width,
                            'height': resolution.height
                        });
                        $('#cResolution').text(resolution.width + ' × ' + resolution.height);
                        $('#MRegion').prop('checked')?resetRegion():setRegion();
                    });
                });
                // ui update video resolution
                let resolution = scanner.getResolution();
                $('input[name="resolution"]').each(function () {
                    if (($(this).attr('data-width') == resolution[0] && $(this).attr('data-height') == resolution[1]) ||
                        (($(this).attr('data-width') == resolution[1] && $(this).attr('data-height') == resolution[0]))) {
                        $(this).prop('checked', true);
                    }
                });
                $('#cResolution').text(resolution[0] + ' × ' + resolution[1]);

                // ui update barcodeFormat
                $('input[name="format"]').each(function () {
                    let formatValue = parseInt(this.getAttribute("value"));
                    if(!$(this).hasClass('ipt-bf2')){
                        if((runtimeSettings.barcodeFormatIds & formatValue) == (~~formatValue)){
                            $(this).prop('checked', true);
                        }
                    }else{
                        if((runtimeSettings.barcodeFormatIds_2 & formatValue) == (~~formatValue)){
                            $(this).prop('checked', true);
                        }
                    }
                });


                resetRegion();

                // ready?
                setTimeout(function () {
                    $('.waiting').fadeOut(300);
                }, 100);
            }, function (ex) {
                console.error(ex); //eslint-disable-line
                // alert(ex);
                let errorTxt = ex.message || ex;
                if (/t support Webassembly/.test(errorTxt) || /not an object/.test(errorTxt)) {
                    $('#notSupport').fadeIn(300);
                } else if (/Permission/.test(errorTxt) || /video/.test(errorTxt) || /device/.test(errorTxt) || /Media/.test(errorTxt) || /agent/.test(errorTxt) || /found/.test(errorTxt))
                    $('#noCam').fadeIn(300);
                else {
                    alert(errorTxt);
                }
                //scanner.close();
            });

// which leftbar item selected
            var _itemSelect = 0;

            $('.leftbar input[name="lItem"]').click(function () {
                if (_itemSelect === this.value) {
                    _itemSelect = 0;
                    $('.l-secondary').css('display', 'none');
                    this.checked = false;
                } else if (_itemSelect !== this.value) {
                    $(".l-secondary").css('display', 'none');
                    _itemSelect = this.value;
                    switch (this.value) {
                        case 'itemSource':
                            $('#SSource').css('display', 'block');
                            break;
                        case 'itemResolution':
                            $('#SResolution').css('display', 'block');
                            break;
                        case 'itemFormats':
                            $('#SFormats').css('display', 'block');
                            break;
                        case 'itemSettings':
                            $('#SSettings').css('display', 'block');
                            break;
                        case 'itemAbout':
                            $('#SAbout').css('display', 'block');
                            break;
                        default:
                            break;
                    }
                }
            });

// click other region to hide left bar
            $('.l-item').click(function (ev) {
                ev.stopPropagation();
                $(".l-secondary").css('display', 'none');
            });
            $(document).click(function (ev) {
                if (!$('.leftbar').is(ev.target) && $('.leftbar').has(ev.target).length === 0 && !$('#MMenu').is(ev.target) && !$('.m-region').is(ev.target)) {
                    _itemSelect = 0;
                    $('.leftbar input[name="lItem"]').each(function () {
                        this.checked = false;
                    });
                    $('.l-secondary').hide();
                    if ($('.h-sign-in-mobile').css('display') === 'block') {
                        document.querySelector('#leftbar').className = 'leftbar hidden';
                        $('#MMenu').prop('checked', false);
                    }
                }
            });

// video resolution changed
            $('input[name="resolution"]').change(function () {
                var _curDevice = 0,
                    _curWidth = $(this).attr('data-width'),
                    _curHeight = $(this).attr('data-height');
                $('input[name="source"]').each(function () {
                    if (this.checked) _curDevice = this.value;
                });
                scanner.play(_curDevice, _curWidth, _curHeight).then(function (resolution) {
                    $('#cResolution').text(resolution.width + ' × ' + resolution.height);
                    $('#MRegion').prop('checked')?resetRegion():setRegion();
                });
            });

// video format changed
            $('#s1DAll').change(async function () {
                let _flag = 0;
                $('.ls-option-2d input[name="format"]').each(function () {
                    if (this.checked) _flag |= parseInt(this.value);
                });
                if (this.checked) {
                    runtimeSettings.barcodeFormatIds = _flag | Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR;
                    await scanner.updateRuntimeSettings(runtimeSettings);
                    $('.ls-option-1d input').prop('checked', true);
                } else if (!this.checked) {
                    if (_flag === 0) {
                        $(this).prop('checked', true);
                        alert('Please select at lease one barcode format');
                    } else {
                        runtimeSettings.barcodeFormatIds = _flag;
                        await scanner.updateRuntimeSettings(runtimeSettings);
                        $('.ls-option-1d input').prop('checked', false);
                    }
                }
            });
            $('#s2DAll').change(async function () {
                let _flag = 0;
                $('.ls-option-1d input[name="format"]').each(function () {
                    if (this.checked) _flag |= parseInt(this.value);
                });
                if (this.checked) {
                    runtimeSettings.barcodeFormatIds = _flag | ((Dynamsoft.EnumBarcodeFormat.BF_ALL & ~(Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR)));
                    await scanner.updateRuntimeSettings(runtimeSettings);
                    $('.ls-option-2d input').prop('checked', true);
                } else if (!this.checked) {
                    if (_flag === 0) {
                        $(this).prop('checked', true);
                        alert('Please select at lease one barcode format');
                    } else {
                        runtimeSettings.barcodeFormatIds = _flag;
                        await scanner.updateRuntimeSettings(runtimeSettings);
                        $('.ls-option-2d input').prop('checked', false);
                    }
                }
            });
            $('.ls-body input[name="format"]').change(async function () {
                let thisValue = parseInt(this.value);
                if(!Dynamsoft.BarcodeReader._bUseFullFeature && (
                    (thisValue & deafultBarcodeFormatIds) != (~~thisValue)
                    ||
                    $(this).hasClass("ipt-bf2")
                )){
                    await funcTryRedirectToFull('read ' + $(this).attr('txt'));
                    $(this).prop("checked", false);
                    return;
                }

                let _flag1 = 0,
                    _flag2 = 0,
                    _flag3 = 0;
                $('.ls-option-1d input[name="format"]').each(function () {
                    if (this.checked) _flag1 |= parseInt(this.value);
                });
                $('.ls-option-2d input[name="format"]').each(function () {
                    if (this.checked) _flag2 |= parseInt(this.value);
                });
                $('.ls-option-bf2 input[name="format"]').each(function () {
                    if (this.checked) _flag3 |= parseInt(this.value);
                });
                if (_flag1 != (Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR)) $('#s1DAll').prop('checked', false);
                if (_flag1 === (Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR)) $('#s1DAll').prop('checked', true);
                if (_flag2 != (Dynamsoft.EnumBarcodeFormat.BF_ALL & ~(Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR))) $('#s2DAll').prop('checked', false);
                if (_flag2 === (Dynamsoft.EnumBarcodeFormat.BF_ALL & ~(Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR))) $('#s2DAll').prop('checked', true);

                if ((_flag1 | _flag2) === 0 && _flag3 === 0) {
                    $(this).prop('checked', true);
                    alert('Please select at lease one barcode format');
                } else {
                    runtimeSettings.barcodeFormatIds = _flag1 | _flag2;
                    runtimeSettings.barcodeFormatIds_2 = _flag3;
                    await scanner.updateRuntimeSettings(runtimeSettings);
                }
            });

// video reading interval chaneged
            $('.ls-option input[name="settingInterval"]').change(function () {
                scanner.intervalTime = parseInt(this.value);
            });

// video reading mode changed
            $('.ls-option input[name="settingMode"]').change(async function () {
                if('bestspeed' == this.value){
                    runtimeSettings.deblurLevel = 0;
                    runtimeSettings.expectedBarcodesCount = 0;
                    runtimeSettings.scaleDownThreshold = 2300;
                    runtimeSettings.localizationModes = [
                        Dynamsoft.EnumLocalizationMode.LM_SCAN_DIRECTLY,
                        Dynamsoft.EnumLocalizationMode.LM_CONNECTED_BLOCKS,
                        0,0,0,0,0,0
                    ];
                    runtimeSettings.timeout = 10000;
                }else if('balance' == this.value){
                    runtimeSettings.deblurLevel = 3;
                    runtimeSettings.expectedBarcodesCount = 512;
                    runtimeSettings.scaleDownThreshold = 2300;
                    runtimeSettings.localizationModes = [
                        Dynamsoft.EnumLocalizationMode.LM_CONNECTED_BLOCKS,
                        Dynamsoft.EnumLocalizationMode.LM_SCAN_DIRECTLY,
                        0,0,0,0,0,0
                    ];
                    runtimeSettings.timeout = 100000;
                }else if('bestcoverage' == this.value){
                    runtimeSettings.deblurLevel = 5;
                    runtimeSettings.expectedBarcodesCount = 512;
                    runtimeSettings.scaleDownThreshold = 100000;
                    runtimeSettings.localizationModes = [
                        Dynamsoft.EnumLocalizationMode.LM_CONNECTED_BLOCKS,
                        Dynamsoft.EnumLocalizationMode.LM_STATISTICS,
                        Dynamsoft.EnumLocalizationMode.LM_SCAN_DIRECTLY,
                        Dynamsoft.EnumLocalizationMode.LM_LINES,
                        0,0,0,0
                    ];
                    runtimeSettings.timeout = 100000;
                }
                if($('#ipt-dpm').prop("checked")){
                    let locModes = runtimeSettings.localizationModes;
                    for(let i in locModes){
                        if(locModes[i] == Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS){
                            break;
                        }
                        if(locModes[i] == 0){
                            locModes[i] = Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS;
                            break;
                        }
                    }
                }
                await scanner.updateRuntimeSettings(runtimeSettings);
            });
// video reading feature changed
            $('#ipt-invertcolor').change(async function () {
                runtimeSettings.furtherModes.grayscaleTransformationModes = [
                    $(this).prop("checked") ? Dynamsoft.EnumGrayscaleTransformationMode.GTM_INVERTED : Dynamsoft.EnumGrayscaleTransformationMode.GTM_ORIGINAL,
                    0,0,0,0,0,0,0
                ];
                await scanner.updateRuntimeSettings(runtimeSettings);
            });
            $('#ipt-dpm').change(async function(){
                if(!Dynamsoft.BarcodeReader._bUseFullFeature){
                    await funcTryRedirectToFull("use DPM");
                    $(this).prop("checked", false);
                    return;
                }
                if($(this).prop('checked')){
                    let locModes = runtimeSettings.localizationModes;
                    for(let i in locModes){
                        if(locModes[i] == Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS){
                            break;
                        }
                        if(locModes[i] == 0){
                            locModes[i] = Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS;
                            break;
                        }
                    }
                }else{
                    let locModes = runtimeSettings.localizationModes;
                    for(let i in locModes){
                        if(locModes[i] == Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS){
                            locModes[i] = 0;
                            break;
                        }
                        if(locModes[i] == 0){
                            break;
                        }
                    }
                }
                await scanner.updateRuntimeSettings(runtimeSettings);
            });

            let resetRegion = async () => {

                let videoComputedStyle = window.getComputedStyle($video);
                let videoComputedWidth = Math.round(parseFloat(videoComputedStyle.getPropertyValue('width')));
                let videoComputedHeight = Math.round(parseFloat(videoComputedStyle.getPropertyValue('height')));
                $('.scanning-container').css({
                    'width': videoComputedWidth + 'px',
                    'height': videoComputedHeight + 'px'
                });
                $cvsContainer.style.width = videoComputedWidth + 'px';
                $cvsContainer.style.height = videoComputedHeight + 'px';

                runtimeSettings.region.regionLeft = runtimeSettings.region.regionTop = 0;
                runtimeSettings.region.regionRight = runtimeSettings.region.regionBottom = 100;
                runtimeSettings.region.regionMeasuredByPercentage = 1;
                await scanner.updateRuntimeSettings(runtimeSettings);
            };
            var setRegion = async () => {
                // take a center part of the video and resize the part before decode

                let videoComputedStyle = window.getComputedStyle($video);
                let videoComputedWidth = Math.round(parseFloat(videoComputedStyle.getPropertyValue('width')));
                let videoComputedHeight = Math.round(parseFloat(videoComputedStyle.getPropertyValue('height')));
                $('.scanning-container').css({
                    'width': videoComputedWidth + 'px',
                    'height': videoComputedHeight + 'px'
                });
                $cvsContainer.style.width = $video.videoWidth + 'px';
                $cvsContainer.style.height = $video.videoHeight + 'px';

                setTimeout(async()=>{
                    let cw = $('.sc-frame1').width(),
                        ch = $('.sc-frame1').height(),
                        vw = $('.scanning-container').width(),
                        vh = $('.scanning-container').height();
                    // sometimes vw, vh got negative number, walk around it.
                    if (vw <= 0) { vw = 2; }
                    if (vh <= 0) { vw = 2; }

                    runtimeSettings.region.regionLeft = Math.round((vw - cw) / resizeRate / 2);
                    runtimeSettings.region.regionRight = Math.round((vw + cw) / resizeRate / 2);
                    runtimeSettings.region.regionTop = Math.round((vh - ch) / resizeRate / 2);
                    runtimeSettings.region.regionBottom = Math.round((vh + ch) / resizeRate / 2);
                    runtimeSettings.region.regionMeasuredByPercentage = 0;
                    await scanner.updateRuntimeSettings(runtimeSettings);
                },0);

            };

            $('#ipt-full-feature').change(async function () {
                await funcTryRedirectToFull("support more barcode format and DPM");
                $(this).prop("checked",false);
            });
            $('#ipt-full-feature').prop('checked', false);

// mobile menu btn
            $('#MMenu').change(function () {
                if (this.checked) {
                    document.querySelector('#leftbar').className = 'leftbar visible';
                } else {
                    document.querySelector('#leftbar').className = 'leftbar hidden';
                }
            });

// mobile region btn
            $('#MRegion').change(function () {
                $('canvas').remove();
                // full
                if (this.checked) {
                    $('.scanning-container').fadeOut(300);
                    resetRegion();
                } // region
                else {
                    $('.scanning-container').fadeIn(300);
                    setRegion();
                }
            });

// clear cache
            $('#clearCache').click(function(){
                var oldText = this.innerText;
                this.innerText = 'clearing...';
                $(this).addClass('disable-button');
                try{
                    var request = window.indexedDB.deleteDatabase('dynamsoft');
                    request.onsuccess = request.onerror = ()=>{
                        if(request.error){
                            alert('Clear failed: '+(request.error.message || request.error));
                        }else{
                            alert('Clear success!');
                        }
                        this.innerText = oldText;
                        $(this).removeClass('disable-button');
                    };
                }catch(ex){
                    alert(ex.message || ex);
                    this.innerText = oldText;
                    $(this).removeClass('disable-button');
                }
            });
            $('#MRegion').prop('checked', true);

            var getVideoFrame = () => {//eslint-disable-line
                if($video.paused){
                    let _aImg = document.createElement('a');
                    let _canvas = document.createElement("canvas");

                    _canvas.width = $video.videoWidth;
                    _canvas.height = $video.videoHeight;
                    _canvas.getContext('2d').drawImage($video, 0, 0, _canvas.width, _canvas.height);

                    _aImg.href = _canvas.toDataURL("image/png");
                    _aImg.download = "img.png";
                    _aImg.click();

                    _canvas.remove();
                    _aImg.remove();
                }
            };

            const barcode = txt;
            $("#scanner").animate({opacity: 0}, 400, function() {
                document.getElementById("scanner").style.display = "none";
                document.getElementById("loading").style.opacity = "0";
                document.getElementById("loading").style.display = "table-cell";

                $("#loading").animate({opacity: 1}, 400, function() {
                    let request = new XMLHttpRequest();
                    let url = "http://localhost:5000/get_item?barcode=" + barcode;

                    request.open("GET", url);

                    request.onload = function() {
                        let parsed = JSON.parse(this.response);
                        let sites = parsed["sites"];

                        sites.sort(function(a, b) {
                            return parseFloat(b.offer) - parseFloat(a.offer);
                        });

                        let remaining_table = "";
                        for (let i = 0; i < sites.length; i++) {
                            remaining_table +=
                                "<tr>" +
                                "<td>" + sites[i].site + "</td>" +
                                "<td class = 'title'>" + sites[i].title + "</td>" +
                                "<td>£ " + parseFloat(sites[i].offer) +"</td>" +
                                "<td>" +
                                "<a href = '"+ sites[i].url + "' target = '_blank'>" +
                                "<img class = 'external' src = 'external_link.png'>" +
                                "</a>" +
                                "</td>" +
                                "</tr>";
                        }

                        document.getElementById("remaining-rows").innerHTML = remaining_table;
                        document.getElementById("results").style.opacity = "0";
                        $("#loading").animate({opacity: 0}, function() {
                            document.getElementById("loading").style.display = "none";
                            document.getElementById("results").style.display = "table-cell";
                            $("#results").animate({opacity: 1}, 400);
                        });
                    }

                    request.send();
                });
            });
        };

        if(Dynamsoft.BarcodeReader._bUseFullFeature){
            runtimeSettings = await scanner.getRuntimeSettings();
            runtimeSettings.barcodeFormatIds_2 = 0x1f00000;
            scanner.updateRuntimeSettings(runtimeSettings);
        }

        runtimeSettings = await scanner.getRuntimeSettings();
        // update settings
        if(objQueryStringArgs.interval){
            $("#ipt-interval-"+objQueryStringArgs.interval).prop('checked', true);
            $("#ipt-interval-"+objQueryStringArgs.interval).change();
        }else{
            $('#ipt-interval-100').prop('checked', true);
            $('#ipt-interval-100').change();
        }
        if(objQueryStringArgs.dpm){ // dpm can work when mode change, so not invork change
            $('#ipt-dpm').prop("checked", true);
        }
        if(objQueryStringArgs.mode){
            $("#ipt-mode-"+objQueryStringArgs.mode).prop('checked', true);
            $("#ipt-mode-"+objQueryStringArgs.mode).change();
        }else{
            $('#ipt-mode-bestspeed').prop('checked', true);
            $('#ipt-mode-bestspeed').change();
        }

        if(objQueryStringArgs.invertcolor){
            $('#ipt-invertcolor').prop("checked", true);
            $('#ipt-invertcolor').change();
        }
        return await scanner.open();
    }).then(async function () {
        // camera exist
        $('.picker').fadeIn(300);
        // ui update frame scanning
        $('.scanning-container').css({
            'width': $('#PVideo').css('width'),
            'height': $('#PVideo').css('height')
        });
        // ui update video source
        let curCam = await scanner.getCurrentCamera();
        let allCam = await scanner.getAllCameras();
        for (var i = 0; i < allCam.length; i++) {
            $('#SSource .ls-body').append('<div class="ls-option"><input type="radio" name="source" id="sou' +
                i + '" value="' + allCam[i].deviceId + '"><label for="sou' + i + '" class="radio-btn"></label><label for="sou' + i + '">' + allCam[i].label + '</label></div>');
            if (curCam && allCam[i].deviceId === curCam.deviceId) {
                $('#sou' + i).prop('checked', true);
            }
        }
        // video source changed
        $('.ls-option input[name="source"]').change(function () {
            scanner.play(this.value).then(function (resolution) {
                $('.scanning-container').css({
                    'width': resolution.width,
                    'height': resolution.height
                });
                $('#cResolution').text(resolution.width + ' × ' + resolution.height);
                $('#MRegion').prop('checked')?resetRegion():setRegion();
            });
        });
        // ui update video resolution
        let resolution = scanner.getResolution();
        $('input[name="resolution"]').each(function () {
            if (($(this).attr('data-width') == resolution[0] && $(this).attr('data-height') == resolution[1]) ||
                (($(this).attr('data-width') == resolution[1] && $(this).attr('data-height') == resolution[0]))) {
                $(this).prop('checked', true);
            }
        });
        $('#cResolution').text(resolution[0] + ' × ' + resolution[1]);

        // ui update barcodeFormat
        $('input[name="format"]').each(function () {
            let formatValue = parseInt(this.getAttribute("value"));
            if(!$(this).hasClass('ipt-bf2')){
                if((runtimeSettings.barcodeFormatIds & formatValue) == (~~formatValue)){
                    $(this).prop('checked', true);
                }
            }else{
                if((runtimeSettings.barcodeFormatIds_2 & formatValue) == (~~formatValue)){
                    $(this).prop('checked', true);
                }
            }
        });


        resetRegion();

        // ready?
        setTimeout(function () {
            $('.waiting').fadeOut(300);
        }, 100);
    }, function (ex) {
        console.error(ex); //eslint-disable-line
        // alert(ex);
        let errorTxt = ex.message || ex;
        if (/t support Webassembly/.test(errorTxt) || /not an object/.test(errorTxt)) {
            $('#notSupport').fadeIn(300);
        } else if (/Permission/.test(errorTxt) || /video/.test(errorTxt) || /device/.test(errorTxt) || /Media/.test(errorTxt) || /agent/.test(errorTxt) || /found/.test(errorTxt))
            $('#noCam').fadeIn(300);
        else {
            alert(errorTxt);
        }
        //scanner.close();
    });

// which leftbar item selected
    var _itemSelect = 0;

    $('.leftbar input[name="lItem"]').click(function () {
        if (_itemSelect === this.value) {
            _itemSelect = 0;
            $('.l-secondary').css('display', 'none');
            this.checked = false;
        } else if (_itemSelect !== this.value) {
            $(".l-secondary").css('display', 'none');
            _itemSelect = this.value;
            switch (this.value) {
                case 'itemSource':
                    $('#SSource').css('display', 'block');
                    break;
                case 'itemResolution':
                    $('#SResolution').css('display', 'block');
                    break;
                case 'itemFormats':
                    $('#SFormats').css('display', 'block');
                    break;
                case 'itemSettings':
                    $('#SSettings').css('display', 'block');
                    break;
                case 'itemAbout':
                    $('#SAbout').css('display', 'block');
                    break;
                default:
                    break;
            }
        }
    });

// click other region to hide left bar
    $('.l-item').click(function (ev) {
        ev.stopPropagation();
        $(".l-secondary").css('display', 'none');
    });
    $(document).click(function (ev) {
        if (!$('.leftbar').is(ev.target) && $('.leftbar').has(ev.target).length === 0 && !$('#MMenu').is(ev.target) && !$('.m-region').is(ev.target)) {
            _itemSelect = 0;
            $('.leftbar input[name="lItem"]').each(function () {
                this.checked = false;
            });
            $('.l-secondary').hide();
            if ($('.h-sign-in-mobile').css('display') === 'block') {
                document.querySelector('#leftbar').className = 'leftbar hidden';
                $('#MMenu').prop('checked', false);
            }
        }
    });

// video resolution changed
    $('input[name="resolution"]').change(function () {
        var _curDevice = 0,
            _curWidth = $(this).attr('data-width'),
            _curHeight = $(this).attr('data-height');
        $('input[name="source"]').each(function () {
            if (this.checked) _curDevice = this.value;
        });
        scanner.play(_curDevice, _curWidth, _curHeight).then(function (resolution) {
            $('#cResolution').text(resolution.width + ' × ' + resolution.height);
            $('#MRegion').prop('checked')?resetRegion():setRegion();
        });
    });

// video format changed
    $('#s1DAll').change(async function () {
        let _flag = 0;
        $('.ls-option-2d input[name="format"]').each(function () {
            if (this.checked) _flag |= parseInt(this.value);
        });
        if (this.checked) {
            runtimeSettings.barcodeFormatIds = _flag | Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR;
            await scanner.updateRuntimeSettings(runtimeSettings);
            $('.ls-option-1d input').prop('checked', true);
        } else if (!this.checked) {
            if (_flag === 0) {
                $(this).prop('checked', true);
                alert('Please select at lease one barcode format');
            } else {
                runtimeSettings.barcodeFormatIds = _flag;
                await scanner.updateRuntimeSettings(runtimeSettings);
                $('.ls-option-1d input').prop('checked', false);
            }
        }
    });
    $('#s2DAll').change(async function () {
        let _flag = 0;
        $('.ls-option-1d input[name="format"]').each(function () {
            if (this.checked) _flag |= parseInt(this.value);
        });
        if (this.checked) {
            runtimeSettings.barcodeFormatIds = _flag | ((Dynamsoft.EnumBarcodeFormat.BF_ALL & ~(Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR)));
            await scanner.updateRuntimeSettings(runtimeSettings);
            $('.ls-option-2d input').prop('checked', true);
        } else if (!this.checked) {
            if (_flag === 0) {
                $(this).prop('checked', true);
                alert('Please select at lease one barcode format');
            } else {
                runtimeSettings.barcodeFormatIds = _flag;
                await scanner.updateRuntimeSettings(runtimeSettings);
                $('.ls-option-2d input').prop('checked', false);
            }
        }
    });
    $('.ls-body input[name="format"]').change(async function () {
        let thisValue = parseInt(this.value);
        if(!Dynamsoft.BarcodeReader._bUseFullFeature && (
            (thisValue & deafultBarcodeFormatIds) != (~~thisValue)
            ||
            $(this).hasClass("ipt-bf2")
        )){
            await funcTryRedirectToFull('read ' + $(this).attr('txt'));
            $(this).prop("checked", false);
            return;
        }

        let _flag1 = 0,
            _flag2 = 0,
            _flag3 = 0;
        $('.ls-option-1d input[name="format"]').each(function () {
            if (this.checked) _flag1 |= parseInt(this.value);
        });
        $('.ls-option-2d input[name="format"]').each(function () {
            if (this.checked) _flag2 |= parseInt(this.value);
        });
        $('.ls-option-bf2 input[name="format"]').each(function () {
            if (this.checked) _flag3 |= parseInt(this.value);
        });
        if (_flag1 != (Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR)) $('#s1DAll').prop('checked', false);
        if (_flag1 === (Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR)) $('#s1DAll').prop('checked', true);
        if (_flag2 != (Dynamsoft.EnumBarcodeFormat.BF_ALL & ~(Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR))) $('#s2DAll').prop('checked', false);
        if (_flag2 === (Dynamsoft.EnumBarcodeFormat.BF_ALL & ~(Dynamsoft.EnumBarcodeFormat.BF_ONED | Dynamsoft.EnumBarcodeFormat.BF_GS1_DATABAR))) $('#s2DAll').prop('checked', true);

        if ((_flag1 | _flag2) === 0 && _flag3 === 0) {
            $(this).prop('checked', true);
            alert('Please select at lease one barcode format');
        } else {
            runtimeSettings.barcodeFormatIds = _flag1 | _flag2;
            runtimeSettings.barcodeFormatIds_2 = _flag3;
            await scanner.updateRuntimeSettings(runtimeSettings);
        }
    });

// video reading interval chaneged
    $('.ls-option input[name="settingInterval"]').change(function () {
        scanner.intervalTime = parseInt(this.value);
    });

// video reading mode changed
    $('.ls-option input[name="settingMode"]').change(async function () {
        if('bestspeed' == this.value){
            runtimeSettings.deblurLevel = 0;
            runtimeSettings.expectedBarcodesCount = 0;
            runtimeSettings.scaleDownThreshold = 2300;
            runtimeSettings.localizationModes = [
                Dynamsoft.EnumLocalizationMode.LM_SCAN_DIRECTLY,
                Dynamsoft.EnumLocalizationMode.LM_CONNECTED_BLOCKS,
                0,0,0,0,0,0
            ];
            runtimeSettings.timeout = 10000;
        }else if('balance' == this.value){
            runtimeSettings.deblurLevel = 3;
            runtimeSettings.expectedBarcodesCount = 512;
            runtimeSettings.scaleDownThreshold = 2300;
            runtimeSettings.localizationModes = [
                Dynamsoft.EnumLocalizationMode.LM_CONNECTED_BLOCKS,
                Dynamsoft.EnumLocalizationMode.LM_SCAN_DIRECTLY,
                0,0,0,0,0,0
            ];
            runtimeSettings.timeout = 100000;
        }else if('bestcoverage' == this.value){
            runtimeSettings.deblurLevel = 5;
            runtimeSettings.expectedBarcodesCount = 512;
            runtimeSettings.scaleDownThreshold = 100000;
            runtimeSettings.localizationModes = [
                Dynamsoft.EnumLocalizationMode.LM_CONNECTED_BLOCKS,
                Dynamsoft.EnumLocalizationMode.LM_STATISTICS,
                Dynamsoft.EnumLocalizationMode.LM_SCAN_DIRECTLY,
                Dynamsoft.EnumLocalizationMode.LM_LINES,
                0,0,0,0
            ];
            runtimeSettings.timeout = 100000;
        }
        if($('#ipt-dpm').prop("checked")){
            let locModes = runtimeSettings.localizationModes;
            for(let i in locModes){
                if(locModes[i] == Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS){
                    break;
                }
                if(locModes[i] == 0){
                    locModes[i] = Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS;
                    break;
                }
            }
        }
        await scanner.updateRuntimeSettings(runtimeSettings);
    });
// video reading feature changed
    $('#ipt-invertcolor').change(async function () {
        runtimeSettings.furtherModes.grayscaleTransformationModes = [
            $(this).prop("checked") ? Dynamsoft.EnumGrayscaleTransformationMode.GTM_INVERTED : Dynamsoft.EnumGrayscaleTransformationMode.GTM_ORIGINAL,
            0,0,0,0,0,0,0
        ];
        await scanner.updateRuntimeSettings(runtimeSettings);
    });
    $('#ipt-dpm').change(async function(){
        if(!Dynamsoft.BarcodeReader._bUseFullFeature){
            await funcTryRedirectToFull("use DPM");
            $(this).prop("checked", false);
            return;
        }
        if($(this).prop('checked')){
            let locModes = runtimeSettings.localizationModes;
            for(let i in locModes){
                if(locModes[i] == Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS){
                    break;
                }
                if(locModes[i] == 0){
                    locModes[i] = Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS;
                    break;
                }
            }
        }else{
            let locModes = runtimeSettings.localizationModes;
            for(let i in locModes){
                if(locModes[i] == Dynamsoft.EnumLocalizationMode.LM_STATISTICS_MARKS){
                    locModes[i] = 0;
                    break;
                }
                if(locModes[i] == 0){
                    break;
                }
            }
        }
        await scanner.updateRuntimeSettings(runtimeSettings);
    });

    let resetRegion = async () => {

        let videoComputedStyle = window.getComputedStyle($video);
        let videoComputedWidth = Math.round(parseFloat(videoComputedStyle.getPropertyValue('width')));
        let videoComputedHeight = Math.round(parseFloat(videoComputedStyle.getPropertyValue('height')));
        $('.scanning-container').css({
            'width': videoComputedWidth + 'px',
            'height': videoComputedHeight + 'px'
        });
        $cvsContainer.style.width = videoComputedWidth + 'px';
        $cvsContainer.style.height = videoComputedHeight + 'px';

        runtimeSettings.region.regionLeft = runtimeSettings.region.regionTop = 0;
        runtimeSettings.region.regionRight = runtimeSettings.region.regionBottom = 100;
        runtimeSettings.region.regionMeasuredByPercentage = 1;
        await scanner.updateRuntimeSettings(runtimeSettings);
    };

    var setRegion = async () => {
        // take a center part of the video and resize the part before decode

        let videoComputedStyle = window.getComputedStyle($video);
        let videoComputedWidth = Math.round(parseFloat(videoComputedStyle.getPropertyValue('width')));
        let videoComputedHeight = Math.round(parseFloat(videoComputedStyle.getPropertyValue('height')));
        alert(videoComputedWidth + " " + videoComputedHeight);
        let resizeRate = 1;
        if (videoComputedWidth < $video.videoWidth) {
            resizeRate = videoComputedWidth / $video.videoWidth;
        }

        $('.scanning-container').css({
            'width': videoComputedWidth + 'px',
            'height': videoComputedHeight + 'px'
        });
        $cvsContainer.style.width = $video.videoWidth + 'px';
        $cvsContainer.style.height = $video.videoHeight + 'px';

        setTimeout(async()=>{
            let cw = $('.sc-frame1').width(),
                ch = $('.sc-frame1').height(),
                vw = $('.scanning-container').width(),
                vh = $('.scanning-container').height();
            // sometimes vw, vh got negative number, walk around it.
            if (vw <= 0) { vw = 2; }
            if (vh <= 0) { vw = 2; }

            runtimeSettings.region.regionLeft = Math.round((vw - cw) / resizeRate / 2);
            runtimeSettings.region.regionRight = Math.round((vw + cw) / resizeRate / 2);
            runtimeSettings.region.regionTop = Math.round((vh - ch) / resizeRate / 2);
            runtimeSettings.region.regionBottom = Math.round((vh + ch) / resizeRate / 2);
            runtimeSettings.region.regionMeasuredByPercentage = 0;
            await scanner.updateRuntimeSettings(runtimeSettings);
        },0);

    };

    $('#ipt-full-feature').change(async function () {
        await funcTryRedirectToFull("support more barcode format and DPM");
        $(this).prop("checked",false);
    });
    $('#ipt-full-feature').prop('checked', false);

// mobile menu btn
    $('#MMenu').change(function () {
        if (this.checked) {
            document.querySelector('#leftbar').className = 'leftbar visible';
        } else {
            document.querySelector('#leftbar').className = 'leftbar hidden';
        }
    });

// mobile region btn
    $('#MRegion').change(function () {
        $('canvas').remove();
        // full
        if (this.checked) {
            $('.scanning-container').fadeOut(300);
            resetRegion();
        } // region
        else {
            $('.scanning-container').fadeIn(300);
            setRegion();
        }
    });

// clear cache
    $('#clearCache').click(function(){
        var oldText = this.innerText;
        this.innerText = 'clearing...';
        $(this).addClass('disable-button');
        try{
            var request = window.indexedDB.deleteDatabase('dynamsoft');
            request.onsuccess = request.onerror = ()=>{
                if(request.error){
                    alert('Clear failed: '+(request.error.message || request.error));
                }else{
                    alert('Clear success!');
                }
                this.innerText = oldText;
                $(this).removeClass('disable-button');
            };
        }catch(ex){
            alert(ex.message || ex);
            this.innerText = oldText;
            $(this).removeClass('disable-button');
        }
    });
    $('#MRegion').prop('checked', true);

    var getVideoFrame = () => {//eslint-disable-line
        if($video.paused){
            let _aImg = document.createElement('a');
            let _canvas = document.createElement("canvas");

            _canvas.width = $video.videoWidth;
            _canvas.height = $video.videoHeight;
            _canvas.getContext('2d').drawImage($video, 0, 0, _canvas.width, _canvas.height);

            _aImg.href = _canvas.toDataURL("image/png");
            _aImg.download = "img.png";
            _aImg.click();

            _canvas.remove();
            _aImg.remove();
        }
    };
});
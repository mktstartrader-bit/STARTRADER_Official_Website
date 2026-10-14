let clLog = [];
clLog.push(`step1 star`);

function getPar(params) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(params) || "";
}

function setCookie(name,value,days){
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}
function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}
function setCookieParHasVal(objList) {
    for (let i = 0; i < objList.length; i++) {
        const {paramsName,cookieName,cookieTime} = objList[i];
        if (hasParams(paramsName)) {
            setCookie(cookieName, getPar(paramsName), cookieTime)
        }
    }
}
function hasCookie(cookieName) {
    if (getCookie(cookieName) && getCookie(cookieName) != '' && getCookie(cookieName) != null && getCookie(cookieName) != 'null' && getCookie(cookieName) != undefined && getCookie(cookieName) != 'undefined') {
        return true;
    }
    return false;
}
function hasParams(paramsName) {
    if (getPar(paramsName) && getPar(paramsName) != '' && getPar(paramsName) != null && getPar(paramsName) != 'null' && getPar(paramsName) != undefined && getPar(paramsName) != 'undefined') {
        return true;
    }
    return false;
}

// ls begin
function hasUrlUtm() {
  let urlUtmArr = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'retailleadsource', 'rt', 'ls']
  let flag = false;
  urlUtmArr.forEach((item) => {
    if (getPar(item).replace(/['"‘’“”;`]/g, "") !== '') {
      flag = true;
    }
  })
  return flag;
}
var g_utm_source,g_utm_medium,g_utm_campaign,g_utm_content,g_utm_term,retailleadsource,ls,saveLsm,currentDate,currentLs,g_ls,inviteLinkLs;
function utmParam(){
    g_utm_source = getPar('utm_source') || 'NA';
    g_utm_medium = getPar('utm_medium') || 'NA';
    g_utm_campaign = getPar('utm_campaign') || 'NA';
    g_utm_content = getPar('utm_content') || 'NA';
    g_utm_term = getPar('utm_term') || 'NA';
    retailleadsource = getPar("retailleadsource") || getPar("rt") || 'NA';
    ls = getPar('ls') || 'NA';
    var lsmArr = [g_utm_source,g_utm_medium,g_utm_campaign,g_utm_content,g_utm_term,retailleadsource,ls];
    var lsm_flag = false;
    lsmArr.forEach(function(item ,index) {
        item = item.replace(/['"“”‘’;`]/g,'');
        if(!item){
            item = 'NA';
        }
        if (item != 'NA') {
            lsm_flag = true;
        }
        lsmArr[index] = item;
    });
    currentLsm = `${lsmArr[0]}|${lsmArr[1]}|${lsmArr[2]}|${lsmArr[3]}|${lsmArr[4]}|rt=${lsmArr[5]}|ls=${lsmArr[6]}`;

    currentDate = Date.now();
    if (!lsm_flag) {
        return
    }
    if(getCookie('lsm')){
        saveLsm = JSON.parse(getCookie('lsm'));
        const haveRecord = saveLsm.some(item => item.ls == currentLsm);
        if(haveRecord){
            saveLsm.forEach(item => {
                if(item.ls === currentLsm){
                    item.date = currentDate;
                    return;
                }
            });
            saveLsm.sort((a, b) => a.date - b.date);
            setCookie('lsm',JSON.stringify(saveLsm),90);
        }else{
            saveLsm.push({
                ls: currentLsm,
                date: currentDate
            });
            setCookie('lsm',JSON.stringify(saveLsm),90);
        }
    }else{
        if (getCookie('ls')) {
            if (getCookie('ls') == currentLsm) {
                saveLsm = [
                    {
                        ls: currentLsm,
                        date: currentDate
                    }
                ];
            } else {
                saveLsm = [
                    {
                        ls: getCookie('ls'),
                        date: currentDate - 1
                    },{
                        ls: currentLsm,
                        date: currentDate
                    }
                ];
            }
        } else {
            saveLsm = [
                {
                    ls: currentLsm,
                    date: currentDate
                }
            ];
        }
        setCookie('lsm',JSON.stringify(saveLsm),90);
    }
    inviteLinkLs = currentLsm;
    setCookie('ls',currentLsm,15);
    g_ls = JSON.stringify(saveLsm);
}
if(hasUrlUtm()) {
    utmParam();
} else if (getCookie('lsm')) {
    g_ls = getCookie('lsm');
    inviteLinkLs = getCookie('ls');
    setCookie('ls',getCookie('ls'),15);
    setCookie('lsm',getCookie('lsm'),90);
} else if (getCookie('ls') && !(getCookie('lsm'))) {
    let tempSaveLsm = [
        {
            ls: getCookie('ls'),
            date: Date.now()
        }
    ]
    g_ls = JSON.stringify(tempSaveLsm);
    inviteLinkLs = getCookie('ls');
    setCookie('ls',getCookie('ls'),15);
    setCookie('lsm',g_ls,90);
} else {
    g_ls = '';
}
// ls end

jQuery(document).ready(function ($) {
    var g_affid = '', g_cpaid = '', g_wid = '', g_ib_wid = '', g_cxd = '', g_clickid = '', g_language = '', g_c = '',g_ibpRebateCode = '',g_campaignsource = '',g_track = '';

    switch (WEB_LANGUAGE){
        case 'scn': g_wid = 'ST_SCN',g_ib_wid = 'ST_IB_SCN', g_language = 'zh_CN';break;
        case 'kr': g_wid = 'ST_KR', g_ib_wid = 'ST_IB_KR', g_language = 'ko';break;
        case 'my': g_wid = 'ST_MY', g_ib_wid = 'ST_IB_MY', g_language = 'ms';break;
        case 'vn': g_wid = 'ST_VN', g_ib_wid = 'ST_IB_VN', g_language = 'vi';break;
        case 'th': g_wid = 'ST_TH', g_ib_wid = 'ST_IB_TH', g_language = 'th';break;
        case 'id': g_wid = 'ST_ID', g_ib_wid = 'ST_IB_ID', g_language = 'id';break;
        case 'ar': g_wid = 'ST_AR', g_ib_wid = 'ST_IB_AR', g_language = 'ar';break;
        case 'jp': g_wid = 'ST_JP', g_ib_wid = 'ST_IB_JP', g_language = 'ja';break;
        case 'tw': g_wid = 'ST_TW', g_ib_wid = 'ST_IB_TW', g_language = 'zh_TW';break;
        case 'fr': g_wid = 'ST_FR', g_ib_wid = 'ST_IB_FR', g_language = 'fr_FR';break;
        case 'es': g_wid = 'ST_ES', g_ib_wid = 'ST_IB_ES', g_language = 'es';break;
        case 'pt': g_wid = 'ST_PT', g_ib_wid = 'ST_IB_PT', g_language = 'pt';break;
        case 'de': g_wid = 'ST_DE', g_ib_wid = 'ST_IB_DE', g_language = 'de';break;
        case 'fa': g_wid = 'ST_FA', g_ib_wid = 'ST_IB_FA', g_language = 'en_US';break;
        case 'it': g_wid = 'ST_IT', g_ib_wid = 'ST_IB_IT', g_language = 'it';break;
        case 'ru': g_wid = 'ST_RU', g_ib_wid = 'ST_IB_RU', g_language = 'ru';break;
        case 'tr': g_wid = 'ST_TR', g_ib_wid = 'ST_IB_TR', g_language = 'en_US';break;
        case 'pl': g_wid = 'ST_PL', g_ib_wid = 'ST_IB_PL', g_language = 'pl';break;
        case 'in': g_wid = 'ST_IN', g_ib_wid = 'ST_IB_IN', g_language = 'en_US';break;
        case 'en-in': g_wid = 'ST_ENIN', g_ib_wid = 'ST_IB_ENIN', g_language = 'en_US';break;
        case 'nl': g_wid = 'ST_NL', g_ib_wid = 'ST_IB_NL', g_language = 'nl';break;
        case 'global': g_wid = 'ST_CAEN', g_ib_wid = 'ST_IB_CAEN', g_language = 'ca';break;
        default: g_wid = 'ST', g_ib_wid = 'ST_IB', g_language = 'en_US';break;
    }

    const par_has_val_list = [
        {paramsName:'lg', cookieName:'lg', cookieTime:15},
        {paramsName:'ibpRebateCode', cookieName:'ibpRebateCode', cookieTime:15},
        {paramsName:'cpaid', cookieName:'cpaid', cookieTime:15},
        {paramsName:'clickid', cookieName:'clickid', cookieTime:15},
        {paramsName:'cxd', cookieName:'cxd', cookieTime:15},
        {paramsName:'c', cookieName:'c', cookieTime:15},
        {paramsName:'cs', cookieName:'campaignsource', cookieTime:15},
        {paramsName:'track', cookieName:'track', cookieTime:15},
        {paramsName:'sub1', cookieName:'sub1', cookieTime:15},
        {paramsName:'autoCertification', cookieName:'autoCertification', cookieTime:15},
        {paramsName:'platform', cookieName:'platform', cookieTime:15}
    ]
    setCookieParHasVal(par_has_val_list);

    if (hasParams('cxd')) {
        g_cxd = getPar('cxd');
        let cpaids = getPar('cxd');
        let cpaids1 = cpaids.split('_');
        g_cpaid = cpaids1[0];
        setCookie('cpaid', cpaids1[0], 15);
    }
    
    if (hasCookie('cpaid')) {
        g_cpaid = getCookie('cpaid');
    }

    if (hasParams('cs')) {
        g_affid = '';
        g_campaignsource = getPar('cs');
        setCookie('affid','', -1);
    } else if (hasParams('affid')) {
        g_affid = getPar('affid');
        g_campaignsource = '';
        setCookie('affid', getPar('affid'), 15);
        setCookie('campaignsource', '', -1);
    } 

    if (hasCookie('track')) {
        g_track = getCookie('track');
    }
    if (hasParams('track')) {
        g_track = getPar('track');
    }

    if (hasCookie('affid')) {
        g_affid = getCookie('affid');
    }
    
    if (g_affid == '') {
        $('.form-element.referredBy').show();
    }

    if (hasCookie('cxd')) {
        g_cxd = getCookie('cxd');
    }

    if (hasCookie('clickid')) {
        g_clickid = getCookie('clickid');
    }
    if (hasParams('clickid')) {
        g_clickid = getPar('clickid');
    }
    
    if (hasCookie('c')) {
        g_c = getCookie('c');
    }
    if (hasParams('c')) {
        g_c = getPar('c');
    }

    if (hasCookie('ibpRebateCode')) {
        g_ibpRebateCode = getCookie('ibpRebateCode');
    }
    if (hasParams('ibpRebateCode')) {
        g_ibpRebateCode = getPar('ibpRebateCode');
    }

    if (hasCookie('lsm')) {
        g_ls = getCookie('lsm');
    }

    clLog.push(`step3 base get complete. wid : ${g_wid}`);

    if (getPar('gad_source') == '1') {
        g_affid = '';
        g_ibpRebateCode = '';
        setCookie('affid','',-1);
        setCookie('ibpRebateCode','',-1);
        setCookie("campaignsource", '',-1);
    }

    if (g_ls) {
        g_ls = JSON.parse(g_ls).filter(item => Date.now() - item.date < 90*24*60*60*1000);
        $('input#ls').val(JSON.stringify(g_ls));
        $('input.ls').val(JSON.stringify(g_ls));
        $('.ls input').val(JSON.stringify(g_ls));
    } else {
        $('input#ls').val('');
        $('input.ls').val('');
        $('.ls input').val('');
    }

    $('input#affid').val(g_affid);
    $('input#cpaid').val(g_cpaid);
    $('input#wid').val(g_wid);
    $('input#ib-wid').val(g_ib_wid);
    $('input#cxd').val(g_cxd);
    $('input#language').val(g_language);
    $('input#clickid').val(g_clickid);
    $('input#c').val(g_c);
    $('input#ibpRebateCode').val(g_ibpRebateCode);
    $('input#campaignsource').val(g_campaignsource);
    $('input#track').val(g_track);

    $('input.affid').val(g_affid);
    $('input.cpaid').val(g_cpaid);
    $('input.wid').val(g_wid);
    $('input.cxd').val(g_cxd);
    // $('input.cid').val(g_cid);
    $('input.clickid').val(g_clickid);
    $('input.ibpRebateCode').val(g_ibpRebateCode);
    $('input.campaignsource').val(g_campaignsource);
    $('input.track').val(g_track);

    $('.affid input').val(g_affid);
    $('.cpaid input').val(g_cpaid);
    $('.wid input').val(g_wid);
    $('.cxd input').val(g_cxd);
    // $('.cid input').val(g_cid);
    $('.clickid input').val(g_clickid);
    $('.ibpRebateCode input').val(g_ibpRebateCode);
    $('.campaignsource input').val(g_campaignsource);
    $('.track input').val(g_track);

    // smartBanner
    let isNB = PHP_FUN_ISNB;
    let linkDownUrl = PHP_FUN_ONLINE;
    $('.app_install').attr('href',function(){
        $(this).attr('href',$(this).attr('href') + (isNB == true ? 'cid-' : 'agentAccountNum-') + linkDownUrl);
    })

    clLog.push(`step4 input done. wid : ${g_wid}`)

    try {
        const FLAG_LIST = {
            'ls': inviteLinkLs,
            'cxd': g_cxd,
            'clickid': g_clickid,
            'affid': g_affid,
            'c': getPar('c') || getCookie('c'),
            'ibpRebateCode': g_ibpRebateCode,
            'lg': getPar('lg') || getCookie('lg')
        }
        let page_url = window.location.href.split('?')[0];
        let page_params = '';
        $.each(FLAG_LIST, function(key, value) {
            if (value !== undefined && value !== null && value !== '') {
                page_params += key + '=' + value + '&';
            }
        });
        if (page_params.charAt(page_params.length - 1) == "&") {
            page_params = page_params.slice(0, -1);
        }
        if (page_params != '') {
            page_url += '?' + page_params;
        }
        $('input#inviteLink').val(page_url);
        setCookie('inviteLink',page_url);
        clLog.push(`step5 inviteLink done. wid : ${g_wid}`)
    } catch (error) {
        clLog.push(`step5 inviteLink error. wid : ${g_wid}`)
    }
})



// ! wwwstartr|2026-09-14 13:16:00 !

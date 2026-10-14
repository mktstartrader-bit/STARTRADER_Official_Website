function IsName(str) {
    var flag = new RegExp("[-·_`~!@#$^&*()\-+=<>?=|{}':;',\\[\\].~!<>《》/?~！@#￥……&*（）\"——|{}【】‘；：”“'。，、？]");
 	return flag.test(str);
}
function IsPhone(str) {
    var reg=/^[0-9]{6,15}$/;
    return reg.test(str);
}
function IsPhonecn(str) {
    var reg=/^1[3456789]\d{9}$/;
    return reg.test(str);
}
function IsEmail(str) {
    var reg=/^[\da-z]+([\-\.\_]?[\da-z]+)*@[\da-z]+([\-\.]?[\da-z]+)*(\.[a-z]{2,})+$/i;
    return reg.test(str);
}
function IsDate(str) {
    var reg=/^([0]?[1-9]|[1|2][0-9]|[3][0|1])[/]([0]?[1-9]|[1][0-2])[/]([0-9]{4})$/ ;
    return reg.test(str);
}
function IsAccount(str) {
    var reg=/^\d{5}$/;
    return reg.test(str);
}
function IsClient(str) {
    var reg=/^\d{7}$/;
    return reg.test(str);
}
var guojia_name = "";
var guojia_id = "";
var form_code = "";
var api = "";
var updateTime = "";
var createTime = "";
var form_language;
var url_ac = window.location.pathname;
var page_url = url_ac.split("/")[1];
if(page_url == 'ar'){
	form_language = 'ar';
}else if(page_url == 'th'){
	form_language = 'th';
}else if(page_url == 'cn' || page_url == 'scn' || page_url == 'tw'){
	form_language = 'zh';
}else if(page_url == 'vn'){
	form_language = 'vi';
}else if(page_url == 'id'){
	form_language = 'id';
}else if(page_url == 'my'){
	form_language = 'ms';
}else if(page_url == 'jp'){
	form_language = 'ja';
}else if(page_url == 'kr'){
	form_language = 'ko';
}else if(page_url == 'es'){
	form_language = 'es';
}else if(page_url == 'fr'){
	form_language = 'fr';
}else if(page_url == 'pt'){
	form_language = 'pt';
}else if(page_url == 'fen'){
	form_language = 'en';
}else if(page_url == 'de'){
    form_language = 'de';
}else if(page_url == 'fa'){
    form_language = 'fa';
}else if(page_url == 'ru'){
    form_language = 'ru';
}else if(page_url == 'tr'){
    form_language = 'tr';
}else if(page_url == 'it'){
    form_language = 'it';
}else if(page_url == 'pl'){
    form_language = 'pl';
}else if(page_url == 'in'){
    form_language = 'hi';
}else if (page_url == 'en-in') {
    form_language = 'en-in';
}else{
	form_language = 'en';
}
jQuery(document).ready(function ($) {
    var selects_data = [
        ['flag-cn','+86',"China +86"],
        ['flag-al','+355',"Albania +355"],
        ['flag-dz','+213',"Algeria +213"],
        ['flag-af','+93',"Afghanistan +93"],
        ['flag-ar','+54',"Argentina +54"],
        ['flag-ae','+971',"United Arab Emirates +971"],
        ['flag-om','+968',"Oman +968"],
        ['flag-az','+994',"Azerbaijan +994"],
        ['flag-eg','+20',"Egypt +20"],
        ['flag-et','+251',"Ethiopia +251"],
        ['flag-ie','+353',"Ireland +353"],
        ['flag-ee','+372',"Estonia +372"],
        ['flag-ad','+376',"Andorra +376"],
        ['flag-ao','+244',"Angola +244"],
        ['flag-au','+61',"Australia +61"],
        ['flag-at','+43',"Austria +43"],
        ['flag-pg','+675',"Papua New Guinea +675"],
        ['flag-bs','+1242',"Bahamas +1242"],
        ['flag-pk','+92',"Pakistan +92"],
        ['flag-py','+595',"Paraguay +595"],
        ['flag-bh','+973',"Bahrain +973"],
        ['flag-pa','+507',"Panama +507"],
        ['flag-br','+55',"Brazil +55"],
        ['flag-by','+375',"Belarus +375"],
        ['flag-bm','+1441',"Bermuda +1441"],
        ['flag-bg','+359',"Bulgarian +359"],
        ['flag-bo','+591',"Bolivia +591"],
        ['flag-bj','+229',"Benin +229"],
        ['flag-be','+32',"Belgium +32"],
        ['flag-is','+354',"Iceland +354"],
        ['flag-pr','+1787',"Puerto Rico +1787"],
        ['flag-pl','+48',"Poland +48"],
        ['flag-bo','+591',"Bolivia +591"],
        ['flag-ba','+387',"Bosnia and Herzegovina +387"],
        ['flag-bw','+267',"Botswana +267"],
        ['flag-bz','+501',"Belize +501"],
        ['flag-bt','+975',"Bhutan +975"],
        ['flag-bf','+226',"Burkina Faso +226"],
        ['flag-bi','+257',"Burundi +257"],
        ['flag-dk','+45',"Denmark +45"],
        ['flag-de','+49',"Deutschland +49"],
        ['flag-tl','+670',"East Timor +670"],
        ['flag-tg','+228',"Togo +228"],
        ['flag-dm','+1767',"Dominica +1767"],
        ['flag-do','+1890',"Dominican Republic +1890"],
        ['flag-ru','+7',"Russia +7"],
        ['flag-ec','+593',"Ecuador +593"],
        ['flag-er','+291',"Eritrea +291"],
        ['flag-fr','+33',"France +33"],
        ['flag-fo','+298',"Faroe Islands +298"],
        ['flag-pf','+689',"French Polynesia +689"],
        ['flag-ph','+63',"Philippines +63"],
        ['flag-fj','+679',"Fiji +679"],
        ['flag-fi','+358',"Finland +358"],
        ['flag-cv','+238',"Cape Verde +238"],
        ['flag-gm','+220',"Gambia +220"],
        ['flag-co','+57',"Colombia +57"],
        ['flag-cr','+506',"Costa Rica +506"],
        ['flag-gd','+1809',"Grenada +1809"],
        ['flag-gl','+299',"Greenland +299"],
        // ['flag-cu','+53',"Cuba +53"],
        ['flag-gu','+671',"Guam +671"],
        ['flag-gy','+592',"Guyana +592"],
        ['flag-kz','+7',"Kazakhstan +7"],
        ['flag-ht','+509',"Haiti +509"],
        ['flag-nl','+31',"Netherlands +31"],
        ['flag-hn','+504',"Honduras +504"],
        ['flag-ki','+686',"Kiribati +686"],
        ['flag-dj','+253',"Djibouti +253"],
        ['flag-kj','+996',"Kyrgyzstan +996"],
        ['flag-gn','+224',"Guinea +224"],
        ['flag-gw','+245',"Guinea-Bissau +245"],
        ['flag-ca','+1',"Canada +1"],
        ['flag-gh','+233',"Ghana +233"],
        ['flag-ga','+241',"Gabon +241"],
        ['flag-kh','+855',"Cambodia +855"],
        ['flag-cz','+420',"Czech Republic +420"],
        ['flag-zw','+263',"Zimbabwe +263"],
        ['flag-cm','+237',"Cameroon +237"],
        ['flag-qa','+974',"Qatar +974"],
        ['flag-ky','+1345',"Cayman Islands +1345"],
        ['flag-km','+269',"Comoros +269"],
        ['flag-kw','+965',"Kuwait +965"],
        ['flag-ke','+254',"Kenya +254"],
        ['flag-ck','+682',"Cook Islands +682"],
        ['flag-lv','+371',"Latvia +371"],
        ['flag-ls','+266',"Lesotho +266"],
        ['flag-la','+856',"Laos +856"],
        ['flag-lb','+961',"Lebanon +961"],
        ['flag-lr','+231',"Liberia +231"],
        ['flag-ly','+218',"Libya +218"],
        ['flag-lt','+370',"Lithuania +370"],
        ['flag-li','+41 75',"Liechtenstein +41 75"],
        ['flag-lu','+352',"Luxembourg +352"],
        ['flag-rw','+250',"Rwanda +250"],
        ['flag-ro','+40',"Romania +40"],
        ['flag-mg','+261',"Madagascar +261"],
        ['flag-mv','+960',"Maldives +960"],
        ['flag-mt','+356',"Malta +356"],
        ['flag-mw','+265',"Malawi +265"],
        ['flag-my','+60',"Malaysia +60"],
        ['flag-ml','+223',"Mali +223"],
        ['flag-mk','+389',"Macedonia +389"],
        ['flag-mh','+692',"Marshall Islands +692"],
        ['flag-mu','+230',"Mauritius +230"],
        ['flag-mr','+222',"Mauritania +222"],
        ['flag-us','+1',"United States +1"],
        ['flag-as','+1684',"Samoa +1684"],
        ['flag-mn','+976',"Mongolia +976"],
        ['flag-fm','+691',"Micronesia +691"],
        ['flag-pe','+51',"Peru +51"],
        ['flag-mm','+95',"Myanmar +95"],
        ['flag-md','+373',"Moldova +373"],
        ['flag-ma','+212',"Morocco +212"],
        ['flag-mc','+377',"Monaco +377"],
        ['flag-mz','+258',"Mozambique +258"],
        ['flag-mx','+52',"Mexico +52"],
        ['flag-na','+264',"Namibia +264"],
        ['flag-za','+27',"South Africa +27"],
        ['flag-aq','+672',"Antarctica +672"],
        ['flag-nr','+674',"Nauru +674"],
        ['flag-np','+977',"Nepal +977"],
        ['flag-ni','+505',"Nicaragua +505"],
        ['flag-ne','+227',"Niger +227"],
        ['flag-ng','+234',"Nigeria +234"],
        ['flag-no','+47',"Norway +47"],
        ['flag-pw','+680',"Palau +680"],
        ['flag-pt','+351',"Portugal +351"],
        ['flag-ge','+995',"Georgia +995"],
        ['flag-jp','+81',"Japan +81"],
        ['flag-se','+46',"Sweden +46"],
        ['flag-ch','+41',"Switzerland +41"],
        ['flag-sv','+503',"El Salvador +503"],
        ['flag-rs','+381',"Serbia +381"],
        ['flag-sl','+232',"Sierra Leone +232"],
        ['flag-sn','+221',"Senegal +221"],
        ['flag-cy','+357',"Cyprus +357"],
        ['flag-sc','+248',"Seychelles +248"],
        ['flag-sa','+966',"Saudi Arabia +966"],
        ['flag-st','+239',"Sao Tome and Principe +239"],
        ['flag-lc','+1758',"Saint Lucia +1758"],
        ['flag-sm','+378',"San Marino +378"],
        ['flag-vc','+1784',"Saint Vincent and the Grenadines +1784"],
        ['flag-lk','+94',"Sri Lanka +94"],
        ['flag-sk','+421',"Slovakia +421"],
        ['flag-si','+SLO',"Slovenia +SLO"],
        ['flag-sz','+268',"Eswatini +268"],
        ['flag-sd','+249',"Sudan +249"],
        ['flag-sr','+597',"Surinam +597"],
        ['flag-sb','+677',"Solomon Islands +677"],
        ['flag-so','+252',"Somalia +252"],
        ['flag-tj','+992',"Tajikistan +992"],
        ['flag-th','+66',"Thailand +66"],
        ['flag-tz','+255',"Tanzania +255"],
        ['flag-to','+676',"Tonga +676"],
        ['flag-tt','+1809',"Trinidad and Tobago +1809"],
        ['flag-tn','+216',"Tunisia +216"],
        ['flag-tv','+688',"Tuvalu +688"],
        ['flag-tr','+90',"Turkey +90"],
        ['flag-tw','+993',"Turkmenistan +993"],
        ['flag-vu','+678',"Vanuatu +678"],
        ['flag-gt','+502',"Guatemala +502"],
        ['flag-null','+1',"Virgin Islands, US +1"],
        ['flag-null','+1809',"Virgin Islands, British +1809"],
        ['flag-ve','+58',"Venezuela +58"],
        ['flag-bn','+673',"Brunei +673"],
        ['flag-ug','+256',"Uganda +256"],
        ['flag-ua','+380',"Ukraine +380"],
        ['flag-uy','+598',"Uruguay +598"],
        ['flag-uz','+998',"Uzbekistan +998"],
        ['flag-es','+34',"Spain +34"],
        ['flag-gr','+30',"Greece +30"],
        ['flag-sg','+65',"Singapore +65"],
        ['flag-nz','+64',"New Zealand +64"],
        ['flag-hu','+36',"Hungary +36"],
        ['flag-sy','+963',"Syria +963"],
        ['flag-jm','+1876',"Jamaica +1876"],
        ['flag-am','+374',"Armenia +374"],
        ['flag-ye','+967',"Yemen +967"],
        ['flag-iq','+964',"Iraq +964"],
        ['flag-ir','+98',"Iran +98"],
        ['flag-il','+972',"Israel +972"],
        ['flag-it','+39',"Italy +39"],
        ['flag-in','+91',"India +91"],
        ['flag-id','+62',"Indonesia +62"],
        ['flag-gb','+44',"United Kingdom +44"],
        ['flag-jo','+962',"Jordan +962"],
        ['flag-vn','+84',"Vietnam +84"],
        ['flag-zm','+260',"Zambia +260"],
        ['flag-td','+235',"Chad +235"],
        ['flag-cl','+56',"Chile +56"],
        ['flag-cf','+236',"Central African Republic +236"],
        ['flag-as','+1684',"American Samoa +1684"],
        ['flag-bd','+880',"Bangladesh +880"],
        ['flag-cd','+243',"Congo, Democratic Republic of the +243"],
        ['flag-cg','+242',"Congo, Republic of the +242"],
        ['flag-gq','+240',"Equatorial Guinea +240"],
        ['flag-hk','+852',"Hong Kong +852"],
        ['flag-null','+383',"Kosovo +383"],
        ['flag-me','+382',"Montenegro +382"],
        // ['flag-kp','+850',"North Korea +850"],
        ['flag-ps','+930',"Palestine, State of +930"],
        ['flag-kn','+1869',"Saint Kitts and Nevis +1869"],
        ['flag-sx','+1721',"Sint Maarten +1721"],
        ['flag-kr','+82',"South Korea +82"],
        ['flag-null','+211',"Sudan, South +211"],
        ['flag-tw','+886',"Taiwan +886"],
        ['flag-na','+379',"Vatican City +379"],
        ['flag-ci','+225',"Côte d'Ivoire +225"],
        ['flag-bb','+1246',"Barbados +1246"],
        ['flag-ag','+1268',"Antigua and Barbuda +1268"],
        ['flag-mo','+853',"Macao +853"],
        ['flag-null','',"Other"],
        ['flag-hr','+385',"The Republic of Croatia +385"],
        ['flag-ai','+1264',"Anguilla +1264"],
        ['flag-aw','+297',"Aruba +297"],
        ['flag-cw','+5999',"Curacao +5999"],
        ['flag-null','+970',"Gaza Strip +970"],
        ['flag-gi','+350',"Gibraltar +350"],
        ['flag-gg','+44',"Guernsey +44"],
        ['flag-im','+44',"Isle of Man +44"],
        ['flag-je','+44',"Jersey +44"],
        ['flag-ms','+1664',"Montserrat +1664"],
        ['flag-nu','+683',"Niue +683"],
        ['flag-sx','+1721',"St Maarten +1721"],
        ['flag-ss','+211',"South Sudan +211"],
        ['flag-tc','+1649',"Turks & Caicos +1649"],
        ['flag-null','+972',"West Bank(Palestinian Territory, Occupation) +972"],
        ['flag-ps','+970',"Palestine +970"],
        ['flag-nc','+687',"New Caledonia +687"],
        ['flag-mq','+596',"Martinique +596"]
    ]

    var search_quhao = [];
    // console.log(guojia[0][0])
    function quhaostr(arr,str){
        str += "<ul id='englp_city' class='englp_city' style='position:relative; top:0; left:0;'>";
        for(var a = 0 ;a < arr.length;a++){
            str += "<li class='" +arr[a][0]+ "' data-val='" +arr[a][1]+ "'>" +arr[a][2]+ "</li>";
            search_quhao.push((arr[a][2]).toLowerCase());
        }
        str += "</ul>";
        return str;
    }
    var country_quhao = quhaostr(selects_data,country_quhao)
    $("#select_quhao,#demo_quhao").append(country_quhao);

    var city_name = "";
    $("#select_quhao,#demo_quhao").find("ul li").click(function(event){
        city_name = $(this).text().split("+")[0];
        //console.log(city_name);
        var num_pho = $(this).text().split("+")[1];
        $("#lp_area,#demo_area").val("+" + num_pho);
        if(window.event){
            event.cancelBubble  = true;
        }else{
            event.stopPropagation();
        }
        $(this).parent().parent().hide();
    });
    // $("#lp_area").focus(function(){
    //     $("#select_quhao").slideDown();
    // });
    $(".line .down,#lp_area,#demo_area").click(function(){
        $("#select_quhao,#demo_quhao").slideToggle();
    })
    $(document).click(function(event){
        var objtar_1 = event.srcElement ? event.srcElement : event.target;
        if($(objtar_1).parent().hasClass("englp_city") || $(objtar_1).attr("id")=="lp_area" || $(objtar_1).hasClass("down")|| $(objtar_1).attr("id")=="demo_area" || $(objtar_1).attr("id")=="area_search"){
            // console.log("aa")
        }else{
            $("#select_quhao,#demo_quhao").slideUp();
        }
    })
    var strguo = "";
    var guojia = [
        [4, "Afghanistan", "阿富汗"],
        [2, "Albania", "阿尔巴尼亚"],
        [3, "Algeria", "阿尔及利亚"],
        [193, "American Samoa", "美国萨摩亚"],
        [13, "Andorra", "安道尔"],
        [14, "Angola", "安哥拉"],
        [215, "Anguilla", "安圭拉"],
        [120, "Antarctica", "南极洲"],
        [211, "Antigua and Barbuda", "安提瓜和巴布达岛"],
        [5, "Argentina", "阿根廷"],
        [178, "Armenia", "亚美尼亚"],
        [216, "Aruba", "阿鲁巴"],
        [15, "Australia", "澳大利亚"],
        [16, "Austria", "奥地利"],
        [8, "Azerbaijan", "阿塞拜疆"],
        [18, "Bahamas", "巴哈马"],
        [21, "Bahrain", "巴林"],
        [194, "Bangladesh", "孟加拉国"],
        [210, "Barbados", "巴巴多斯"],
        [24, "Belarus", "白俄罗斯"],
        [29, "Belgium", "比利时"],
        [36, "Belize", "伯利兹"],
        [28, "Benin", "贝宁"],
        [25, "Bermuda", "百慕大"],
        [37, "Bhutan", "不丹"],
        [33, "Bolivia", "玻利维亚"],
        [34, "Bosnia and Herzegovina", "波斯尼亚和黑塞哥维那"],
        [35, "Botswana", "博茨瓦纳"],
        [23, "Brazil", "巴西"],
        [166, "Brunei", "文莱"],
        [26, "Bulgarian", "保加利亚"],
        [38, "Burkina Faso", "布基纳法索"],
        [39, "Burundi", "布隆迪"],
        [76, "Cambodia", "柬埔寨"],
        [79, "Cameroon", "喀麦隆"],
        [73, "Canada", "加拿大"],
        [55, "Cape Verde", "佛得角"],
        [81, "Cayman Islands", "开曼群岛"],
        [192, "Central African Republic", "中非共和国"],
        [190, "Chad", "乍得"],
        [191, "Chile", "智利"],
        [1, "China", "中国"],
        [57, "Colombia", "哥伦比亚"],
        [82, "Comoros", "科摩罗"],
        [195, "Congo, Democratic Republic of the", "刚果民主共和国"],
        [196, "Congo, Republic of the", "刚果共和国"],
        [85, "Cook Islands", "库克群岛"],
        [58, "Costa Rica", "哥斯达黎加"],
        [209, "Côte d'Ivoire", "象牙海岸"],
        // [61, "Cuba", "古巴"],
        [217, "Curacao", "库拉索"],
        [137, "Cyprus", "塞浦路斯"],
        [77, "Czech Republic", "捷克共和国"],
        [40, "Denmark", "丹麦"],
        [41, "Deutschland", "德国"],
        [69, "Djibouti", "吉布提"],
        [44, "Dominica", "多米尼加"],
        [45, "Dominican Republic", "多米尼加共和国"],
        [42, "East Timor", "东帝汶"],
        [47, "Ecuador", "厄瓜多尔"],
        [9, "Egypt", "埃及"],
        [133, "El Salvador", "萨尔瓦多"],
        [197, "Equatorial Guinea", "赤道几内亚"],
        [48, "Eritrea", "厄立特里亚"],
        [12, "Estonia", "爱沙尼亚"],
        [10, "Ethiopia", "埃塞俄比亚"],
        [50, "Faroe Islands", "法罗群岛"],
        [53, "Fiji", "斐济"],
        [54, "Finland", "芬兰"],
        [49, "France", "法国"],
        [51, "French Polynesia", "法属波利尼西亚"],
        [75, "Gabon", "加蓬"],
        [56, "Gambia", "冈比亚"],
        [218, "Gaza Strip", "加萨走廊"],
        [129, "Georgia", "乔治亚"],
        [74, "Ghana", "加纳"],
        [219, "Gibraltar", "直布罗陀"],
        [172, "Greece", "希腊"],
        [60, "Greenland", "格陵兰"],
        [59, "Grenada", "格林纳达"],
        [62, "Guam", "关岛"],
        [162, "Guatemala", "危地马拉"],
        [220, "Guernsey", "根西"],
        [71, "Guinea", "几内亚"],
        [72, "Guinea-Bissau", "几内亚比绍"],
        [63, "Guyana", "圭亚那"],
        [65, "Haiti", "海地"],
        [67, "Honduras", "洪都拉斯"],
        [198, "Hong Kong", "香港"],
        [175, "Hungary", "匈牙利"],
        [30, "Iceland", "冰岛"],
        [184, "India", "印度"],
        [185, "Indonesia", "印度尼西亚"],
        [181, "Iran", "伊朗"],
        [180, "Iraq", "伊拉克"],
        [11, "Ireland", "爱尔兰"],
        [221, "Isle of Man", "马恩岛"],
        [182, "Israel", "以色列"], 
        [183, "Italy", "意大利"],
        [177, "Jamaica", "牙买加"], 
        [130, "Japan", "日本"],
        [222, "Jersey", "泽西"],
        [187, "Jordan", "约旦"],
        [64, "Kazakhstan", "哈萨克斯坦"],
        [84, "Kenya", "肯尼亚"],
        [68, "Kiribati", "基里巴斯"],
        [199, "Kosovo", "科索沃"],
        [83, "Kuwait", "科威特"],
        [70, "Kyrgyzstan", "吉尔吉斯斯坦"],
        [88, "Laos", "老挝"],
        [86, "Latvia", "拉脱维亚"],
        [89, "Lebanon", "黎巴嫩"],
        [87, "Lesotho", "莱索托"],
        [90, "Liberia", "利比里亚"],
        [91, "Libya", "利比亚"],
        [93, "Liechtenstein", "列支敦士登"],
        [92, "Lithuania", "立陶宛"],
        [94, "Luxembourg", "卢森堡"],
        [212, "Macao", "澳门"],
        [103, "Macedonia", "马其顿"],
        [97, "Madagascar", "马达加斯加"],
        [100, "Malawi", "马拉维"],
        [101, "Malaysia", "马来西亚"],
        [98, "Maldives", "马尔代夫"],
        [102, "Mali", "马里"],
        [99, "Malta", "马耳他"],
        [104, "Marshall Islands", "马绍尔群岛"],
        [233, "Martinique", "马提尼克岛"],
        [106, "Mauritania", "毛里塔尼亚"],
        [105, "Mauritius", "毛里求斯"],
        [117, "Mexico", "墨西哥"],
        [110, "Micronesia", "密克罗尼西亚"],
        [113, "Moldova", "摩尔多瓦"],
        [115, "Monaco", "摩纳哥"],
        [109, "Mongolia", "蒙古"],
        [200, "Montenegro", "黑山"],
        [223, "Montserrat", "蒙塞拉特"],
        [114, "Morocco", "摩洛哥"],
        [116, "Mozambique", "莫桑比克"],
        [112, "Myanmar", "缅甸"],
        [118, "Namibia", "纳米比亚"],
        [121, "Nauru", "瑙鲁"],
        [122, "Nepal", "尼泊尔"],
        [66, "Netherlands", "荷兰"],
        [236, "New Caledonia", "法属新喀里多尼亚"],
        [174, "New Zealand", "新西兰"],
        [123, "Nicaragua", "尼加拉瓜"],
        [124, "Niger", "尼日尔"],
        [125, "Nigeria", "尼日利亚"],
        [224, "Niue", "紐埃"],
        // [201, "North Korea", "朝鲜"],
        [27, "Northern Mariana Islands", "北马里亚纳群岛"],
        [126, "Norway", "挪威"],
        [7, "Oman", "阿曼"],
        [19, "Pakistan", "巴基斯坦"],
        [127, "Palau", "帕劳群岛"],
        [231, "Palestine", "巴勒斯坦"],
        [202, "Palestine, State of", "巴勒斯坦州"],
        [22, "Panama", "巴拿马"],
        [17, "Papua New Guinea", "巴布亚新几内亚"],
        [20, "Paraguay", "巴拉圭"],
        [111, "Peru", "秘鲁"],
        [52, "Philippines", "菲律宾"],
        [32, "Poland", "波兰"],
        [128, "Portugal", "葡萄牙"],
        [31, "Puerto Rico", "波多黎各"],
        [80, "Qatar", "卡塔尔"],
        [96, "Romania", "罗马尼亚"],
        [46, "Russia", "俄罗斯"],
        [95, "Rwanda", "卢旺达"],
        [203, "Saint Kitts and Nevis", "尼维斯"],
        [141, "Saint Lucia", "圣卢西亚"],
        [143, "Saint Vincent and the Grenadines", "圣文森特和格林纳丁斯"],
        [108, "Samoa", "美属萨摩亚"],
        [142, "San Marino", "圣马力诺"],
        [140, "Sao Tome and Principe", "圣多美和普林西比"],
        [139, "Saudi Arabia", "沙特阿拉伯"],
        [136, "Senegal", "塞内加尔"],
        [134, "Serbia", "塞尔维亚,黑山"],
        [138, "Seychelles", "塞舌尔"],
        [135, "Sierra Leone", "塞拉利昂"],
        [173, "Singapore", "新加坡"],
        [204, "Sint Maarten", "荷属圣马丁"],
        [145, "Slovakia", "斯洛伐克"],
        [146, "Slovenia", "斯洛文尼亚"],
        [150, "Solomon Islands", "所罗门群岛"],
        [151, "Somalia", "索马里"],
        [119, "South Africa", "南非"],
        [205, "South Korea", "韩国"],
        [226, "South Sudan", "南苏丹"],
        [171, "Spain", "西班牙"],
        [144, "Sri Lanka", "斯里兰卡"],
        [225, "St Maarten", "圣马丁岛"],
        [148, "Sudan", "苏丹"],
        [206, "Sudan, South", "苏丹南"],
        [149, "Surinam", "苏里南"],
        [147, "Eswatini", "斯威士兰"],
        [131, "Sweden", "瑞典"],
        [132, "Switzerland", "瑞士"],
        [176, "Syria", "叙利亚"],
        [207, "Taiwan", "台湾"],
        [152, "Tajikistan", "塔吉克斯坦"],
        [154, "Tanzania", "坦桑尼亚"],
        [153, "Thailand", "泰国"],
        [214, "The Republic of Croatia", "克罗地亚"],
        [43, "Togo", "多哥"],
        [155, "Tonga", "汤加"],
        [156, "Trinidad and Tobago", "特立尼达和多巴哥"],
        [157, "Tunisia", "突尼斯"],
        [159, "Turkey", "土耳其"],
        [160, "Turkmenistan", "土库曼斯坦"],
        [228, "Turks & Caicos", "特克斯和凯科斯群岛"],
        [158, "Tuvalu", "图瓦卢"],
        [167, "Uganda", "乌干达"],
        [168, "Ukraine", "乌克兰"],
        [6, "United Arab Emirates", "阿拉伯联合酋长国"],
        [186, "United Kingdom", "英国"],
        [107, "United States", "美国"],
        [169, "Uruguay", "乌拉圭"],
        [170, "Uzbekistan", "乌兹别克斯坦"],
        [161, "Vanuatu", "瓦努阿图"],
        [208, "Vatican City", "梵蒂冈城"],
        [165, "Venezuela", "委内瑞拉"],
        [188, "Vietnam", "越南"],
        [164, "Virgin Islands, British", "维尔京群岛，英属"],
        [163, "Virgin Islands, US", "维尔京群岛，美属"],
        [229, "West Bank(Palestinian Territory, Occupation)", "约旦河西岸"],
        [179, "Yemen", "也门"],
        [189, "Zambia", "赞比亚"],
        [78, "Zimbabwe", "津巴布韦"],
        [213, "Other", "其他"]
    ];
    var search_country = [];
    function optionstr(arr,str){
        for(var a = 0 ;a < arr.length;a++){
            str += "<li value='" +arr[a][0]+ "' data-name='" + arr[a][2] + "'>" + arr[a][1] + "</li>";
            search_country.push((arr[a][1]).toLowerCase())
        }
        return str;
    }
    // option
    var strguo = optionstr(guojia,strguo);
    $(".coun_btn,.choose_country_ul").append(strguo);
    $("#country,.form_choose_country").focus(function(){
        $(".coun_btn,.choose_country").slideToggle();
    });
    $(".country_box .shac .sanjiao").click(function(){
        $(".coun_btn,.choose_country").slideToggle();

    });
    $(document).click(function(event){
        var objtar_1 = event.srcElement ? event.srcElement : event.target;
        if($(objtar_1).parent().hasClass("coun_btn") || $(objtar_1).attr("id")=="country" || $(objtar_1).hasClass("sanjiao") || $(objtar_1).parent().hasClass("form_choose") || $(objtar_1).attr("id")=="country_search"){
            //console.log("aa");
        }else{
            $(".coun_btn,.choose_country").slideUp();
        }
        //demo Deposit amount
        if($(objtar_1).parent().hasClass("demo_amount") == false){
            $('.demo_amount .demo_select_amount').slideUp();
        }
        if($(objtar_1).parent().hasClass("demo_seaccount") == false){
            $('.demo_seaccount .demo_select_amount').slideUp();
        }
        if($(objtar_1).parent().hasClass("demo_lever") == false){
            $('.demo_lever .demo_select_amount').slideUp();
        }
    })
    $(".coun_btn").find("li").click(function(event){
        // country name
        guojia_name = $(this).text();
        // country id
        guojia_id = $(this).attr("value");

        $("#country").val(guojia_name);

        if(window.event){
            event.cancelBubble  = true;
        }else{
            event.stopPropagation();
        }
        $(this).parent().hide();
    });
 //======== form country =========
    $(".choose_country_ul").find("li").click(function(event){
        // country name
        guojia_name = $(this).text();
        // country id
        guojia_id = $(this).attr("value");
        $(".form_choose_country").val(guojia_name);

        if(window.event){
            event.cancelBubble  = true;
        }else{
            event.stopPropagation();
        }
        $(this).parents('form_choose_country').hide();
    });
    //======== form search =========
    $("#country_search").keyup(function(){
        var cs_text = $(this).val().toLowerCase();
        if($.trim(cs_text)!=""){
            for(var i in search_country){
                if(cs_text != search_country[i].substring(0,cs_text.length)){
                    $(".choose_country .choose_country_ul li").eq(i).hide();
                }else{
                  	$(".choose_country .choose_country_ul li").eq(i).show();
                }
            }
        }else{
            $(".choose_country .choose_country_ul li").show();
        }
    });
    $("#area_search").keyup(function(){
        var ar_text = $(this).val().toLowerCase();
        if($.trim(ar_text)!=""){
            for(var i in search_quhao){
                if(ar_text != search_quhao[i].substring(0,ar_text.length)){
                    $(".form_quhao ul li").eq(i).hide();
                }else{
                    $(".form_quhao ul li").eq(i).show();
                }
            }
        }else{
            $(".form_quhao ul li").show();
        }
    });
    // demo error closed
    $(".demo_close_pop,.demo_window_bg").click(function(){
        $(".demo_window_bg,.demo_window").fadeOut();
        location.reload();
    })
    // $("input").attr("autocomplete","over");
    $(".lp_form_write .bonus_wrap").click(function(){
        if($("#agree").hasClass("no_active")){
            $("#agree").removeClass("no_active").addClass("active");
            $("#bonus_sumit").attr("disabled",false).css({
                "opacity":1,
                "cursor": "pointer"
            });
        }else{
            $("#agree").removeClass("active").addClass("no_active");
            $("#bonus_sumit").attr("disabled",true).css({
                "opacity":.5,
                "cursor": "not-allowed"
            });
        }
    });
    var isClick = true;
    $("#bonus_sumit").click(function(){
        var country = $.trim($(".form_choose_country").val());
        var name = $.trim($(".name").val());
        var phone = $.trim($(".form_phone").val());
        var area_code =  $.trim($(".form_quhaoinput").val());
        var email = $.trim($(".email").val());
        var flag = 0;
        if(getPar("channel")&&getPar("channel")!=""){
            form_code=getPar("channel");
        }
        if(name == "" || name == "undefined"){
            $(".form_name .error").show().html(required_err);
            flag = 1;
        }else if(IsName(name)){
            $(".form_name .error").show().html(special_err);
            flag = 1;
        }else if(name.length>60){
            $(".form_name .error").show().html(long_err);
            flag = 1;
        }else{
            $(".form_name .error").html('');
        }

        if(email == "" || email == "undefined"){
            $(".form_email .error").show().html(required_err);
            flag = 1;
        }else if(!IsEmail(email)){
            $(".form_email .error").show().html(email_err);
            flag = 1;
        }else{
            $(".form_email .error").html('');
        }

        if(phone == "" || phone == "undefined"){
            $('.form_number .error').show().html(required_err);
            flag = 1;
        }else if(!IsPhone(phone)){
            $('.form_number .error').show().html(phone_err);
            flag = 1;
        }else if(area_code == '+86' && !IsPhonecn(phone)){
            $('.form_number .error').show().html(phone_err);
            flag = 1;
        }else if(area_code =="" || area_code == "undefined"){
            $('.form_number .error').show().html(area_err);
            flag = 1;
        }else {
            $('.form_number .error').html('');
        }
        if(country == "" || country == "undefined"){
            $(".form_country .error").show().html(required_err);
            flag = 1;
        }else{
            $(".form_country .error").html('');
        }
        if(flag == 0){
            var strdata = {
                "code": form_code,
                "activityId": "",
                "activityName": "",
                "cityId":'',
                "cityName":'',
                "countryId":guojia_id,
                "countryName": country,
                "createTime":createTime,
                "createUserId": "",
                "createUserName": "",
                "email": email,
                "gender": "",
                "id": "",
                "leadsCareer": 1,
                "leadsChannel": 1,
                "leadsTag": 1,
                "leadsType": 1,
                "mobileNumber": area_code +  phone,
                "name":name,
                "provinceId": "",
                "provinceName": "",
                "qq": "",
                "updateTime": updateTime,
                "updateUserId": "",
                "updateUserName": "",
                "userId": "",
                "wechat": "",
                "language":form_language
            };
            if(isClick){
                isClick = false;
                $.ajax({
                    type:"post",
                    beforeSend:function(xhr){
                        xhr.setRequestHeader("Content-Type", "application/json");
                    },
                    url:api,
                    dataType:"json",
                    data: JSON.stringify(strdata),
                    success:function(msg){
					 isClick = true;
					 if(msg.code == "MSCS0000"){
                        $(".lp_form_write").fadeOut();
                        $(".bonus_success").fadeIn();
					 }else{
                        $(".demo_window_bg,.demo_window").fadeIn();
					 }

                    },
                    error:function(){
                        isClick = true;
                        $(".demo_window_bg,.demo_window").fadeIn();
                    }
                });
            }
        }
    })
})

// ! wwwstartr|2026-06-17 10:06:00 !

jQuery(document).ready(async function($){

    function myAjax(url, options) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                dataType: options.dataType || 'json',
                headers: options.headers || {"Content-Type":"application/json"},
                type: options.type || 'GET',
                data: options.data || {},
                success: resolve,
                error: (xhr, status, error) => {
                  reject({code:null,message:error,data:null});
                }
            });
        });
    }
    function executeRecaptcha(key) {
        return new Promise((resolve, reject) => {
            grecaptcha.execute(key).then((token) => {resolve({token});}).catch((error) => {reject(error);});
        });
    }
    // $(".registration_idcard input[type=file]").attr('multiple', 'multiple');
    if (location.href.indexOf("affiliate-switch-bonus-registration") !== -1) {
        var source = 3;
        var defultCode = "ST_Affiliate_Switch_bonus_2309"
    } else {
        var source = 1;
        var defultCode = "Affiliate_leads"
    }
    var url_ac = window.location.pathname;
    var page_url = url_ac.split("/")[1];
    if (page_url === 'en-in') {
        defultCode = 'Affiliate_leads_in_en';
    }
    // const source = 1;
    // ma bta
    var af_am = '',
        af_bta = '';
    if(getPar('affiliate_language'))  {
        af_language = getPar('affiliate_language');
        if(af_language==='fr'){
            window.location.href = '/fr/affiliate-registration';
        }
    }
    if(getPar('am')){
        af_am = getPar('am')
        if(af_am==='134'){
            window.location.href = '/fr/affiliate-registration';
        }
        setCookie('am',getPar('am'),15)
    }else if(getCookie('am')){
        af_am = getCookie('am')
    }
    if(getPar('bta')){
        af_bta = getPar('bta')
        setCookie('bta',getPar('bta'),15)
    }else if(getCookie('bta')){
        af_bta = getCookie('bta')
    }



    // google key
    // var googleKey = "6LcmtWcjAAAAAOjiIrCXo1fck6JXfiV11PhsniPk"
    var googleKey = "6LcEm4EpAAAAAAokwJuQtfANSbe1BtV2gAatiWAR"
    $("head").append(`<script type='text/javascript' src='https://www.google.com/recaptcha/api.js?render=${googleKey}'></script>`)
    
    $('.registration_username input').attr({ autocomplete: "new-password"});
    $('.registration_password input').attr({ autocomplete: "new-password" });
    var platform = window.navigator.platform;
    $('.registration_password .error_info').after('<span id="eyes" class=""></span>')
    $('.registration_password input').attr('type','password');
    $('#eyes').click(function(){
        if($('.registration_password input').attr('type') == 'password'){
            $(this).addClass('active');
            $('.registration_password input').attr('type','text')
        }else{
            $(this).removeClass('active');
            $('.registration_password input').attr('type','password')
        }
    })

    // other--show or hidden
    // $(".other_title").on("click",function(){
    //     if ($(this).hasClass("rotate180")) {
    //         $(this).removeClass("rotate180");
    //         $(".registration_other_wrap").slideUp(500);
    //     } else {
    //         $(this).addClass("rotate180");
    //         $(".form_body .registration_form form .registration_other_select").css("display","block")
    //         $(".registration_other_wrap").slideDown(500);
    //     }
    // })

    function countour_height(class1,class2){
        var outerWidth = $(document.body).outerWidth() + getScrollBarWidth();
        if(outerWidth<= class2 ){
          class1.outerHeight("auto");
        }else{
          var maxheight = 0;
          class1.each(function(){
              class1.outerHeight("auto")
              if($(this).height()>maxheight){
                  maxheight = $(this).height();
              }
          });
          class1.height(maxheight)
        }
      }
      $(window).resize(function() {
        start_counter_height();
      })
      start_counter_height();
      function start_counter_height(){
          countour_height($(".form_body .registration_form form .registration_upload_wrap .gfield_description span p"),640);
      }



    /* ajax get code */
    var allCountryData = []
    var countryList = getCountries();
    var numberList = getNumbers();
    var googleFlag = true;
    if (USER_COUNTRY_CODE == "CN" || USER_COUNTRY_CODE == "TW") {
        googleFlag = false;
    }



    function getCountry(){
        var code='',country = '';
        $.each(countryList, function (i, item) {
            country += `<option area-code="${item.number}" value="${item.country}">${item.country}</option>`;
        });
        $.each(numberList, function (m, numItem) {
            code += `<option value="+${numItem.number}">+${numItem.number}</option>`;
        });


        $(".registration_code select option:eq(0)").after(code)
        $(".registration_country select option:eq(0)").after(country)
        $(".registration_other_select:eq(1) select option:eq(0)").after(country)
        clearInterval(aTimer);

        
        $.each(countryList, function (j, item) {
            if (USER_COUNTRY_CODE == item.code) {
                $(".registration_country select").val(item.country).change();
                $('.registration_code select').val('+' + item.number).change();
                return false;
            }
        });
    }
    if($("div.registration_form").css('display') == 'block'){
        var aTimer = setInterval(() => {
            getCountry()
        }, 3000);
        getCountry()
    }
    // linkage
    $('.registration_country select').change(function (e) {
        let change_country_val = $(this).val()
        let temp_ls = getCookie('ls');
        let au_url_ls = '';
        if (temp_ls != '') {
            au_url_ls = temp_ls.indexOf('ls=') > 0 ? temp_ls.split('ls=',temp_ls.length)[1] : temp_ls.split('ls=',temp_ls.length)[0];
        }
        if (change_country_val == 'Australia') {
            window.location.href = "https://www.startraderprime.com.au/live-account/?affid=" + getCookie('affid') + "&cpaid=" + getCookie('cpaid') + "&cxd=" + getCookie('cxd') + "&ls=" + au_url_ls;
        }
        $.each(countryList, function (k, item) {
            if (item.country === change_country_val) {
              $('.registration_code select').val('+' + item.number).change();
              return false;
            }
        });
    });
    // file upload
    var fileList = [[],[],[]]
    var fileUrlList = []
    var sendUserFilesPoi = [];  // id card
    var sendUserFilesPoa = [];  // address
    var fileTemp = "";
    let is_file = [true,true,true];
    $('.registration_upload').each(function(i){
        $(this).click(function(event){
            $(this).find('input[type=file]').removeAttr('multiple');
            if(!is_file[i]){return}
            const inputFile = $(this).children('.ginput_container_fileupload').find('input[type=file]').eq(0);
            const imgNum = $(this).children('.registration_preview_img').children('.registration_preview_img_mask_wrap')
            if ($(event.target).is('input[type=file]') || $(event.target).is('.registration_preview_img_mask')) {
                event.stopPropagation();
                return;
            }
            if($(event.target).is('img')){
                event.stopPropagation();
                if (i == 0 || i == 1) {
                    for(var index in sendUserFilesPoi){
                        if(sendUserFilesPoi[index].order == i && sendUserFilesPoi[index].filename == event.target.dataset.file){
                            sendUserFilesPoi.splice(index, 1)
                        }
                    }
                } else {
                    for(var index in sendUserFilesPoa){
                        if(sendUserFilesPoa[index].order == i && sendUserFilesPoa[index].filename == event.target.dataset.file){
                            sendUserFilesPoa.splice(0, 1)
                        }
                    }
                }
                var previewImg = $(event.target).parents('.registration_preview_img')
                $(event.target).parent('.registration_preview_img_mask').parent('.registration_preview_img_mask_wrap').remove()
                inputFile.val('')
                if(previewImg.children().length == 0){
                    previewImg.css('position', 'absolute');
                    $(this).children(".gfield_description").children("span").css("display","block");
                    $(this).children(".gfield_description").children("img").css("display","block");

                    $('.ginput_preview_list').eq(i).find('.gform_delete_file').click(function(e){e.stopPropagation();});
                    $('.ginput_preview_list').eq(i).find('.gform_delete_file').trigger('click');
                }
                return;
            }
            if (imgNum.length >= 1){
                return false;
            }
            inputFile.off('input').one('input',function(e){
                var nowThis = $(this);
                var file = e.target.files[0];
                var reader = new FileReader();
                var fileSize = file.size;
                var AllExt = ".csv|.xls|.xlsx|.jpg|.gif|.png|.ico|.bmp|.jpeg|.pdf|";
                var ImgExt = ".jpg|.gif|.png|.ico|.bmp|.jpeg|";
                var extName = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
                if (AllExt.indexOf(extName + "|") == -1) {
                    $(this).parent().parent().siblings('.error_info').html(reg_img_format_err)
                    return false;
                }
                var NotImg = false;
                if (ImgExt.indexOf(extName + "|") == -1) {
                    NotImg = true
                }
                if (fileSize > 20971520){
                    $(this).parent().parent().siblings('.error_info').html(reg_img_size_err)
                    return false;
                }
                $(this).parent().parent().siblings('.error_info').html('')


                reader.onload = function (ee) {
                    const fileContent = ee.target.result;
                    let upload_filt_type = getFileExtension(file.name);
                    let regFileType = isFileFormat(fileContent,upload_filt_type);
                        const loading_el = $(nowThis).parents('.registration_upload').find('.registration_upload_loading');
                        loading_el.show();
                        is_file[i] = false;
                        const time = setInterval(()=>{
                            const el = $(nowThis).parents('.registration_upload').find('.gfield_fileupload_percent');
                            const delete_btn = $(nowThis).parents('.registration_upload').find('.gform_delete_file');
                            if(Number(el.text().replace('%','') ) > 20){
                                loading_el.find('.registration_upload_loading_progress').css('width',el.text());
                            }
                            if(el.length > 0 && delete_btn.length > 0 && el.text().includes('100')){
                                setTimeout(()=>{
                                    loading_el.hide();
                                    loading_el.find('.registration_upload_loading_progress').css('width','20%');
                                },500)
                                if(NotImg == true){
                                    $(nowThis).parents('.registration_upload').find('.registration_preview_img').css('position','initial').append(`<div class='registration_preview_img_mask_wrap'><p>${file.name}</p><div class='registration_preview_img_mask'><img data-num=${i} data-file=${file.name} src='/wp-content/themes/startrader/images/delete_previewimg.png'></div></div>`);
                                } else {
                                    $(nowThis).parents('.registration_upload').find('.registration_preview_img').css('position','initial').append(`<div class='registration_preview_img_mask_wrap'><img data-file=${file.name} src=${URL.createObjectURL(file)}><div class='registration_preview_img_mask'><img data-file=${file.name} src='/wp-content/themes/startrader/images/delete_previewimg.png'></div></div>`);
                                }
                                $(nowThis).parents('.registration_upload').find(".gfield_description").children("span").css("display","none");
                                $(nowThis).parents('.registration_upload').find(".gfield_description").children("img").css("display","none");
                                fileList[i].push(file)
                                is_file[i] = true;
                                clearInterval(time);

                            }
                        },500)
                    // if (regFileType) {

                    // } else {
                    //     $(nowThis).parents('.registration_upload_wrap').find('.error_info').html(reg_img_format_err)
                    //     return false;
                    // }
                };
                reader.readAsArrayBuffer(file);
            })
            inputFile.click();
        })
    })

    $(document).keydown(function(e) {
        if(e.which == 13){
            return false;
        }
    });

    // next_step
    function IsRegEmail(str) {
        var reg=/^[A-Za-z\d]+([-_.]*[A-Za-z\d_]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,}$/;
        return reg.test(str);
    }
    function IsRegPhone(str) {
        var reg=/^\d+$/;
        return reg.test(str);
    }
    function IsRegPhoneCN(str) {
        var reg=/^1[3456789]\d{9}$/;
        return reg.test(str);
    }
    function IsRegUserName(str) {
        var reg = /^[a-zA-Z0-9@._]+$/
        return reg.test(str);
    }
    function IsRegPassword(str) {
        var reg = /^(?=.*\d).{8,20}$/
        return reg.test(str);
    }
    function animateScrollTo(ele){
        if(ele.attr('class') != 'error_info'){
            $('html, body').animate({scrollTop: ele.offset().top -100}, 500);
        }else{
            $('html, body').animate({scrollTop: ele.offset().top - (($(window).height() - ele.height()) / 2)}, 500);
        }
    }


    var select_values = new Array(6).fill('');
    $('.ginput_container_select,.registration_other_select_country').each(function(i){
        $(this).change(function(){
            var selectValue = $(this).find('option:selected').val();
            select_values[i] = selectValue
        })
    })



    // Determine the uniqueness of the mailbox
    var emailMsg = ''
    var userNameMsg = ''
    var answerList = []
    $('#registration_submit').on("click",async function(){
        $('.registration_rotate_loading_wrap').show()
        var nowShowUploadWrap = $('.registration_upload_wrap');
        var flag = 0;
        // for (var fileout = 0; fileout < fileList.length; fileout++) {
        //     if (fileout == 1) {
        //         continue
        //     } else if(fileList[fileout] == ""){
        //         $(nowShowUploadWrap[fileout]).children(".error_info").html(reg_required_err);
        //         flag = 1;
        //     } else {
        //         $(nowShowUploadWrap[fileout]).children(".error_info").html("");
        //     }
        // }


            const file_data = $('[name="gform_uploaded_files"]').val();
            if(file_data){
                var fileArr=JSON.parse(file_data);

                if(!fileArr['input_24'] || fileArr['input_24'].length === 0){
                    $(nowShowUploadWrap[0]).children(".error_info").html(reg_required_err);
                    flag = 1;
                }else{
                    $(nowShowUploadWrap[0]).children(".error_info").html("");
                }

                if(!fileArr['input_25'] || fileArr['input_25'].length === 0){
                    $(nowShowUploadWrap[2]).children(".error_info").html(reg_required_err);
                    flag = 1;
                }else{
                    $(nowShowUploadWrap[2]).children(".error_info").html("");
                }
            }else{
                 $(nowShowUploadWrap[0]).children(".error_info").html(reg_required_err);
                 $(nowShowUploadWrap[2]).children(".error_info").html(reg_required_err);
                flag = 1;
            }





        // newFileUrlList = fileUrlList.map(fileUrlListItem => {
        //     return {type:fileUrlListItem.type,uri: fileUrlListItem.uri}
        // })
        sendToCrmUserFilesPoi = sendUserFilesPoi.map(sendUserFilesPoiItem => {
            return {type:sendUserFilesPoiItem.type,uri: sendUserFilesPoiItem.uri}
        })
        sendToCrmUserFilesPoa = sendUserFilesPoa.map(sendUserFilesPoaItem => {
            return {type:sendUserFilesPoaItem.type,uri: sendUserFilesPoaItem.uri}
        })


        var name = $.trim($('.registration_name input').val());
        var email = $.trim($('.registration_email input').val());
        var area = $.trim($('.registration_code select').val());
        var phone = Number($.trim($('.registration_phone_number input').val()));
        var country = $.trim($('.registration_country select').val());
        var userName = $.trim($('.registration_username input').val());
        var password = $.trim($('.registration_password input').val());

        // if(firstName == ''){
        //     $('.registration_first_name .error_info').html(reg_required_err)
        //     flag = 1
        // }else{
        //     $('.registration_first_name .error_info').html('')
        // }

        if(name == ''){
            $('.registration_name .error_info').html(reg_required_err)
            flag = 1
        }else{
            $('.registration_name .error_info').html('')
        }


        if(area == ''){
            $('.registration_code .error_info').html(area_err)
            flag = 1;
        }else{
            $('.registration_code .error_info').html('')
            // $(".registration_code input").val(area);
        }


        if(phone == ''){
            $('.registration_phone_number .error_info').html(reg_required_err)
            flag = 1;
        }else if(!IsRegPhone(phone)){
            $('.registration_phone_number .error_info').html(reg_phone_err)
            flag = 1;
        }else if($('.registration_code select').val() == '+86'){
            if(!IsRegPhoneCN(phone)){
                $('.registration_phone_number .error_info').html(reg_phone_err)
                flag = 1;
            }else{
                $('.registration_phone_number .error_info').html('')
                $('.registration_code .error_info').html('')
                $(".registration_code input").val(area);
            }
        }else{
            $('.registration_phone_number .error_info').html('')
        }





        if(country == ''){
            $('.registration_country .error_info').html(reg_required_err)
            flag = 1;
        }else{
            $('.registration_country .error_info').html('')
            $(".registration_country input").val(country);
        }

        if(password == ''){
            $('.registration_password .error_info').html(reg_required_err)
            flag = 1;
        }else if(password.length < 8){
            $('.registration_password .error_info').html(reg_pwd_long_err)
            flag = 1;
        }else if(!IsRegPassword(password)){
            $('.registration_password .error_info').html(reg_special_err)
            flag = 1;
        }else{
            $('.registration_password .error_info').html('')
        }

        if(userName == ''){
            $('.registration_username .error_info').html(reg_required_err);
            flag = 1;
        }else if(userName.length < 6){
            $('.registration_username .error_info').html(reg_username_long_err);
            flag = 1;
        }else if(!IsRegUserName(userName)){
            $('.registration_username .error_info').html(reg_special_err);
            flag = 1;
        }else{
            $('.registration_username .error_info').html('');
        }

        if(email == ''){
            $('.registration_email .error_info').html(reg_required_err);
            flag = 1;
        } else if (!IsRegEmail(email)){
            $('.registration_email .error_info').html(reg_email_special_err);
            flag = 1;
        }else{
            $('.registration_email .error_info').html('')
        }
        if($('.agree_checkbox input[type=checkbox]').prop('checked')){
            $('.agree_checkbox .error_info').html("")
        } else {
            $('.agree_checkbox .error_info').html(reg_required_err);
            flag = 1;
        }
        // sroll to first error
        var scrollEle = $('.error_info').filter(function(){
            return $(this).html() !== '';
        }).first();
        if(scrollEle.length > 0){
            $('.registration_rotate_loading_wrap').hide()
            animateScrollTo(scrollEle)
        }
        answerList = $('.registration_other_select select').map(function(index){
            if($(this).val()){
                return {question:$(this).children('option:eq(0)').text(),answer:$(this).val()}
            }
        }).get()
        $('.registration_other_select:eq(1) input').val($('.registration_other_select:eq(1) select').val())
        if(flag == 0){
            $('.registration_country input').val($('.registration_country select').val())
            $('.registration_code input').val($('.registration_code select').val())
            // for(var i in fileList){
            //     for(var ii in fileList[i]){
            //         if(i == 0){
            //             $('.registration_idcard input[type=file]')[ii].files = createFileList(fileList[i][ii])
            //         }else if(i == 2){
            //             $('.registration_postcard input[type=file]')[ii].files = createFileList(fileList[i][ii])
            //         }
            //     }
            // }
            // $('.registration_rotate_loading_wrap').show()
            let m_url;
            let siteName = '/';
            if(url_lang == 'en'){
                m_url = '/data/cellxpert_register_v3.php';
            }else{
                m_url = '/' + url_lang +'/data/cellxpert_register_v3.php';
                siteName = '/' + url_lang + '/';
            }
            let demodatacpa = {
                Username:$.trim($('.registration_username input').val()),
                Password:$.trim($('.registration_password input').val()),
                FirstName:$.trim($('.registration_name input').val()),
                LastName:$.trim($('.registration_name input').val()),
                Email :$.trim($('.registration_email input').val()),
                Street:'',
                Country:$('.registration_country input').val(),
                State:'',
                City:'',
                ZIPCode:'',
                Code:$('.registration_code input').val(),
                Phone:Number($.trim($('.registration_phone_number input').val())),
                SelectValues:select_values,
                site_name:siteName,
                Skype:'',
                Telegram:'',
                Website:'',
                Company:'',
                BusinessType:'',
                SourceType:'',
                SiteLanguage:'',
                SecondaryWebsite:'',
                BTA:af_bta,
                AM:af_am,
                ImportFromAffiliate:'',
                CustomCampaignId:'',
                google_v3_token:''
            }
            //username  ajax ----------------------------------------------------------------------------------------------------------------------
            const {code:username_code,data:username_data}= await myAjax('/data/cellxpert_register_v3.php?a=checkuser',{type:'POST',data:JSON.stringify({Username:$.trim($('.registration_username input').val())})});

            if(!username_code){
                return $('.registration_window_bg,.registration_window').show();
            }
            if(username_code !== 200){
                $('.registration_username .error_info').html(reg_username_err)
                animateScrollTo($('.registration_username .error_info'))
                $('.registration_rotate_loading_wrap').hide()
                return;
            }
            if(username_data == 'Taken'){
                $('.registration_username .error_info').html(reg_username_err)
                animateScrollTo($('.registration_username .error_info'))
                $('.registration_rotate_loading_wrap').hide()
                return;
            }
             // ------------------------------------------------------------------------------------------------------------------------------------

            if (demodatacpa.Username == '' || demodatacpa.Password == '' || demodatacpa.FirstName == '' || demodatacpa.LastName == '' || demodatacpa.Email == '' || demodatacpa.Country == '' || demodatacpa.Phone == '' || !$('.agree_checkbox input[type=checkbox]').prop('checked')) {
                $('.registration_rotate_loading_wrap').hide()
                $('.registration_window_bg,.registration_window').show()
                return;
            }


            //get file message
            const file_data = $('[name="gform_uploaded_files"]').val();
            if(file_data){
                var fileArr=JSON.parse(file_data);
                if(fileArr['input_24']){
                    demodatacpa.file_24=JSON.stringify(fileArr['input_24'])
                }
                if(fileArr['input_38']){
                    demodatacpa.file_38=JSON.stringify(fileArr['input_38'])
                }
                if(fileArr['input_25']){
                    demodatacpa.file_25=JSON.stringify(fileArr['input_25'])
                }
            }

            //ip != cn || tw
            if(googleFlag){
                const {token} = await executeRecaptcha(googleKey);
                if(!token) return;
                demodatacpa.google_v3_token = token;
            }

            const {code,message} = await myAjax(m_url,{type:'POST',data: JSON.stringify(demodatacpa)});

            if(!code){
                $('.registration_window_bg,.registration_window').show();
                $('.registration_rotate_loading_wrap').hide();
                return;
            }
            if(code === 200){
                $('.registration_password input').val('');
                $('.affiliate_register_form').css('display','none');
                $(".affiliate_register .success_info").css("display","flex");
                $('.registration_rotate_loading_wrap').hide()
                animateScrollTo($('.form_left_title')) //form_left_title
            }else if(code === 500 && message == 'Email already exist'){
                $('.registration_email .error_info').html(reg_email_err);
                $('.registration_rotate_loading_wrap').hide()
                animateScrollTo($('.registration_email .error_info'))
            }else if(code === 500 && message == 'Username already exist'){
                $('.registration_username .error_info').html(reg_username_err);
                $('.registration_rotate_loading_wrap').hide()
                animateScrollTo($('.registration_username .error_info'))
            }else if(code === 701 && message == 'Please fill in file_25.'){
                $('.registration_rotate_loading_wrap').hide()
                $('.registration_step_two .registration_upload_wrap').eq(2).children(".error_info").html(reg_required_err);
                animateScrollTo($(nowShowUploadWrap[2]).children(".error_info"))
            } else if(code === 701 && message == 'Please fill in file_24.'){
                $('.registration_rotate_loading_wrap').hide()
                $('.registration_step_two .registration_upload_wrap').eq(0).children(".error_info").html(reg_required_err);
                animateScrollTo($(nowShowUploadWrap[0]).children(".error_info"))
            } else{
                $('.registration_window_bg,.registration_window').show();
                $('.registration_rotate_loading_wrap').hide();
            }
            return;
        }
    })
    function createFileList(files) {
        var fileList = new DataTransfer();
        fileList.items.add(files);
        return fileList.files;
    }

    // if($("div.gform_confirmation_message").length>0){
    //     $('.registration_form').css('display','none');
    //     $(".registration_wrap .success_info").css("display","block");
    //     animateScrollTo($('.join_us'))
    // }

    // close error
    $('.registration_close_pop').click(function (e) {
        $('.registration_window_bg,.registration_window').hide()
    });



    function getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
    }
    function isFileFormat(fileContent, fileFormat) {
        const formatSignatures = {
            csv: [0x43, 0x53, 0x56], // CSV
            xls: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // XLS
            xlsx: [0x50, 0x4B, 0x03, 0x04], // XLSX
            jpg: [0xFF, 0xD8, 0xFF], // JPG
            gif: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF
            png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
            ico: [0x00, 0x00, 0x01, 0x00], // ICO
            bmp: [0x42, 0x4D], // BMP
            jpeg: [0xFF, 0xD8, 0xFF], // JPEG
            pdf: [0x25, 0x50, 0x44, 0x46], // PDF
        };
        const headerBytes = new Uint8Array(fileContent, 0, formatSignatures[fileFormat].length);
        for (let i = 0; i < formatSignatures[fileFormat].length; i++) {
            if (headerBytes[i] !== formatSignatures[fileFormat][i]) {
                return false;
            }
        }
        return true;
    }



        $('.item_select select').on('change',function(e){
            $(this).parents('.item_select').find('label').hide();
        })

})
// ! wwwstartr|2026-09-09 15:56:00 !

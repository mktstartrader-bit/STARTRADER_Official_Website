function getScrollBarWidth() {
	const outerDiv = document.createElement('div');
	outerDiv.style.position = 'absolute';
	outerDiv.style.visibility = 'hidden';
	outerDiv.style.overflow = 'scroll';
	document.body.appendChild(outerDiv);
	const innerDiv = document.createElement('div');
	outerDiv.appendChild(innerDiv);
	const scrollBarWidth = outerDiv.offsetWidth - innerDiv.offsetWidth;
	document.body.removeChild(outerDiv);
	return scrollBarWidth
}
jQuery(document).ready(function ($) {
function contour_height(class1,class2) {
    var outerWidth=$(document.body).outerWidth() + getScrollBarWidth();
    if(outerWidth<=class2){
        class1.outerHeight("auto");
    }else{
        // $(window).on('load',function(){
            var maxHeight=0;
        class1.each(function(){
            class1.outerHeight("auto")
            if($(this).height()>maxHeight){
                 maxHeight=$(this).height();
            }
        });
        class1.height(maxHeight);
        // })


    }
}

function setBodyTop(monitor_type){
    requestAnimationFrame(()=>{
        const header_height = $('header').height();
        const old_header_height = parseInt(document.documentElement.style.getPropertyValue('--header-height'));
        if(monitor_type === 'scroll' && header_height <= old_header_height) return;
        document.documentElement.style.setProperty('--header-height', header_height + 'px');
        $('#single').css('padding-top',header_height);
    })
}
function start_contour_height(){
    setTimeout(()=>{
        contour_height($(".funding_list ul li"),368);
        contour_height($(".pamm_step .getting_div h3"),800);
        contour_height($(".pamm_step .getting_div p"),800);
        contour_height($(".down_right .icon_div"),0);
        contour_height($(".liquidity_list li"),300);
        contour_height($(".follower_provider_list li"),768);
        contour_height($(".llo_ul ul li"),768);
        contour_height($(".legal_list li a p"),700);
        contour_height($(".upcoming_webinars .post_list_table h3"),450);
        contour_height($(".previous_webinars .post_list_table h3"),450);
        contour_height($(".trading_post ul li h5"),650);
        contour_height($(".trading_post ul li p"),650);
        contour_height($(".article_content h4"),650);
        contour_height($(".article_content p"),650);
        contour_height($(".unlock_your_exclusive h3"),960);
        contour_height($(".giveaways_my .unlock_your_exclusive h3"),640);
	    contour_height($(".important_links h3"),768);
        contour_height($(".pro_link_step .getting_div h3"),800);
        contour_height($(".pro_link_step .getting_div p"),800);
        contour_height($(".dual_rewards .inner>ul>li h3"),800);
        contour_height($(".dual_rewards_p"),800);
        contour_height($(".seminars .seminars_events .post_box ul li h3"),600);
        contour_height($(".honoring_evolving ul.listTop li p"),768);
        contour_height($(".honoring_evolving ul.listBottom li p"),768);
        contour_height($(".partnership_matters ul li p"),768);
        contour_height($(".partnership_matters ul li h3"),768);
    })
}
$(window).scroll(function () {
    setBodyTop('scroll');
});
$(window).on('load',function(){
    start_contour_height();
    setBodyTop();
})
$(window).resize(function(){
    start_contour_height();
    setBodyTop();
})
start_contour_height();
setBodyTop();
})
// ! wwwstartr|2026-05-07 15:36:00 !

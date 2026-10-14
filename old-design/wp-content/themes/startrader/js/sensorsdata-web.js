let vau_current_lang = "en";

let current_page_name = window.location.pathname;
let vau_current_url = window.location.pathname.split("/")[1];

switch (vau_current_url){
	case 'scn': vau_current_lang = 'hans'; break;
	case 'tw': vau_current_lang = 'hant'; break;
	case 'kr': vau_current_lang = 'ko'; break;
	case 'my': vau_current_lang = 'ms'; break;
	case 'vn': vau_current_lang = 'vi'; break;
	case 'th': vau_current_lang = 'th'; break;
	case 'id': vau_current_lang = 'id'; break;
	case 'ar': vau_current_lang = 'ar'; break;
	case 'jp': vau_current_lang = 'jp'; break;
	case 'fr': vau_current_lang = 'fr'; break;
	case 'es': vau_current_lang = 'es'; break;
	case 'pt': vau_current_lang = 'pt'; break;
	case 'de': vau_current_lang = 'de'; break;
	case 'fa': vau_current_lang = 'fa'; break;
	case 'it': vau_current_lang = 'it'; break;
	case 'ru': vau_current_lang = 'ru'; break;
	case 'tr': vau_current_lang = 'tr'; break;
	case 'pl': vau_current_lang = 'pl'; break;
	case 'in': vau_current_lang = 'in'; break;
	case 'nl': vau_current_lang = 'nl'; break;
	case 'global': vau_current_lang = 'global'; break;
	default: vau_current_lang = 'en'; break;
}

if (vau_current_lang != 'en') {
	let tempFlag = '/' + vau_current_url;
	current_page_name = current_page_name.split(tempFlag)[1];
}


var sensors = window['sensorsDataAnalytic201505'];
sensors.init({
	server_url: 'https://data.strstat.com/sa?project=Star',
	// server_url: 'https://test-data.clouddashboard123.com/sa?project=testproject',   // test api
	is_track_single_page:false,
	use_client_time:true,
	// show_log :true,
	send_type:'beacon',
	heatmap: {
		clickmap:'default',
		scroll_notice_map:'not_collect'
	}
});

let single_ls = null;

try {
	if(is_single && !getCookie('ls')){
		single_ls = 'NA|NA|NA|NA|NA|rt=NA|ls=websiteblog';
	}
	if (WEB_URL == 'expo-leads/trade-now' && !getCookie('ls')){
		single_ls = 'NA|NA|NA|NA|NA|rt=NA|ls=STARexpoiFXExpo';
	}
} catch (error) {
	console.log('is_single error shence');

}


sensors.registerPage({
	brand_name: 'Star',
	platform_type: vau_data_platform_type,
    current_lang:vau_current_lang,
	current_activity_name:single_ls?single_ls:getCookie('ls')
});

jQuery(document).ready(function($){

	// post share ico begin
	$('.addtoany_share a').click(function() {
		let share_type = $(this).find('span.a2a_label').text();
		if (share_type == 'X') {
			share_type = 'Twitter';
		}
		try {
			sensors.track('ShareMethod_Click', {
				current_page_name : current_page_name,
				share_type : share_type,
				is_activity_share : 0,
				activity_id : "",
				activity_name :"",
				event_name_string : 'ShareMethod_Click'
			});
        } catch (error) {
            console.log(error);
        };

	})
	// post share ico end


	$('.sensorsdata_lv_3').click(function() {
		let vaule = $(this).attr('data-web-data').split('_');
		try {
			sensors.track('Web_Navigation_Click', {
				primary_category: vaule[0],
				secondary_category: vaule[1],
				tertiary_category: vaule[2],
				event_name_string : 'Web_Navigation_Click'
			});
        } catch (error) {
            console.log(error);
        };

	})
	$('.sensorsdata_lv_4').click(function() {
		let vaule = $(this).attr('data-web-data').split('_');
		try {
			sensors.track('Web_Navigation_Click', {
				primary_category: vaule[0],
				secondary_category: vaule[1],
				tertiary_category: vaule[2],
				quaternary_category: vaule[3],
				event_name_string : 'Web_Navigation_Click'
			});
        } catch (error) {
            console.log(error);
        };

	})
	$('.sensorsdata_lv_5').click(function() {
		let vaule = $(this).attr('data-web-data').split('_');
		try {
			sensors.track('Web_Navigation_Click', {
				primary_category: vaule[0],
				secondary_category: vaule[1],
				tertiary_category: vaule[2],
				quaternary_category: vaule[3],
				quinary_category: vaule[4],
				event_name_string : 'Web_Navigation_Click'
			});
        } catch (error) {
            console.log(error);
        };

	})
})


var sdkversion_placeholder="1.26.13";function wrapPluginInitFn(e,t,a){if(t&&(e.plugin_name=t),a&&e.init){var i=e.init;e.init=function(r,n){if(wrapLogFn(r,e,t),r.readyState&&r.readyState.state>=3||!r.on)return s();function s(){i.call(e,r,n)}r.on(a,s)}}return e}function wrapLogFn(e,t,a){function i(t,i){e.logger?e.logger.msg.apply(e.logger,i).module(a+""||"").level(t).log():e.log&&e.log.apply(e,i)}t.log=function(){i("log",arguments)},t.warn=function(){i("warn",arguments)},t.error=function(){i("error",arguments)}}function createPlugin(e,t,a){return wrapPluginInitFn(e,t,a),e.plugin_version=sdkversion_placeholder,e}var page_hidden_status_refresh_time=5e3,MAX_DURATION=432e3;function PageLeave(){this.sd=null,this.start_time=+new Date,this.page_show_status=!0,this.page_hidden_status=!1,this._={},this.timer=null,this.current_page_url=document.referrer,this.url=location.href,this.title=document.title||"",this.option={},this.heartbeat_interval_time=5e3,this.heartbeat_interval_timer=null,this.page_id=null,this.storage_name="sawebjssdkpageleave",this.max_duration=MAX_DURATION}PageLeave.prototype.init=function(e,t){if(e){if(this.sd=e,this._=this.sd._,t){this.option=t;var a=t.heartbeat_interval_time;a&&(this._.isNumber(a)||this._.isNumber(1*a))&&1*a>0&&(this.heartbeat_interval_time=1e3*a);var i=t.max_duration;i&&(this._.isNumber(i)||this._.isNumber(1*i))&&1*i>0&&(this.max_duration=i)}this.page_id=Number(String(this._.getRandom()).slice(2,5)+String(this._.getRandom()).slice(2,4)+String((new Date).getTime()).slice(-4)),this.addEventListener(),!0===document.hidden?this.page_show_status=!1:this.addHeartBeatInterval(),this.log("PageLeave\u521d\u59cb\u5316\u5b8c\u6bd5")}else this.log("\u795e\u7b56JS SDK\u672a\u6210\u529f\u5f15\u5165")},PageLeave.prototype.log=function(e){this.sd&&this.sd.log(e)},PageLeave.prototype.refreshPageEndTimer=function(){var e=this;this.timer&&(clearTimeout(this.timer),this.timer=null),this.timer=setTimeout(function(){e.page_hidden_status=!1},page_hidden_status_refresh_time)},PageLeave.prototype.hiddenStatusHandler=function(){clearTimeout(this.timer),this.timer=null,this.page_hidden_status=!1},PageLeave.prototype.pageStartHandler=function(){this.start_time=+new Date,!0==!document.hidden?this.page_show_status=!0:this.page_show_status=!1,this.url=location.href,this.title=document.title},PageLeave.prototype.pageEndHandler=function(){if(!0!==this.page_hidden_status){var e=this.getPageLeaveProperties();!1===this.page_show_status&&delete e.event_duration,this.page_show_status=!1,this.page_hidden_status=!0,this.isCollectUrl(this.url)&&this.sd.track("$WebPageLeave",e),this.refreshPageEndTimer(),this.delHeartBeatData()}},PageLeave.prototype.addEventListener=function(){this.addPageStartListener(),this.addPageSwitchListener(),this.addSinglePageListener(),this.addPageEndListener()},PageLeave.prototype.addPageStartListener=function(){var e=this;"onpageshow"in window&&this._.addEvent(window,"pageshow",function(){e.pageStartHandler(),e.hiddenStatusHandler()})},PageLeave.prototype.isCollectUrl=function(e){return"function"!=typeof this.option.isCollectUrl||("string"!=typeof e||""===e||this.option.isCollectUrl(e))},PageLeave.prototype.addSinglePageListener=function(){var e=this;this.sd.ee&&this.sd.ee.spa.prepend("switch",function(t){t!==location.href&&(e.url=t,e.pageEndHandler(),e.stopHeartBeatInterval(),e.current_page_url=e.url,e.pageStartHandler(),e.hiddenStatusHandler(),e.addHeartBeatInterval())})},PageLeave.prototype.addPageEndListener=function(){var e=this;this._.each(["pagehide","beforeunload","unload"],function(t){"on"+t in window&&e._.addEvent(window,t,function(){e.pageEndHandler(),e.stopHeartBeatInterval()})})},PageLeave.prototype.addPageSwitchListener=function(){var e=this;this._.listenPageState({visible:function(){e.pageStartHandler(),e.hiddenStatusHandler(),e.addHeartBeatInterval()},hidden:function(){e.url=location.href,e.title=document.title,e.pageEndHandler(),e.stopHeartBeatInterval()}})},PageLeave.prototype.addHeartBeatInterval=function(){this._.localStorage.isSupport()&&this.startHeartBeatInterval()},PageLeave.prototype.startHeartBeatInterval=function(){var e=this;this.heartbeat_interval_timer&&this.stopHeartBeatInterval();var t=!0;this.isCollectUrl(this.url)||(t=!1),this.heartbeat_interval_timer=setInterval(function(){t&&e.saveHeartBeatData()},this.heartbeat_interval_time),t&&this.saveHeartBeatData("is_first_heartbeat"),this.reissueHeartBeatData()},PageLeave.prototype.stopHeartBeatInterval=function(){clearInterval(this.heartbeat_interval_timer),this.heartbeat_interval_timer=null},PageLeave.prototype.saveHeartBeatData=function(e){var t=this.getPageLeaveProperties(),a=new Date;t.$time=a,"is_first_heartbeat"===e&&(t.event_duration=3.14);var i=this.sd.kit.buildData({type:"track",event:"$WebPageLeave",properties:t});i.heartbeat_interval_time=this.heartbeat_interval_time,this.sd.store.saveObjectVal(this.storage_name+"-"+this.page_id,i)},PageLeave.prototype.delHeartBeatData=function(e){this._.localStorage.isSupport()&&this._.localStorage.remove(e||this.storage_name+"-"+this.page_id)},PageLeave.prototype.reissueHeartBeatData=function(){for(var e=window.localStorage.length-1;e>=0;e--){var t=window.localStorage.key(e);if(t&&t!==this.storage_name+"-"+this.page_id&&0===t.indexOf(this.storage_name+"-")){var a=this.sd.store.readObjectVal(t);this._.isObject(a)&&1*new Date-a.time>a.heartbeat_interval_time+5e3&&(delete a.heartbeat_interval_time,a._flush_time=(new Date).getTime(),this.sd.kit.sendData(a),this.delHeartBeatData(t))}}},PageLeave.prototype.getPageLeaveProperties=function(){var e=(+new Date-this.start_time)/1e3;(isNaN(e)||e<0||e>this.max_duration)&&(e=0),e=Number(e.toFixed(3));var t=this._.getReferrer(this.current_page_url),a=document.documentElement&&document.documentElement.scrollTop||window.pageYOffset||document.body&&document.body.scrollTop||0;a=Math.round(a)||0;var i={$title:this.title,$url:this._.getURL(this.url),$url_path:this._.getURLPath(this._.URL(this.url).pathname),$referrer_host:t?this._.getHostname(t):"",$referrer:t,$viewport_position:a};return 0!==e&&(i.event_duration=e),i=this._.extend(i,this.option.custom_props)};var pageLeave=new PageLeave,index=createPlugin(pageLeave,"PageLeave","sdkReady");

sensors.use(index,{
custom_props:{
	prop1:'value1'
},
heartbeat_interval_time: 5,
max_duration: 5 * 24 * 60 * 60,
isCollectUrl: function(url){
	return true;
}
});






sensors.quick('autoTrack');



// ! wwwstartr|2026-03-16 15:55:00 !

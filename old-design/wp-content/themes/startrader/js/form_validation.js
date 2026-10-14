
// function IsName(str) {
// 	var flag = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+=\-{}$\]|;:'",.<>/?`~])[a-zA-Z!@#$%^&*()_+=\-{}\[$|;:'",.<>/?`~]{1,20}$/;
// 	return flag.test(str);
// }
function IsName(str) {
	var flag = new RegExp("[-·_`~!@#$^&*()\-+=<>?=|{}':;',\\[\\].~!<>《》/?~！@#￥……&*（）\"——|{}【】‘；：”“'。，、？]");
	return flag.test(str);
}
function IsPhone(str) {
	var reg = /^[0-9]{6,20}$/;
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
// ! wwwstartr|2025-11-03 11:45:00 !

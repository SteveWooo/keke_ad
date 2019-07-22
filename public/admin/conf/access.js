/**
* 初次加载
*/
keke.config = {
	components : [
		'login',
		'ad'
	],
	menu : [{
		text : "广告管理",
		icon: 'history',
		router : "ad"
	},{
		text : "登陆",
		icon: 'history',
		router : "login"
	}],

	routerName : {
		'ad' : '广告管理',
		'login' : '登陆',
	},

	baseUrl : location.origin + "/keke_ad", //根目录路径+业务
	baseResUrl : location.origin + "/keke_ad/res", //资源根目录路径
	baseOrigin : location.origin, //源站点
}

function accessInit(){
	/**
	* 初始化管理员信息
	*/
	vue.global.adminUser = undefined;
	//TODO：拉管理员信息下来。如果没有，跳转到登陆页面
}

function accessSuccess(){
	$.ajax({
		url : keke.config.baseUrl + "/api/p/mode/get",
		success : function(res){
			keke.init({
				mode : res.mode
			}, function(){
				accessInit();
			});
		},
		error : function(e){
			alert('网络错误！')
		}
	})
}

function access () {
	//DO SOMETHING:
	accessSuccess();
}

access()
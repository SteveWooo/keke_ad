/*
* @param 返回当前服务器环境
*/
module.exports = {
	config : {
		path : '/api/p/mode/get',
		method : 'get',
		middlewares : [],
		model : {
			code : 2000,
			mode : '',
			source : {}
		}
	},
	service : async (req, res, next)=>{
		var swc = req.swc;
		req.response.mode = req.swc.mode;
		req.response.config = { }
		if(swc.config.payjs != undefined){
			req.response.config.payjs = {
				mchid : swc.config.payjs.mchid
			}
		}
		next();
	}
}
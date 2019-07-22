/*
* @param name password
*/
const crypto = require("crypto");
module.exports = {
	config : {
		path : '/api/m/user/login',
		method : 'post',
		middlewares : [],
		model : {
			code : 2000,
			source : {},
			error_message : ''
		}
	},
	service : async (req, res, next)=>{
		var query = req.body;
		var swc = req.swc;

		if(!query.name || !query.password || !query.code) {
			req.response.code = 4005;
			req.response.error_message = "参数错误";
			next();
			return ;
		}
		if(!req.session || !req.session.code || !query.code || req.session.code != query.code.toLowerCase()){
			console.log(req.session.code);
			req.response.code = 4005;
			req.response.error_message = "验证码错误";
			next();
			return ;
		}

		try{
			var condition = {
				name : query.name,
				password : crypto.createHash("md5").update([
					query.password,
					swc.config.server.public_salt].join("&")).digest("hex"),
			}
			var result = await swc.dao.models.admins.findAndCountAll({
				where : condition
			})

			if(result.count == 0){
				req.response = await swc.Error(swc, {
					code : 4003,
					message : '登陆失败'
				})
				next();
				return ;
			}

			var now = +new Date();
			var token = crypto.createHash("md5").update([
				result.rows[0].password,
				now,
				swc.config.server.public_salt
			].join("&")).digest("hex");

			req.responseHeaders["Set-Cookie"] = "adadmin=" + query.name + "|" + token + "|" + now + "; path=/";

			next();
		}catch(e){
			req.response = await swc.Error(swc, {
				code : 4003,
				message : e.message
			})
			next();
			return ;
		}
	}
}
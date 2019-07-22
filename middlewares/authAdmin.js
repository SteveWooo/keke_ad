const crypto = require("crypto");
var get_user_cookie = async (swc, req)=>{
	let temp = req.headers.cookie;
	if(!temp){
		return {};
	}
	temp = temp.replace(/ /g, "").split(";");
	let user_cookie = {};
	for(var i=0;i<temp.length;i++){
		let t = temp[i].split("=");
		user_cookie[t[0]] = t[1];
	}

	return user_cookie;
}

async function auth(req, res, next){
	var query;
	var swc = req.swc;
	if(req.method == "GET"){
		query = req.query
	} else {
		query = req.body;
	}

	var securityToken = (await get_user_cookie(swc, req))['adadmin'];
	if(!securityToken){
		req.response.code = 3002;
		req.response.hash = "login";
		req.response.error_message = "请登陆";
		next();
		return ;
	}
	securityToken = securityToken.split("|");
	if(securityToken.length != 3){
		req.response.code = 3002;
		req.response.hash = "login";
		req.response.error_message = "请登陆";
		next();
		return ;
	}

	var now = securityToken[2];
	var name = securityToken[0];
	var s = securityToken[1];

	//这里应该交给redis去做，把token缓存，验证token就行了
	var dbAdmins = await swc.dao.models.admins.findAndCountAll({
		where : {
			name : name
		}
	})

	if(dbAdmins.count == 0){
		req.response.code = 3002;
		req.response.hash = "login";
		req.response.error_message = "请登陆";
		next();
		return ;
	}

	var s_hash = crypto.createHash("md5").update([
		dbAdmins.rows[0].password,
		now,
		swc.config.server.public_salt
	].join("&")).digest("hex");

	if(s_hash != s){
		req.response.code = 3002;
		req.response.hash = "login";
		req.response.error_message = "请重新登陆";
		next();
		return ;
	}
	
	req.response.source = {
		type : 'admin',
		nick_name : dbAdmins.rows[0].nick_name,
		user_id : dbAdmins.rows[0].user_id
	}
	next();
}

module.exports = auth;
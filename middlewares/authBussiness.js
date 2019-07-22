/**
* @param swc_session，微信前端用户唯一标识
*/

async function auth(req, res, next){
	var query;
	if(req.method == "GET"){
		query = req.query
	} else {
		query = req.body;
	}

	// if(s_hash != s){
	// 	req.response.code = 3002;
	// 	req.response.hash = "login";
	// 	req.response.error_message = "请重新登陆";
	// 	next();
	// 	return ;
	// }

	//验证签名：
	
	
	next();
}

module.exports = auth;
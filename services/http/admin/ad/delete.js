/*
* @param ad_id
*/
const crypto = require("crypto");
module.exports = {
	config : {
		path : '/api/m/ad/delete',
		method : 'post',
		middlewares : ['authAdmin'],
		model : {
			code : 2000,
			error_message : '',
			data : {}
		}
	},
	service : async (req, res, next)=>{
		var query = req.body;
		var swc = req.swc;

		if(!query.ad_id){
			req.response.code = 4005;
			req.response.error_message = "参数错误";
			next();
			return ;
		}

		try{
			var result = await swc.dao.models.ads.destroy({
				where : {
					ad_id : query.ad_id
				}
			})

			req.response.data = result;
			next();
		}catch(e){
			req.response.code = 5000;
			req.response.error_message = e.message;
			next();
			return ;
		}
	}
}
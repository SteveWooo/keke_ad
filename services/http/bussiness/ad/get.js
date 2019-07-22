/*
* @param page item_per_page | order_id
*/
const crypto = require("crypto");
module.exports = {
	config : {
		path : '/api/bussiness/ad/get',
		method : 'get',
		middlewares : ['authBussiness'],
		model : {
			code : 2000,
			error_message : '',
			data : {}
		}
	},
	service : async (req, res, next)=>{
		var query = req.query;
		var swc = req.swc;

		if(!query.type || query.type != 'theme'){
			req.response.code = 4005;
			req.response.error_message = "广告类型错误";
			next();
			return ;
		}

		if(!query.target_id || query.target_id.length != 32){
			req.response.code = 4005;
			req.response.error_message = "目标ID错误";
			next();
			return ;
		}

		//这玩意对业务不做翻页，不要太多
		if(!query.item_per_page){
			query.item_per_page = 50;
		}

		if(!query.page){
			query.page = 1;
		}

		if(parseInt(query.page) != query.page || parseInt(query.item_per_page) != query.item_per_page){
			req.response.status = 4005;
			req.response.error_message = "参数错误:page or item_per_page";
			next();
			return ;
		}
		query.item_per_page = parseInt(query.item_per_page);
		var condition = {
			status : 1,
			target_id : query.target_id,
			type : query.type
		};

		try{
			var result = await swc.dao.models.ads.findAndCountAll({
				where : condition,
				order : [["create_at", "DESC"]],
				limit : query.item_per_page,
				offset : (query.page - 1) * query.item_per_page
			})

			req.response.data = result;
			req.response.code = 2000;
			req.response.error_message = undefined;
			next();
		}catch(e){
			req.response.code = 5000;
			req.response.error_message = e.message;
			next();
			return ;
		}
	}
}
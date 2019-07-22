/*
* @param image name
*/
const crypto = require("crypto");

async function saveImage(swc, options){
	var imageFile = await swc.utils.image.saveImage(swc, {
		filePath : `${__dirname}/../../../public/res/adCover`,
		image : options.image
	});
	return imageFile;
}

module.exports = {
	config : {
		path : '/api/m/ad/add',
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

		if(!query.title || !query.link){
			req.response.code = 4005;
			req.response.error_message = "参数错误";
			next();
			return ;
		}
		if(query.type != 'theme'){
			req.response.code = 4005;
			req.response.error_message = "参数错误";
			next();
			return ;
		}

		var image = await saveImage(swc, {
			image : query.image
		})
		if(!image){
			req.response.code = 4001;
			req.response.error_message = "图片保存失败";
			next();
			return ;
		}

		var now = +new Date();
		var idSource = [
			"ads",
			req.response.source.user_id,
			now,
			swc.config.server.public_salt
		].join("&");
		var ad = {
			ad_id : crypto.createHash('md5').update(idSource).digest('hex'),
			type : query.type,
			title : query.title,
			description : query.description,
			target_id : query.target_id,

			cover_url : '/adCover/' + image.filename,
			link : query.link,
			status : 1,

			create_at : now,
			update_at : now,
			create_by : req.response.source.user_id,
			update_by : req.response.source.user_id
		}

		try{
			var result = await swc.dao.models.ads.create(ad);
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
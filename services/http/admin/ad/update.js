const path = require('path')
/**
* @param query
*/
async function checkParam(swc, options){
	let query = options.query;
	if(!query.ad_id || query.ad_id.length != 32){
		return await swc.Error(swc, {
			code : 4005,
			message : 'id缺失'
		});
	}

	return undefined;
}

/**
* 保存图标
* @param image
*/

async function saveOriginImage(swc, options){
	var imageFile = await swc.utils.image.saveImage(swc, {
		filePath : `${path.resolve()}/public/res/adCover`,
		image : options.image
	});
	return imageFile;
}

/*
* @param 
*/
module.exports = {
	config : {
		path : '/api/m/ad/update',
		method : 'post',
		middlewares : ['authAdmin'],
		model : {
			code : 2000,
			ad : {}
		}
	},
	service : async (req, res, next)=>{
		var query = req.body;
		var swc = req.swc;

		/**
		* 检查参数
		*/
		var checkParamResult = await checkParam(swc, {
			query : query
		})
		if(checkParamResult !== undefined){
			req.response = checkParamResult;
			next();
			return ;
		}

		/**
		* 查找对象位置
		*/
		var ad = await swc.dao.models.ads.findAndCountAll({
			where : {
				ad_id : query.ad_id,
				status : 1
			}
		})

		if(ad.count == 0){
			req.response = await swc.Error(swc, {
				code : 4004,
				message : 'id不存在'
			});
			next();
			return ;
		}

		var updateData = {
			type : query.type,
			target_id : query.target_id,
			title : query.title,
			description : query.description,
			link : query.link
		}

		var imageFile;
		if(query.image){
			/**
			* 保存图片
			*/
			imageFile = await saveOriginImage(swc, {
				image : query.image,
			})
			if(!imageFile){
				req.response = await swc.Error(swc, {
					code : 4005,
					message : '存储图标图片失败'
				});
				next();
				return ;
			}

			updateData.cover_url = '/adCover/' + imageFile.filename;
		}

		var result = await ad.rows[0].update(updateData);
		req.response.data = result;
		next();
	}
}
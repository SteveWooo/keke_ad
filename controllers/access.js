module.exports = async (swc, options)=>{
	swc = await swc.registerMysqlDao(swc, {
		path : `${__dirname}/../dao/mysql`
	})

	swc = await swc.registerMiddleware(swc, {
		middlewareFilePath : `${__dirname}/../middlewares`,
	})

	swc = await swc.registerStatic(swc, {
		items : [{
			path : `/${swc.config.server.bussiness_name}/res`,
			staticFilePath : `${__dirname}/../public/res`
		}, {
			path : `/${swc.config.server.bussiness_name}/admin`,
			staticFilePath : `${__dirname}/../public/admin`
		}, {
			path : `/${swc.config.server.bussiness_name}/sdk`,
			staticFilePath : `${__dirname}/../keke_stage/static/sdk`
		}]
	});

	swc = await swc.registerHttpService(swc, {
		httpServiceFilePath : `${__dirname}/../services/http`
	})
	
	return swc;
}
const path = require('path');
const crypto = require('crypto');
async function main(){
	var swc;
	try{
		swc = await require("../keke_stage/server/models/swc/init")();
		swc = await swc.registerMysqlDao(swc, {
			path : `${__dirname}/../dao/mysql`
		})
		var admin = {
			name : 'admin',
			password : 'admin',
		}

		var source = [
			'admins',
			admin.name,
			admin.password,
			swc.config.server.public_salt
		].join('&');
		var now = +new Date();

		var newAdmin = {
			user_id : crypto.createHash('md5').update(source).digest('hex'),
			nick_name : admin.name,

			name : admin.name,
			password : crypto.createHash('md5').update([
				admin.password,
				swc.config.server.public_salt
			].join('&')).digest('hex'),

			create_at : now,
			update_at : now,
			create_by : 'root',
			update_by : 'root'
		}

		var result = await swc.dao.models.admins.create(newAdmin);

	}catch(e){
		console.log(e);
		process.exit();
	}
}

main();
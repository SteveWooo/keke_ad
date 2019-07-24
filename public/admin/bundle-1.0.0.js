/**
* 初次加载
*/
keke.config = {
	components : [
		'login',
		'ad'
	],
	menu : [{
		text : "广告管理",
		icon: 'history',
		router : "ad"
	},{
		text : "登陆",
		icon: 'history',
		router : "login"
	}],

	routerName : {
		'ad' : '广告管理',
		'login' : '登陆',
	},

	baseUrl : location.origin + "/keke_ad", //根目录路径+业务
	baseResUrl : location.origin + "/keke_ad/res", //资源根目录路径
	baseOrigin : location.origin, //源站点
}

function accessInit(){
	/**
	* 初始化管理员信息
	*/
	vue.global.adminUser = undefined;
	//TODO：拉管理员信息下来。如果没有，跳转到登陆页面
}

function accessSuccess(){
	$.ajax({
		url : keke.config.baseUrl + "/api/p/mode/get",
		success : function(res){
			keke.init({
				mode : res.mode
			}, function(){
				accessInit();
			});
		},
		error : function(e){
			alert('网络错误！')
		}
	})
}

function access () {
	//DO SOMETHING:
	accessSuccess();
}

access()
Vue.component("ad", {
	data : function(){
		return {
			data : vue.global.pages.ad, //数据流载入
			utils : vue.global.common.utils.actions, //工具注入
		}
	},
	methods : {
		getData : function(){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;
			scope.datas.loading = true;
			that.utils.ajax({
				url : keke.config.baseUrl + '/api/m/' + that.data.config.pathName + '/get?page=' + scope.datas.pageNow
					+ '&item_per_page=' + scope.datas.itemPerPage,
				successFunction : function(res){
					scope.datas.loading = false;
					if(res.code != '2000'){
						that.utils.alert({
							message : res.error_message
						})
						return ;
					}

					scope.datas.list = res.data.rows;
					scope.datas.count = res.data.count;
				},
				errorFunction : function(){
					scope.datas.loading = true;
					that.utils.alert({
						message : '网络错误'
					})
				}
			})
		},
		changePage : function(page){
			var scope = vue.global.pages[this.data.config.name];
			scope.datas.pageNow = page;
			this.refresh();
		},
		refresh : function(){
			this.getData();
		},
		init : function(){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;
			that.refresh();
		},

		/**
		* 提交数据到服务端
		*/
		addDataSubmit : function(){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;
			//转换图片为base64
			var onloadCallback = function(fileResult){
				scope.datas.loading = true;
				//提交表单
				var form = scope.panels.add.form;
				//获取封面图(图标)
				if(fileResult){
					form.image = fileResult.result;
				}
				
				that.utils.ajax({
					url : keke.config.baseUrl + '/api/m/' + that.data.config.pathName + '/add',
					headers : {
						'Content-Type' : 'Application/json'
					},
					method : "post",
					data : JSON.stringify(form),
					successFunction : function(res){
						scope.datas.loading = false;
						if(res.code != '2000'){
							that.utils.alert({
								message : res.error_message
							})
							return ;
						}
						that.utils.alert({
							message : '创建成功'
						})
						that.switchAddDataPanel();
						that.refresh();
					},
					errorFunction : function(){
						scope.datas.loading = false;
						that.utils.alert({
							message : '网络错误'
						})
					}
				})
			}

			var coverDom = '#'+that.data.config.name+'AddCover';
			var file;
			var reader;

			//检查输入,todo
			if(false){
				alert('请填写完整信息')
				return ;
			}
			if(!confirm('确定新增内容？')){
				return ;
			}

			if($(coverDom).length > 0){
				file = $(coverDom).get(0).files[0];
				reader = new FileReader();
				reader.onload = function(){
					var base64 = this.result;
					//回调base64
					onloadCallback({
						result : base64
					})
				}
				try{
					reader.readAsDataURL(file);
				}catch(e){
					console.log(e);
					alert('文件读取失败');
				}
			} else {
				onloadCallback()
			}
		},

		//删除
		deleteDataSubmit : function(item){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;
			if(!confirm('确定删除数据？')){
				return ;
			}

			scope.datas.loading = true;
			//提交表单
			var form = {};
			form[that.data.config.idName] = item[that.data.config.idName]; //设置id
			that.utils.ajax({
				url : keke.config.baseUrl + '/api/m/' + that.data.config.pathName + '/delete',
				headers : {
					'Content-Type' : 'Application/json'
				},
				data : JSON.stringify(form),
				method : "post",
				successFunction : function(res){
					scope.datas.loading = false;
					if(res.code != '2000'){
						that.utils.alert({
							message : res.error_message
						})
						return ;
					}
					that.utils.alert({
						message : '删除成功'
					})
					that.refresh();
				},
				errorFunction : function(){
					scope.datas.loading = false;
					that.utils.alert({
						message : '网络错误'
					})
				}
			})
		},

		//提交更新数据操作
		updateDataSubmit : function(){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;

			var onloadCallback = function (fileResult){
				var form = scope.panels.update.form;
				form[that.data.config.idName] = scope.panels.update[that.data.config.idName];
				if(fileResult !== undefined){
					form.image = fileResult.result;
				}

				//获取富媒体内容
				if(scope.panels.update.editor){
					form.content = scope.panels.update.editor.txt.html();
				}

				that.utils.ajax({
					url : keke.config.baseUrl + '/api/m/' + that.data.config.pathName + '/update',
					headers : {
						'Content-Type' : 'Application/json'
					},
					method : "post",
					data : JSON.stringify(form),
					successFunction : function(res){
						scope.datas.loading = false;
						if(res.code != '2000'){
							that.utils.alert({
								message : res.error_message
							})
							return ;
						}
						that.utils.alert({
							message : '修改成功'
						})
						that.switchUpdateDataPanel();
						that.refresh();
					},
					errorFunction : function(){
						scope.datas.loading = false;
						that.utils.alert({
							message : '网络错误'
						})
					}
				})
			}
			if(!confirm('确定更新该分类数据吗？')){
				return ;
			}

			//获取图片，如果没有图片，则上传一个空数据，不更新
			var coverDom = '#' + that.data.config.name + 'UpdateCover';
			//如果有封面图dom的话：
			if($(coverDom).length > 0){
				var file = $(coverDom).get(0).files[0];
				if(file == undefined){
					onloadCallback();
					return ;
				}

				var reader = new FileReader();
				reader.onload = function(){
					onloadCallback({
						result : this.result
					});
				}

				try{
					reader.readAsDataURL(file);
				}catch(e){
					alert('文件读取失败')
				}

			} else {
				onloadCallback();
			}
		},

		//更新分类内容操作
		switchUpdateDataPanel : function(item){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;
			var editorDom = '#'+that.data.config.name+'UpdateContent'; //富媒体编辑器dom
			var coverDom = '#' + that.data.config.name + 'UpdateCover';

			//检查封面图
			if($(coverDom).length != 0){
				$(coverDom).val('');
			}

			//设置正在操作的id
			if(item){
				this.data.panels.update[that.data.config.idName] = item[that.data.config.idName];
			}
			this.data.panels.update.show = !this.data.panels.update.show;
			for(var i in this.data.panels.update.form){
				this.data.panels.update.form[i] = item ? item[i] : '';
			}
			this.data.panels.update.form['type'] = 'theme';
		},

		switchAddDataPanel : function(){
			var scope = vue.global.pages[this.data.config.name];
			var that = this;
			var editorDom = '#'+that.data.config.name+'AddContent'; //富媒体编辑器dom
			var coverDom = '#'+that.data.config.name+'AddCover';

			//检查富媒体dom是否存在
			if($(editorDom).length != 0){
				if(scope.panels.add.editor === undefined){
					scope.panels.add.editor = new window.wangEditor(editorDom);
					scope.panels.add.editor.create();
				}
				scope.panels.add.editor.txt.html('');
			}

			//检查封面图
			if($(coverDom).length != 0){
				$(coverDom).val('');
			}

			this.data.panels.add.show = !this.data.panels.add.show;
			for(var i in this.data.panels.add.form){
				this.data.panels.add.form[i] = '';
			}
			//默认
			this.data.panels.add.form['type'] = 'theme';
		}
	},
	mounted : function(){
		this.init();
	},
	template : 
`
<v-container>
	<v-layout row wrap>
		<v-flex xs5>
		</v-flex>
		<v-flex xs7 class="text-xs-right">
			<v-btn color="white"
			@click="refresh()">
				刷新
			</v-btn>
			<v-btn color="white"
			@click="switchAddDataPanel()">
				创建广告
			</v-btn>
		</v-flex>

		<v-flex xs12>
			<v-data-table
				dark
				hide-actions
				rows-per-page-items="10"
				:headers="data.datas.itemHeader" 
				:items="data.datas.list"
				:total-items="data.datas.count"
				:loading=data.datas.loading>
				<v-progress-linear slot="progress" color="red" indeterminate></v-progress-linear>
				<template slot="items" slot-scope="props">
					<td>
						<v-img 
							@click="switchUpdateDataPanel(props.item)"
							style="width:80px;margin:10px 10px 10px 10px;"
							:src="keke.config.baseResUrl + props.item.cover_url">
						</v-img>
					</td>
					<td>
						{{props.item.title}}
					</td>
					<td>
						{{props.item.description}}
					</td>
					<td>
						{{props.item.target_id}}
					</td>
					<td>
						{{props.item.link}}
					</td>
					
					<td>
						<v-btn
							color="red"
							small
							@click="deleteDataSubmit(props.item)">
							删除
						</v-btn>
					</td>
				</template>
			</v-data-table>
		</v-flex>
		<v-flex xs12>
			<div class="text-xs-right">
				<v-pagination
					v-model="data.datas.pageNow"
					dark
					@input="changePage"
					:total-visible="9"
					:length="Math.ceil(data.datas.count / data.datas.itemPerPage)"
				></v-pagination> 当前：{{data.datas.pageNow}}
			</div>
		</v-flex>

	</v-layout>

	<v-dialog
		data-app="true"
		dark
		hide-overlay="true"
		scrollable=true
		v-model="data.panels.add.show"
		width=1000
		>
		<v-card>
			<v-card-title
			  class="headline blue lighten-1"
			  primary-title
			>
				新增数据
			</v-card-title>

			<v-form
				style="padding:16px 16px 16px 16px">
				<v-text-field
					required
					v-model=data.panels.add.form.title
					label="标题">
				</v-text-field>
				<v-text-field
					required
					v-model=data.panels.add.form.description
					label="描述">
				</v-text-field>
				<v-text-field
					required
					disabled
					v-model=data.panels.add.form.type
					label="展示位置(默认)">
				</v-text-field>
				<v-text-field
					required
					v-model=data.panels.add.form.target_id
					label="位置目标id">
				</v-text-field>
				<v-text-field
					required
					v-model=data.panels.add.form.link
					label="广告链接">
				</v-text-field>

				<label>
					封面图：
				</label>
				<input :id="data.config.name + 'AddCover'" type="file"/>
			</v-form>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn
					@click="switchAddDataPanel">
					取消
				</v-btn>
				<v-btn
					v-if="!data.datas.loading"
					@click="addDataSubmit"
					color="blue">
					确定
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-dialog 
		dark
		scrollable=true
		hide-overlay="true"
		v-model="data.panels.update.show"
		width=1000
		>
		<v-card>
			<v-card-title
			  class="headline blue lighten-1"
			  primary-title
			>
				分类信息
			</v-card-title>

			<v-form
				style="padding:16px 16px 16px 16px">
				<v-text-field
					required
					v-model=data.panels.update.form.title
					label="标题">
				</v-text-field>
				<v-text-field
					required
					v-model=data.panels.update.form.description
					label="描述">
				</v-text-field>
				<v-text-field
					required
					disabled
					v-model=data.panels.update.form.type
					label="展示位置(默认)">
				</v-text-field>
				<v-text-field
					required
					v-model=data.panels.update.form.target_id
					label="位置目标id">
				</v-text-field>
				<v-text-field
					required
					v-model=data.panels.update.form.link
					label="广告链接">
				</v-text-field>
				<label>
					封面图：
				</label>
				<input :id="data.config.name + 'UpdateCover'" type="file"/>
			</v-form>
			<v-divider></v-divider>
			<v-card-actions>
				<v-btn
					@click="switchUpdateDataPanel">
					取消
				</v-btn>
				<v-btn
					v-if="!data.datas.loading"
					@click="updateDataSubmit"
					color="blue">
					确定
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</v-container>
`
})
keke.models.ad = {
	config : {
		name : "ad",
		pathName : "ad",
		idName : "ad_id",
	},
	datas : {
		pageNow : 1, //当前页面
		itemPerPage : 10, //每页加载的数量
		loading : false, //加载状态栏
		list : [], //数据列表
		count : 0, //总数
		//列表头名字
		itemHeader : [{
			text : "封面图",
			sortable : false
		},{
			text : "标题",
			sortable: false,
		},{
			text : "描述",
			sortable: false,
		},{
			text : "目标id",
			sortable: false,
		},{
			text : "广告链接",
			sortable : false
		}, {
			text : "操作",
			sortable : false
		}]
	},
	panels : {
		add : {
			show : false,
			editor : undefined,
			form : {
				title : '',
				description : '',
				image : undefined,
				type : 'theme',
				target_id : undefined,
				link : undefined,
			}
		},
		update : {
			show : false,
			editor : undefined,
			selfServiceId : '',
			form : {
				title : '',
				description : '',
				image : undefined,
				type : 'theme',
				target_id : undefined,
				link : undefined,
			}
		}
	}
}
Vue.component("login", {
	data : function(){
		return {
			data : vue.global.pages.login,
			utils : vue.global.common.utils.actions, //工具注入
		}
	},
	methods : {
		init : function(){
			var scope = vue.global.pages.login;
			scope.form_data.name = "";
			scope.form_data.password = "";
			scope.form_data.code = "";
			scope.code.randomNumber = Math.random();
			scope.code.url = keke.config.baseUrl + '/api/m/user/get_code?random='
		},

		submitLogin : function(){
			var scope = vue.global.pages.login;
			var that = this;
			that.utils.ajax({
				url : keke.config.baseUrl + "/api/m/user/login",
				type : "post",
				headers : {
					'Content-Type' : "application/json"
				},
				xhrFields: {withCredentials: true},
				data : JSON.stringify(scope.form_data),
				successFunction : function(res){
					if(res.code != "2000"){
						that.utils.alert({
							message : res.error_message
						})
						return ;
					}
					// console.log(res);
					that.utils.alert({
						message : '登陆成功'
					})
					location.hash = 'ad';
					// location.reload();
				}
			})
		},

		getCode : function(){
			var scope = vue.global.pages.login;
			scope.code.randomNumber = Math.random();
		}
	},
	mounted : function(){
		this.init();
	},
	template : 
`
<v-container>
	<v-layout row wrap>
		<v-flex xs12>
			<v-text-field
				v-model="data.form_data.name"
				label="账号"
				required
			></v-text-field>
		</v-flex>
		<v-flex xs12>
			<v-text-field
				v-model="data.form_data.password"
				label="密码"
				required
				type="password"
			></v-text-field>
		</v-flex>
		<v-flex xs8>
			<v-text-field
				v-model="data.form_data.code"
				label="验证码"
				required
			></v-text-field>
		</v-flex>
		<v-flex xs2>
			<v-img
				style="width:100%"
				@click="getCode"
				v-if="data.code.url!=''"
				:src="data.code.url + data.code.randomNumber">
		</v-flex>
		<v-flex xs2>
		</v-flex>
		<v-flex xs12 class="text-xs-center">
			<v-btn 
				color="blue primary"
				@click="submitLogin">
				登陆
			</v-btn>
		</v-flex>
	</v-layout>
</v-container>
`

})
keke.models.login = {
	form_data : {
		name : "",
		password : "",
		code : ''
	},
	code : {
		randomNumber : 0,
		url : ''
	}
}
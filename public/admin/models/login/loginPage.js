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
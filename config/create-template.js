const { Command } = require('commander');
const program = new Command();

// program
// 	.command('template')
// 	.argument('<script>')
// 	.option('-p, --path')
// 	.action(function () {
// 		console.error('参数：', this.args[0], this.opts().path);
// 	});
program
	.command('template')
	.argument('<script>')
	.option('-p, --port <number>', '描述', 80)
	.option('-c, --color <string>', '颜色', "red")
	.action(function () {
		const option = this.opts();
		console.error('参数port：', option.port);
		console.error('参数color', option.color);
		console.error('参数this.args[0]：', this.args[0]);
	});
console.log("测试");
program.parse();
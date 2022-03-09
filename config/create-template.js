const { Command } = require('commander');
const program = new Command();
const fse = require('fs-extra');
const path = require("path");
const fs = require('fs');
const { templateFile, outputPath } = require("./config");

// program
// 	.command('template')
// 	.argument('<script>')
// 	.option('-p, --path')
// 	.action(function () {
// 		console.error('参数：', this.args[0], this.opts().path);
// 	});
/*
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
*/
program
	.command('template')
	.argument('<script>')
	.option('-o, --other <string>', '分包的文件目录名称')
	.action(function () {
		const options = this.opts();
		const appJsonPath = "./" + outputPath + "/app.json";
		changeAppJson(appJsonPath, this.args[0], options.other);

		// console.error('参数this.args[0]：', this.args[0]);
	});

const createTemplate = function (path) {
	createFile(path, "index.wxml", replaceClassNameFromPath(path, templateFile.wxmlTemplate));
	createFile(path, "index.js", replaceClassNameFromPath(path, templateFile.jsTemplate));
	createFile(path, "index.scss", replaceClassNameFromPath(path, templateFile.wxssTemplate));
	createFile(path, "index.json", replaceClassNameFromPath(path, templateFile.jsonTemplate));
};
/**
 * 生成文件
 */
const createFile = function (dir, fileName, content) {
	fse.ensureDir(dir, (err) => {
		if (err) {
			console.log('文件夹不存在');
			console.error(err);
		}
	});
	console.log(dir + "/" + fileName);
	fse.writeFile(dir + "/" + fileName, content, (err) => {
		if (err) {
			console.error(err);
		}
	})

}
/**
 * 
 * @param {路径} path 
 * @param {被替换的文本内容} content 
 * @returns 
 */
const replaceClassNameFromPath = function (path, content) {
	const paths = path.split("/");
	const len = paths.length;
	const className = `v-${paths[len - 2]}-${paths[len - 1]}`;

	return content.replace("$1", className);
}
/**
 * 
 * @param {app.json文件路径} appJsonPath 
 * @param {新建的模板文件路径} path 
 * @param {是否为分包内部的} other 
 */
const changeAppJson = function (appJsonPath, path, other) {
	fs.readFile(appJsonPath, (err, data) => {
		if (err) {
			console.error(error);
		} else {
			const json = JSON.parse(data.toString());
			let filePath = "";
			// 我们需要知道other这个分包的文件夹之前是否已经存在，
			// 所以我们需要先判断subpackages中，是否存在这个分包文件夹 
			if (other) {
				const subpackages = json.subpackages ? json.subpackages : [];
				let subpackage = subpackages.find(ele => ele.root == other);

				filePath = "./" + outputPath + "/" + other + "/" + path;

				// subpackage如果存在
				if (subpackage) {
					// 需要判断该path是否存在,如果存在那么停止程序
					if (subpackage.pages.some(ele => ele == path)) {
						console.log('%c 该目录已存在', "color:red;font-size: 24px;");
						return;
					}

					subpackage.pages.push(path);
				} else { // 如果不存在,则需要创建
					// 需要注意的是,mkdirSync无法一次性创建多层文件目录
					// 所以我们把网上的抄来

					makeDir(filePath);

					subpackage = {
						root: other,
						pages: [path]
					};
					subpackages.push(subpackage);
				}
				json.subpackages = subpackages;
			} else {
				filePath = "./" + outputPath + "/" + path;

				json.pages.push(path);
			}
			// 生成文件
			createTemplate(filePath);

			// 再写入文件app.json
			fs.writeFile(appJsonPath, JSON.stringify(json, "", "\t"), err => {
				if (err) {
					console.error(err);
				}
			})

		}

	})
};
const makeDir = function (dirpath) {
	if (!fs.existsSync(dirpath)) {
		var pathtmp;
		dirpath.split("/").forEach(function (dirname) {
			if (pathtmp) {
				pathtmp = path.join(pathtmp, dirname);
			}
			else {　　　　　　　　　 //如果在linux系统中，第一个dirname的值为空，所以赋值为"/"
				if (dirname) {
					pathtmp = dirname;
				} else {
					pathtmp = "/";
				}
			}
			if (!fs.existsSync(pathtmp)) {
				if (!fs.mkdirSync(pathtmp)) {
					return false;
				}
			}
		});
	} else {
		deleteFolder(dirpath);
	}
	return true;
}
// 递归删除文件夹
const deleteFolder = function (path) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function (file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse
				deleteFolder(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}
program.parse(); // 这一行要放在最后面，不然上面的那些函数会读不到

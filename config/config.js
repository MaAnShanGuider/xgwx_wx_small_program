const jsTemplate = require("./templates/js-template");
const wxmlTemplate = require("./templates/wxml-template");
const wxssTemplate = require("./templates/wxss-template");
const jsonTemplate = require("./templates/json-template");

module.exports = {
	cssFilterFiles: ['scss/var.scss'],
	outputPath: "weixin", // 根级目录
	templateFile: {
		jsTemplate,
		wxmlTemplate,
		wxssTemplate,
		jsonTemplate,
	}
};
const jsTemplate = require("./templates/js-template");
const wxmlTemplate = require("./templates/wxml-template");
const wxssTemplate = require("./templates/wxss-template");

module.exports = {
	cssFilterFiles: ['scss/var.scss'],
	templateFile: {
		jsTemplate,
		wxmlTemplate,
		wxssTemplate,
	}
};
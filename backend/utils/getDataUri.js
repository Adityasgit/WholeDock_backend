const DataUriParser = require("datauri/parser");
const path = require("path");

const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.name).toString();

  return parser.format(extName, file.data);
};
module.exports = { getDataUri };

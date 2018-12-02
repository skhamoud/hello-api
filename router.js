module.exports = {
  hello(data, callback) {
		callback(200, { message:'Hello World!' });
	},
	notFound(data, callback) {
		callback(404, { message: 'Not Found' });
	}
}
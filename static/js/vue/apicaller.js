
const handleError = (error, that) => {
	console.error(error);
	that.loadingMeta = false
	if (error.bodyText !== '') {
		that.$store.commit('msgText', `${error.statusText}: ${error.bodyText}`)
	} else {
		that.$store.commit('msgText', 'Error: empty response')
	}
}


export default {
	
}
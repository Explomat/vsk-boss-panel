function toJSON(data){
	return tools.object_to_text(data, 'json');
}

function log(message){
	EnableLog('boss-panel');
	LogEvent('boss-panel', message);
}

function setMessage(type, message){
	return {
		type: type,
		message: message
	}
}

function setSuccess(data, message){
	var m = setMessage('success', message);
	m.data = data;
	return toJSON(m);
}

function setError(message){
	log(message);
	return toJSON(setMessage('error', message));
}

function notificate(templateCode, primaryId, text, secondaryId){
	tools.create_notification(templateCode, primaryId, text, secondaryId);
}
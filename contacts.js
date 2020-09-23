const fs = require('fs');
const { promises: fsPromises } = fs;
const path = require('path');
const contactsPath = path.join(__dirname + '/db/contacts.json');

console.log(contactsPath);

// TODO: задокументировать каждую функцию
function listContacts() {
	fsPromises.readFile(contactsPath, 'utf-8').then((data) => console.log(JSON.parse(data)));
}

function getContactById(contactId) {
	fsPromises.readFile(contactsPath, 'utf-8').then((data) => {
		const objData = JSON.parse(data);
		objData.filter((item) => {
			if (item.id === contactId) {
				return console.log(item);
			}
		});
	});
}

function removeContact(contactId) {
	fsPromises
		.readFile(contactsPath, 'utf-8')
		.then((data) => {
			const objData = JSON.parse(data);
			const res = objData.filter((item) => item.id !== contactId);
			const strData = JSON.stringify(res);
			return strData;
		})
		.then((strData) => fsPromises.writeFile(contactsPath, strData)).then(() => listContacts())
}

function addContact(name, email, phone) {
	const addID = function(arr) {
		const item = arr[arr.length - 1];
		const id = item.id + 1;
		return id;
	};
	fsPromises
		.readFile(contactsPath, 'utf-8')
		.then((data) => {
			const objData = JSON.parse(data);
			const addObj = { id: addID(objData), name, email, phone };
			objData.push(addObj);
			const strData = JSON.stringify(objData);
			return strData;
		})
		.then((strData) => fsPromises.writeFile(contactsPath, strData)).then(() => listContacts())
}

module.exports = {
	listContacts,
	getContactById,
	removeContact,
	addContact
};

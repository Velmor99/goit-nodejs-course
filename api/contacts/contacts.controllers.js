const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const { promises: fsPromises } = fs;
const contactsPath = path.join(__dirname, '../db/contacts.json');

class ContactsController {
	get getContactById() {
		return this._getContactById.bind(this);
	}

	get deleteContact() {
		return this._deleteContact.bind(this);
	}

	get updateContact() {
		return this._updateContact.bind(this);
    }
    
    get addContact() {
        return this._addContact.bind(this)
    }

	listContacts(req, res, next) {
		fsPromises.readFile(contactsPath, 'utf-8').then((data) => res.status(200).send(JSON.parse(data)));
	}

	async _getContactById(req, res, next) {
		try {
            const objData = await this.getData();
			const targetContactIndex = await this.findId(res, req.params.contactId, objData);
			if (targetContactIndex === undefined) {
				return;
			}
			const responseItem = await objData[targetContactIndex];
			return res.status(200).send(JSON.stringify(responseItem));
		} catch (err) {
			next(err);
		}
	}

	async _deleteContact(req, res, next) {
		try {
			const objData = await this.getData();
			const targetContactIndex = await this.findId(res, req.params.contactId, objData);
			if (targetContactIndex === undefined) {
				return;
			}
			const filteredData = objData.filter((_, idx) => idx !== targetContactIndex);
			const result = await fsPromises.writeFile(contactsPath, JSON.stringify(filteredData));
			return res.status(200).send({ message: 'contact deleted' });
		} catch (err) {
			next(err);
		}
	}

	async _updateContact(req, res, next) {
		try {
			const objData = await this.getData();
			const targetContactIndex = await this.findId(res, req.params.contactId, objData);
			if (targetContactIndex === undefined) {
				return;
			}
			objData[targetContactIndex] = {
				...objData[targetContactIndex],
				...req.body
			};
			const result = await fsPromises.writeFile(contactsPath, JSON.stringify(objData));
			return res.status(200).send(objData[targetContactIndex]);
		} catch (err) {
			next(err);
		}
	}

	async _addContact(req, res, next) {
		const addID = function(arr) {
			const item = arr[arr.length - 1];
			const id = item.id + 1;
			return id;
		};
		try {
			const objData = await this.getData();
			const newContact = {
				...req.body,
				id: addID(objData)
			};
			objData.push(newContact);
			const updateStr = await JSON.stringify(objData);
			const result = await fsPromises.writeFile(contactsPath, updateStr);
			return res.status(200).send(newContact);
		} catch (err) {
			next(err);
		}
	}

	validateAddContact(req, res, next) {
		const addContactRules = Joi.object({
			name: Joi.string().required(),
			email: Joi.string().required(),
			phone: Joi.string().required()
		});

		const result = addContactRules.validate(req.body);
		if (result.error) {
			res.status(400).send(`{message: ${result.error.message}}`);
		}
		next();
	}

	validateUpdateContact(req, res, next) {
		const updateContactRules = Joi.object({
			name: Joi.string(),
			email: Joi.string(),
			phone: Joi.string()
		});

		const result = updateContactRules.validate(req.body);
		if (result.error) {
			res.status(400).send(`{message: ${result.error.message}}`);
		}
		next();
	}

	async getData(next) {
        try {
            const data = await fsPromises.readFile(contactsPath, 'utf-8');
            const objData = JSON.parse(data);
            return objData;
        } catch (err) {
            next(err)
        }
		
	}

	findId(res, contactId, arr) {
		const currentRequestId = parseInt(contactId);
		const targetContactIndex = arr.findIndex((contact) => contact.id === currentRequestId);
		if (targetContactIndex === -1) {
			throw new ValidationError('User not found');
		}
		return targetContactIndex;
	}
}

class ValidationError extends Error {
	constructor(message) {
		super(message);

		this.status = 404;
		delete this.stack;
	}
}

module.exports = new ContactsController();

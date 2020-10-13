const Joi = require('joi');
const contactModel = require('./contacts.model');

class ContactsController {
	async listContacts(req, res, next) {
		try {
			const contacts = await contactModel.find();
			return res.status(200).json(contacts)
		}catch(err) {
			next(err)
		}
	}

	async getContactById(req, res, next) {
		try {
			const contactId = req.params.contactId;
			const contact = await contactModel.findOne({_id: contactId});
			if(!contact) {
				return res.sendStatus(400)
			}
			return res.status(200).json(contact)
		} catch (err) {
			next(err);
		}
	}

	async deleteContact(req, res, next) {
		try {
			const contactId = req.params.contactId;
			const deleteContact = await contactModel.findByIdAndDelete(contactId);
			if(!contactId) {
				return res.sendStatus(404)
			}
			return res.sendStatus(204)
		} catch (err) {
			next(err);
		}
	}

	async updateContact(req, res, next) {
		try {
			const contactId = req.params.contactId;
			const updateResult = await contactModel.findByIdAndUpdate(contactId, req.body);
			if(!updateResult) {
				return res.sendStatus(404)
			}
			return res.status(204).json(updateResult)
		} catch (err) {
			next(err);
		}
	}

	async addContact(req, res, next) {
		try {
			const contact = await contactModel.create(req.body);
			return res.status(201).json(contact)
		} catch (err) {
			next(err);
		}
	}

	validateAddContact(req, res, next) {
		const addContactRules = Joi.object({
			name: Joi.string().required(),
			email: Joi.string().required(),
			phone: Joi.string().required(),
			subscription: Joi.string().required(),
			password: Joi.string().required(),
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
			phone: Joi.string(),
			subscription: Joi.string(),
			password: Joi.string(),
			token: Joi.string()
		});

		const result = updateContactRules.validate(req.body);
		if (result.error) {
			res.status(400).send(`{message: ${result.error.message}}`);
		}
		next();
	}
}

module.exports = new ContactsController();

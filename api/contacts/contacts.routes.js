const {Router} = require('express');
const contactsController = require('./contacts.controllers');

const useRouter = Router();

//@ GET /api/contacts
useRouter.get('/', contactsController.listContacts);

//@ GET /api/contacts/:contactId
useRouter.get('/:contactId', contactsController.getContactById);

//@ POST /api/contacts
useRouter.post('/', contactsController.validateAddContact, contactsController.addContact)

//@ DELETE /api/contacts/:contactId
useRouter.delete('/:contactId', contactsController.deleteContact);

//@ PATCH /api/contacts/:contactId
useRouter.patch('/:contactId', contactsController.validateUpdateContact, contactsController.updateContact)


module.exports = useRouter
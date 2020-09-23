const root =  require('./contacts.js')
const argv = require('yargs').argv;

// TODO: рефакторить
function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      root.listContacts()
      break;

    case 'get':
      root.getContactById(id)
      break;

    case 'add':
      root.addContact(name, email, phone)
      break;

    case 'remove':
      root.removeContact(id)
      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
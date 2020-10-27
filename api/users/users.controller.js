const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./user.model');

class UserController {
    async register(req, res, next) {
        try{
            const {email, password} = req.body;
            const user = await userModel.findOne({email});
            if(user) {
                return res.status(409).send({message: 'User is already exist'})
            }
            const hashPassword = await bcrypt.hash(password, 5);
            await userModel.create({
                email,
                password: hashPassword,
            });

            return res.send({user: {
                email,
            }})
        }catch(err) {
            next(err)
        }
    }

    async login(req, res, next) {
        try{
            const {email, password} = req.body;
            const user = await userModel.find({email});
            if(!user) {
                return res.status(404).send({message: 'User was not found'});
            }
            const isPasswordValid = await bcrypt.compare(password, user[0].password);
            console.log(isPasswordValid)
            if(!isPasswordValid) {
                return res.send({message: 'Authentefication failed.'})
            }

            const token = await jwt.sign({id: user[0].id}, process.env.TOKEN_SECRET, {expiresIn: '12h'});
            const updateUser = await userModel.findByIdAndUpdate(user[0].id, {
                token
            }, {new: true});
            return res.send(UserController.validateUserResponce([updateUser]));
        }catch(err) {
            next(err)
        }
    }

    async authorize(req, res, next) {
        try{
            const authorizationHeader = req.get('Authorization') || '';

            let token;

            if(authorizationHeader) {
                token = authorizationHeader.split(' ')[1];
            }
            console.log(token)
            let userId
            try{
                userId = await jwt.verify(token, process.env.TOKEN_SECRET).id;
                console.log(userId)
            }catch(err) {
                console.log(err)
            }
            const user = await userModel.findById(userId);

            if(!user || user.token != token) {
                return res.status(401).send({message: 'Authorization failed'})
            }
            console.log(user)
            req.user = UserController.validateUserResponce([user])
            next();
        }catch(err) {
            next(err)
        }
    }

    async getAllUsers(req, res, next) {
        try{
            const email = req.query.email;
            console.log(req.user)
            const users = await userModel.find(email ? {email} : {}).select('-token')
            return res.send(UserController.validateUserResponce(users))
        }catch(err) {
            next(err)
        }
    }

    async logout(req, res, next) {
        try{
            await userModel.findByIdAndUpdate(req.user[0].id, {
                token: null
            }, {new: true});

            return res.send({message: 'success'});
        }catch(err) {
            next(err);
        }
    }

    async getCurrentUser(req, res, next) {
        try{
            const user = req.user;
            console.log(user);

            return res.send(user[0])
        }catch(err) {
            next(err)
        }
    }

    static validateUserResponce(users) {
        return users.map((user) => {
            return {
                id: user._id,
                email: user.email,
                token: user.token
            }
        });
    }

    validateCreateUser(req, res, next) {
        const rulesSchema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        })

        UserController.checkValidationError(rulesSchema, req, res, next);
    }

    validateUserLogin(req, res, next) {
        const rulesSchema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        });

        UserController.checkValidationError(rulesSchema, req, res, next)
    }

    static checkValidationError(schema, req, res, next) {
        const {error} = schema.validate(req.body)
        if(error) {
            return res.status(400).send({message: error.details[0].message})
        }
        next()
    }
}

module.exports = new UserController
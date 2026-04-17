const Joi = require("joi")


// register validation
const validRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required().messages({
            "string.name": "name atleast have 3 character",
            "any.required": "Name is required"
        }),
        email: Joi.string()
            .email()        // Validates email format
            .lowercase()    // Converts to lowercase
            .trim()         // Removes whitespace
            .required()     // Ensures the field isn't empty
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is a required field'
            }),

        password: Joi.string().min(8).required()
    });

    return schema.validate(data)
}

// login validation
const validLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()        // Validates email format
            .lowercase()    // Converts to lowercase
            .trim()         // Removes whitespace
            .required()     // Ensures the field isn't empty
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is a required field'
            }),

        password: Joi.string().min(8).required()
    });

    return schema.validate(data)
}

module.exports = {
    validRegister,
    validLogin
}
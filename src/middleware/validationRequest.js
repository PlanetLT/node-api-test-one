import { sendError } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      const errors = [];
      const fieldErrorMap = {};

      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.length) {
          for (const msg of messages) {
            fieldErrorMap[field] = msg;
          }
        }
      }

      if (formErrors?.length) {
        for (const msg of formErrors) {
          errors.push({ form: msg });
        }
      }

      if (Object.keys(fieldErrorMap).length > 0) {
        errors.push(fieldErrorMap);
      }

      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "validation_error",
        errors,
      });
    }

    next();
  };
};

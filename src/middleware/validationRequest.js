import { sendError } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const { fieldErrors, formErrors } = result.error.flatten();
      const errors = [];

      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.length) {
          errors.push(...messages.map((msg) => `${field}: ${msg}`));
        }
      }

      if (formErrors?.length) {
        errors.push(...formErrors.map((msg) => `form: ${msg}`));
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

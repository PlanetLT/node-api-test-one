import { sendError } from "../utils/apiResponse.js";

const routeMethodMap = [
    { path: "/movies", methods: ["GET", "POST", "PUT", "DELETE"] },
    { path: "/auth/register", methods: ["POST"] },
    { path: "/auth/login", methods: ["POST"] },
    { path: "/auth/refresh", methods: ["POST"] },
    { path: "/auth/logout", methods: ["POST"] },
    { path: "/watchlist", methods: ["GET", "POST"] },
    { path: "/watchlist/:id", methods: ["PUT", "DELETE"] },
    { path: "/upload/image", methods: ["POST"] },
];

const normalizePath = (value) => {
    if (!value) {
        return "/";
    }
    if (value.length > 1 && value.endsWith("/")) {
        return value.slice(0, -1);
    }
    return value;
};

const routePatternToRegex = (pattern) => {
    const normalized = normalizePath(pattern);
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const withParams = escaped.replace(/\\:([A-Za-z0-9_]+)/g, "[^/]+");
    return new RegExp(`^${withParams}$`);
};

const preparedRouteMap = routeMethodMap.map((entry) => ({
    ...entry,
    regex: routePatternToRegex(entry.path),
    methods: entry.methods.map((method) => method.toUpperCase()),
}));

const methodNotAllowedMiddleware = (req, res, next) => {
    const requestPath = normalizePath(req.path);
    const requestMethod = req.method.toUpperCase();

    const matchedRoutes = preparedRouteMap.filter((route) => route.regex.test(requestPath));
    if (matchedRoutes.length === 0) {
        return next();
    }

    const allowedMethods = [...new Set(matchedRoutes.flatMap((route) => route.methods))];
    if (allowedMethods.includes(requestMethod)) {
        return next();
    }

    res.set("Allow", allowedMethods.join(", "));
    return sendError(res, {
        statusCode: 405,
        message: `Method ${requestMethod} not allowed for ${requestPath}`,
        errors: { allowedMethods },
    });
};

const notFoundMiddleware = (req, res) =>
    sendError(res, {
        statusCode: 404,
        message: `Route ${req.method.toUpperCase()} ${normalizePath(req.path)} not found`,
    });

export { methodNotAllowedMiddleware, notFoundMiddleware };

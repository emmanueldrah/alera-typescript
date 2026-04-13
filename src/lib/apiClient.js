"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTokens = exports.setTokens = exports.getRefreshToken = exports.getAccessToken = exports.setGlobalLogoutCallback = exports.apiClient = void 0;
var axios_1 = require("axios");
var resolveApiBaseUrl = function () {
    var _a, _b;
    if (import.meta.env.PROD) {
        return '/api';
    }
    var configuredUrl = ((_a = import.meta.env.VITE_API_URL) === null || _a === void 0 ? void 0 : _a.trim())
        || ((_b = import.meta.env.VITE_API_BASE_URL) === null || _b === void 0 ? void 0 : _b.trim());
    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, '');
    }
    return '/api';
};
var API_BASE_URL = resolveApiBaseUrl();
var getCsrfTokenFromCookie = function () {
    if (typeof document === 'undefined')
        return null;
    var cookie = document.cookie
        .split('; ')
        .find(function (entry) { return entry.startsWith('csrf_token='); });
    if (!cookie)
        return null;
    return decodeURIComponent(cookie.split('=').slice(1).join('='));
};
// Create axios instance
exports.apiClient = axios_1.default.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Token management - Now using httpOnly cookies instead of localStorage
var getAccessToken = function () {
    // Tokens are now stored in httpOnly cookies, not accessible to JavaScript
    // The browser will automatically send them with requests
    return null;
};
exports.getAccessToken = getAccessToken;
var getRefreshToken = function () {
    // Refresh token is also in httpOnly cookie
    return null;
};
exports.getRefreshToken = getRefreshToken;
var setTokens = function (accessToken, refreshToken) {
    // Tokens are now set by the backend as httpOnly cookies
    // No longer storing in localStorage for security
};
exports.setTokens = setTokens;
var clearTokens = function () {
    // Tokens are cleared by the backend when logging out
    // No longer clearing localStorage
};
exports.clearTokens = clearTokens;
// Request interceptor - Cookies are sent automatically, no need to add Authorization header
exports.apiClient.interceptors.request.use(function (config) {
    var _a;
    // Ensure cookies are included in every request for auth flows
    config.withCredentials = true;
    var method = (_a = config.method) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        var csrfToken = getCsrfTokenFromCookie();
        if (csrfToken) {
            config.headers.set('X-CSRF-Token', csrfToken);
        }
    }
    return config;
}, function (error) { return Promise.reject(error); });
// Response interceptor - Handle token refresh with cookies
var isRefreshing = false;
var failedQueue = [];
var processQueue = function (error, config) {
    if (config === void 0) { config = null; }
    failedQueue.forEach(function (prom) {
        if (error) {
            prom.reject(error);
        }
        else if (config) {
            prom.resolve(config);
        }
    });
    failedQueue = [];
};
exports.apiClient.interceptors.response.use(function (response) { return response; }, function (error) { return __awaiter(void 0, void 0, void 0, function () {
    var originalRequest, requestUrl, isLoginOrRegisterRequest, isRefreshRequest, isLogoutRequest, refreshError_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                originalRequest = error.config;
                if (!originalRequest) {
                    return [2 /*return*/, Promise.reject(error)];
                }
                requestUrl = originalRequest.url || '';
                isLoginOrRegisterRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
                isRefreshRequest = requestUrl.includes('/auth/refresh');
                isLogoutRequest = requestUrl.includes('/auth/logout');
                if (!(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 && !originalRequest._retry && !isLoginOrRegisterRequest && !isRefreshRequest && !isLogoutRequest)) return [3 /*break*/, 5];
                if (isRefreshing) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            failedQueue.push({ resolve: resolve, reject: reject });
                        })
                            .then(function () {
                            return (0, exports.apiClient)(originalRequest);
                        })
                            .catch(function (err) { return Promise.reject(err); })];
                }
                originalRequest._retry = true;
                isRefreshing = true;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, 4, 5]);
                // Call refresh endpoint - it will set new cookies
                return [4 /*yield*/, axios_1.default.post("".concat(API_BASE_URL, "/auth/refresh"), {}, {
                        withCredentials: true, // Ensure cookies are sent
                    })];
            case 2:
                // Call refresh endpoint - it will set new cookies
                _c.sent();
                processQueue(null, originalRequest);
                return [2 /*return*/, (0, exports.apiClient)(originalRequest)];
            case 3:
                refreshError_1 = _c.sent();
                clearTokens();
                // Call global logout callback to update AuthContext state
                globalLogoutCallback();
                processQueue(refreshError_1, null);
                return [2 /*return*/, Promise.reject(refreshError_1)];
            case 4:
                isRefreshing = false;
                return [7 /*endfinally*/];
            case 5:
                if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 401 && (isLoginOrRegisterRequest || isRefreshRequest || isLogoutRequest)) {
                    return [2 /*return*/, Promise.reject(error)];
                }
                return [2 /*return*/, Promise.reject(error)];
        }
    });
}); });
// Global logout callback - set by AuthContext
var globalLogoutCallback = function () { };
var setGlobalLogoutCallback = function (callback) {
    globalLogoutCallback = callback;
};
exports.setGlobalLogoutCallback = setGlobalLogoutCallback;

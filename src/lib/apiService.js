"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.medicalRecordsApi = exports.patientPermissionsApi = exports.organizationsApi = exports.recordsApi = exports.referralsApi = exports.imagingApi = exports.labTestsApi = exports.adminApi = exports.messagingApi = exports.videoCallsApi = exports.notificationsApi = exports.medicalHistoryApi = exports.allergiesApi = exports.prescriptionsApi = exports.liveLocationApi = exports.ambulanceApi = exports.appointmentsApi = exports.usersApi = exports.authApi = void 0;
var apiClient_1 = require("./apiClient");
// ============================================================================
// AUTH ENDPOINTS
// ============================================================================
exports.authApi = {
    register: function (userData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/register', userData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    login: function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/login', { email: email, password: password })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getCurrentUser: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/users/me')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateProfile: function (userData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put('/users/me', userData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    refreshToken: function (refreshToken) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/refresh', { refresh_token: refreshToken })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    changePassword: function (currentPassword, newPassword) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/change-password', {
                        old_password: currentPassword,
                        new_password: newPassword,
                        confirm_password: newPassword,
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    logout: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/logout')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteAccount: function (password) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/delete-account', { password: password })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    requestPasswordReset: function (email) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/request-password-reset', { email: email })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    resetPassword: function (token, newPassword, confirmPassword) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/reset-password', {
                        token: token,
                        new_password: newPassword,
                        confirm_password: confirmPassword,
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    verifyEmail: function (token) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/verify-email', { token: token })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    resendVerificationEmail: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/auth/resend-verification')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// USER ENDPOINTS
// ============================================================================
exports.usersApi = {
    getCurrentUser: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/users/me')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getDoctors: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/users/doctors')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateProfile: function (userData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put('/users/me', userData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getUserById: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/users/".concat(userId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listAllUsers: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/users/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getAccessibleUsers: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/users/accessible')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// APPOINTMENT ENDPOINTS
// ============================================================================
exports.appointmentsApi = {
    /** Matches FastAPI `AppointmentCreate` (patient is always the authenticated user). */
    createAppointment: function (appointmentData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/appointments/', appointmentData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listAppointments: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/appointments/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getAppointment: function (appointmentId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/appointments/".concat(appointmentId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateAppointment: function (appointmentId, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/appointments/".concat(appointmentId), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteAppointment: function (appointmentId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/appointments/".concat(appointmentId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// AMBULANCE ENDPOINTS
// ============================================================================
exports.ambulanceApi = {
    createRequest: function (requestData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/ambulance/', requestData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listRequests: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/ambulance/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getRequest: function (requestId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/ambulance/".concat(requestId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateRequest: function (requestId, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/ambulance/".concat(requestId), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
exports.liveLocationApi = {
    updateMine: function (payload) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/live-locations/me', payload)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getMine: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/live-locations/me')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    disableMine: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/live-locations/me/disable')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getRequestTracking: function (requestId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/live-locations/request/".concat(requestId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// PRESCRIPTION ENDPOINTS
// ============================================================================
exports.prescriptionsApi = {
    createPrescription: function (prescriptionData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/prescriptions/', prescriptionData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listPrescriptions: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/prescriptions/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getPrescription: function (prescriptionId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/prescriptions/".concat(prescriptionId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updatePrescription: function (prescriptionId, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/prescriptions/".concat(prescriptionId), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deletePrescription: function (prescriptionId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/prescriptions/".concat(prescriptionId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// ALLERGY ENDPOINTS
// ============================================================================
exports.allergiesApi = {
    createAllergy: function (allergyData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/allergies/', allergyData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listAllergies: function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/allergies/', {
                        params: {
                            skip: (_a = params === null || params === void 0 ? void 0 : params.skip) !== null && _a !== void 0 ? _a : 0,
                            limit: (_b = params === null || params === void 0 ? void 0 : params.limit) !== null && _b !== void 0 ? _b : 100,
                            patient_id: params === null || params === void 0 ? void 0 : params.patient_id,
                        },
                    })];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getAllergy: function (allergyId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/allergies/".concat(allergyId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateAllergy: function (allergyId, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/allergies/".concat(allergyId), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteAllergy: function (allergyId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/allergies/".concat(allergyId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getPatientAllergies: function (patientId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/allergies/patient/".concat(patientId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// MEDICAL HISTORY ENDPOINTS (Implicit from user context)
// ============================================================================
exports.medicalHistoryApi = {
    listMedicalHistory: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/medical-history', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getMedicalRecord: function (recordId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/medical-history/".concat(recordId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getUserMedicalHistory: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/medical-history/user/".concat(userId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================
exports.notificationsApi = {
    createNotification: function (notification) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/notifications/', notification)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listNotifications: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/notifications', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getNotification: function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/notifications/".concat(notificationId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    markAsRead: function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/notifications/".concat(notificationId, "/read"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    archiveNotification: function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/notifications/".concat(notificationId, "/archive"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteNotification: function (notificationId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/notifications/".concat(notificationId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteAllNotifications: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete('/notifications/')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    markAllAsRead: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put('/notifications/mark-all/read')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getUnreadCount: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/notifications/summary/unread-count')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// VIDEO CALL ENDPOINTS
// ============================================================================
exports.videoCallsApi = {
    initiateCall: function (callData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/telemedicine/video-calls', callData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data]; // { channel_name, call_token, agora_uid }
            }
        });
    }); },
    listCalls: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/telemedicine/video-calls', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getCallDetails: function (callId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/telemedicine/video-calls/".concat(callId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateCallStatus: function (callId, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/telemedicine/video-calls/".concat(callId), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// MESSAGING ENDPOINTS
// ============================================================================
exports.messagingApi = {
    sendMessage: function (messageData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/telemedicine/messages', messageData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listMessages: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/telemedicine/messages', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getMessage: function (messageId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/telemedicine/messages/".concat(messageId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateMessage: function (messageId, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var payload, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = __assign(__assign({}, updateData), { is_read: updateData.is_read === undefined
                            ? undefined
                            : updateData.is_read === true
                                ? 'Y'
                                : updateData.is_read === false
                                    ? 'N'
                                    : updateData.is_read, is_archived: updateData.is_archived === undefined
                            ? undefined
                            : updateData.is_archived === true
                                ? 'Y'
                                : updateData.is_archived === false
                                    ? 'N'
                                    : updateData.is_archived });
                    return [4 /*yield*/, apiClient_1.apiClient.put("/telemedicine/messages/".concat(messageId), payload)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteMessage: function (messageId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/telemedicine/messages/".concat(messageId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================
exports.adminApi = {
    getDashboardStats: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/dashboard/stats')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getAppointmentAnalytics: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/analytics/appointments')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getUserAnalytics: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/analytics/users')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listAllUsers: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 500; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/users/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    deactivateUser: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/admin/users/".concat(userId, "/deactivate"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    reactivateUser: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/admin/users/".concat(userId, "/reactivate"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    /** `newRole` is backend role string, e.g. `patient`, `provider`, `pharmacist` (passed as query param). */
    changeUserRole: function (userId, newRole) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/admin/users/".concat(userId, "/change-role"), {
                        new_role: newRole,
                    }, {
                        params: { new_role: newRole },
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getAuditLogs: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/audit-logs', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getSystemHealth: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/system/health')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getAdminNotifications: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/notifications')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getPendingVerifications: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/verifications/pending')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listVerifications: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/verifications/')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    verifyProvider: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/admin/verifications/".concat(userId, "/approve"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    approveProvider: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/admin/verifications/".concat(userId, "/approve"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    rejectProvider: function (userId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, reason) {
            var response;
            if (reason === void 0) { reason = 'Invalid credentials'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/admin/verifications/".concat(userId, "/reject"), undefined, {
                            params: { reason: reason },
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getEcosystemActivity: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (limit) {
            var response;
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/ecosystem/activity', { params: { limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getActiveEmergencyDispatch: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/ops/emergencies/active')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    // SUPER ADMIN ONLY ENDPOINTS
    createAdmin: function (adminData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/admin/admins/create', adminData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    createUser: function (userData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/admin/users/create', userData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteUser: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/admin/users/".concat(userId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listAdmins: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/admins/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getSystemInfo: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/admin/system/info')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// LAB TEST ENDPOINTS
// ============================================================================
exports.labTestsApi = {
    createLabTest: function (testData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/lab-tests/', testData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listLabTests: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/lab-tests/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getLabTest: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/lab-tests/".concat(id))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateLabTest: function (id, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/lab-tests/".concat(id), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteLabTest: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/lab-tests/".concat(id))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// IMAGING SCAN ENDPOINTS
// ============================================================================
exports.imagingApi = {
    orderImagingScan: function (scanData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/imaging/', scanData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    listImagingScans: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/imaging/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    getImagingScan: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/imaging/".concat(id))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateImagingScan: function (id, updateData) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/imaging/".concat(id), updateData)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    uploadImagingResults: function (id, payload) { return __awaiter(void 0, void 0, void 0, function () {
        var formData, _i, _a, file, response;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    formData = new FormData();
                    if ((_b = payload.findings) === null || _b === void 0 ? void 0 : _b.trim())
                        formData.append('findings', payload.findings.trim());
                    if ((_c = payload.impression) === null || _c === void 0 ? void 0 : _c.trim())
                        formData.append('impression', payload.impression.trim());
                    if ((_d = payload.status) === null || _d === void 0 ? void 0 : _d.trim())
                        formData.append('status', payload.status.trim());
                    if (payload.reportFile)
                        formData.append('report_file', payload.reportFile);
                    for (_i = 0, _a = (_e = payload.imageFiles) !== null && _e !== void 0 ? _e : []; _i < _a.length; _i++) {
                        file = _a[_i];
                        formData.append('image_files', file);
                    }
                    return [4 /*yield*/, apiClient_1.apiClient.post("/imaging/".concat(id, "/results"), formData)];
                case 1:
                    response = _f.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteImagingScan: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/imaging/".concat(id))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
exports.referralsApi = {
    listReferrals: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skip, limit) {
            var response;
            if (skip === void 0) { skip = 0; }
            if (limit === void 0) { limit = 200; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/referrals/', { params: { skip: skip, limit: limit } })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        });
    },
    createReferral: function (body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/referrals/', body)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateReferral: function (referralId, body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/referrals/".concat(referralId), body)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// STRUCTURED RECORD ENDPOINTS
// ============================================================================
exports.recordsApi = {
    listRecords: function (recordType, params) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/records/', {
                        params: {
                            record_type: recordType,
                            skip: (_a = params === null || params === void 0 ? void 0 : params.skip) !== null && _a !== void 0 ? _a : 0,
                            limit: (_b = params === null || params === void 0 ? void 0 : params.limit) !== null && _b !== void 0 ? _b : 100,
                        },
                    })];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    createRecord: function (body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/records/', body)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    updateRecord: function (recordId, body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.put("/records/".concat(recordId), body)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    deleteRecord: function (recordId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.delete("/records/".concat(recordId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    getSynchronizedHistory: function (patientId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/records/synchronized-history/".concat(patientId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
exports.organizationsApi = {
    listOrganizations: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/organizations')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
exports.patientPermissionsApi = {
    listPermissions: function (patientId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get('/patient-permissions', {
                        params: patientId ? { patient_id: patientId } : undefined,
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    requestAccess: function (body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/patient-permissions/request', body)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    grantAccess: function (body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post('/patient-permissions/grant', body)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    approveAccess: function (permissionId, body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post("/patient-permissions/".concat(permissionId, "/approve"), body || {})];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    denyAccess: function (permissionId, body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post("/patient-permissions/".concat(permissionId, "/deny"), body || {})];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
    revokeAccess: function (permissionId, body) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.post("/patient-permissions/".concat(permissionId, "/revoke"), body || {})];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
exports.medicalRecordsApi = {
    getUnifiedRecord: function (patientId) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiClient_1.apiClient.get("/medical-records/unified/".concat(patientId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    }); },
};
// ============================================================================
// EXPORT ALL APIS
// ============================================================================
exports.api = {
    auth: exports.authApi,
    users: exports.usersApi,
    appointments: exports.appointmentsApi,
    prescriptions: exports.prescriptionsApi,
    allergies: exports.allergiesApi,
    medicalHistory: exports.medicalHistoryApi,
    notifications: exports.notificationsApi,
    videoCalls: exports.videoCallsApi,
    messaging: exports.messagingApi,
    admin: exports.adminApi,
    labTests: exports.labTestsApi,
    imaging: exports.imagingApi,
    referrals: exports.referralsApi,
    ambulance: exports.ambulanceApi,
    liveLocation: exports.liveLocationApi,
    records: exports.recordsApi,
    organizations: exports.organizationsApi,
    patientPermissions: exports.patientPermissionsApi,
    medicalRecords: exports.medicalRecordsApi,
};

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
exports.AuthProvider = void 0;
var react_1 = require("react");
var storageKeys_1 = require("@/lib/storageKeys");
var auth_context_1 = require("./auth-context");
var apiService_1 = require("@/lib/apiService");
var apiClient_1 = require("@/lib/apiClient");
var isApiUser = function (data) {
    return typeof data === 'object' && data !== null && 'id' in data && 'email' in data;
};
// Map backend user roles to frontend format
var mapBackendUser = function (data) {
    var _a, _b, _c, _d, _e, _f, _g;
    var mapBackendRoleToUserRole = function (role) {
        switch (role) {
            case 'patient':
                return 'patient';
            case 'provider':
                return 'doctor';
            case 'pharmacist':
                return 'pharmacy';
            case 'hospital':
                return 'hospital';
            case 'laboratory':
                return 'laboratory';
            case 'imaging':
                return 'imaging';
            case 'ambulance':
                return 'ambulance';
            case 'admin':
                return 'admin';
            case 'super_admin':
                return 'super_admin';
            default:
                return 'patient';
        }
    };
    var fullName = ((_a = data.full_name) === null || _a === void 0 ? void 0 : _a.trim()) || [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
    var _h = fullName.split(' '), _j = _h[0], firstName = _j === void 0 ? '' : _j, lastNameParts = _h.slice(1);
    return {
        id: String(data.id),
        email: data.email,
        name: fullName || data.email,
        role: mapBackendRoleToUserRole(data.role),
        isVerified: Boolean(data.is_verified),
        isActive: (_b = data.is_active) !== null && _b !== void 0 ? _b : true,
        emailVerified: (_c = data.email_verified) !== null && _c !== void 0 ? _c : false,
        emailVerifiedAt: (_d = data.email_verified_at) !== null && _d !== void 0 ? _d : null,
        avatar: data.avatar || data.profile_image_url,
        postdicomApiUrl: data.postdicom_api_url,
        createdAt: data.created_at,
        lastLogin: data.last_login,
        profile: {
            firstName: firstName,
            lastName: lastNameParts.join(' '),
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zip_code,
            dateOfBirth: data.date_of_birth,
            bio: data.bio,
            avatar: data.avatar || data.profile_image_url,
            notificationEmail: (_e = data.notification_email) !== null && _e !== void 0 ? _e : true,
            notificationSms: (_f = data.notification_sms) !== null && _f !== void 0 ? _f : false,
            privacyPublicProfile: (_g = data.privacy_public_profile) !== null && _g !== void 0 ? _g : false,
        }
    };
};
var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(null), user = _b[0], setUser = _b[1];
    var _c = (0, react_1.useState)([]), users = _c[0], setUsers = _c[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    // Set global logout callback for apiClient
    (0, react_1.useEffect)(function () {
        (0, apiClient_1.setGlobalLogoutCallback)(function () {
            setUser(null);
            setUsers([]);
        });
    }, []);
    var loadAccessibleUsers = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, mapped, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, apiService_1.usersApi.getAccessibleUsers()];
                case 1:
                    response = _a.sent();
                    mapped = Array.isArray(response) ? response.filter(isApiUser).map(mapBackendUser) : [];
                    setUsers(mapped);
                    return [2 /*return*/, mapped];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to load accessible users:', error_1);
                    setUsers([]);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Initialize auth state - cookies are sent automatically with requests
    (0, react_1.useEffect)(function () {
        var isMounted = true;
        var initializeAuth = function () { return __awaiter(void 0, void 0, void 0, function () {
            var userData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, apiService_1.authApi.getCurrentUser()];
                    case 1:
                        userData = _a.sent();
                        if (!isMounted)
                            return [2 /*return*/];
                        if (isApiUser(userData)) {
                            setUser(mapBackendUser(userData));
                        }
                        else {
                            setUser(null);
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        // If we can't get current user, user is not authenticated
                        if (!isMounted)
                            return [2 /*return*/];
                        setUser(null);
                        return [3 /*break*/, 4];
                    case 3:
                        if (isMounted)
                            setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        initializeAuth();
        return function () {
            isMounted = false;
        };
    }, []);
    var login = (0, react_1.useCallback)(function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiService_1.authApi.login(email, password)];
                case 1:
                    response = _a.sent();
                    // Backend now sets cookies automatically, no tokens in response
                    if (!isApiUser(response.user)) {
                        throw new Error('Login response did not include a valid user');
                    }
                    setUser(mapBackendUser(response.user));
                    void loadAccessibleUsers();
                    return [2 /*return*/];
            }
        });
    }); }, []);
    var signup = (0, react_1.useCallback)(function (name, email, password, role, licenseNumber, licenseState, specialty, phone, address, city, state, zipCode) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, firstName, lastNameParts, lastName, roleMap, backendRole, username, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = name.split(' '), _b = _a[0], firstName = _b === void 0 ? '' : _b, lastNameParts = _a.slice(1);
                    lastName = lastNameParts.join(' ') || 'User';
                    roleMap = {
                        patient: 'patient',
                        doctor: 'provider',
                        hospital: 'hospital',
                        laboratory: 'laboratory',
                        imaging: 'imaging',
                        pharmacy: 'pharmacist',
                        ambulance: 'ambulance',
                    };
                    backendRole = roleMap[role] || 'patient';
                    username = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '.');
                    return [4 /*yield*/, apiService_1.authApi.register({
                            email: email,
                            password: password,
                            username: username,
                            first_name: firstName,
                            last_name: lastName,
                            role: backendRole,
                            phone: phone || undefined,
                            address: address || undefined,
                            city: city || undefined,
                            state: state || undefined,
                            zip_code: zipCode || undefined,
                            license_number: role === 'patient' ? undefined : licenseNumber,
                            license_state: role === 'patient' ? undefined : licenseState,
                            specialty: role === 'patient' ? undefined : specialty,
                        })];
                case 1:
                    response = _c.sent();
                    // Backend now sets cookies automatically, no tokens in response
                    if (isApiUser(response.user)) {
                        setUser(mapBackendUser(response.user));
                        void loadAccessibleUsers();
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [loadAccessibleUsers]);
    var logout = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    if (!user) return [3 /*break*/, 2];
                    return [4 /*yield*/, apiService_1.authApi.logout()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    console.error('Logout error:', error_3);
                    return [3 /*break*/, 5];
                case 4:
                    // Clear local state regardless of API call success
                    setUser(null);
                    setUsers([]);
                    (0, apiClient_1.clearTokens)();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [user]);
    var updateProfile = (0, react_1.useCallback)(function (profile) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    return [4 /*yield*/, apiService_1.authApi.updateProfile({
                            phone: profile.phone,
                            address: profile.address,
                            city: profile.city,
                            state: profile.state,
                            zip_code: profile.zipCode,
                            date_of_birth: profile.dateOfBirth,
                            bio: profile.bio,
                            profile_image_url: profile.avatar,
                            notification_email: profile.notificationEmail,
                            notification_sms: profile.notificationSms,
                            privacy_public_profile: profile.privacyPublicProfile,
                        })];
                case 1:
                    response = _a.sent();
                    if (isApiUser(response)) {
                        setUser(mapBackendUser(response));
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [user]);
    var updateBasicInfo = (0, react_1.useCallback)(function (firstName, lastName) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    return [4 /*yield*/, apiService_1.authApi.updateProfile({
                            first_name: firstName,
                            last_name: lastName,
                        })];
                case 1:
                    response = _a.sent();
                    if (isApiUser(response)) {
                        setUser(mapBackendUser(response));
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [user]);
    var changePassword = (0, react_1.useCallback)(function (currentPassword, newPassword) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    return [4 /*yield*/, apiService_1.authApi.changePassword(currentPassword, newPassword)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [user]);
    var updateNotificationPreferences = (0, react_1.useCallback)(function (email, sms) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    return [4 /*yield*/, updateProfile({
                            notificationEmail: email,
                            notificationSms: sms,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [user, updateProfile]);
    var updatePrivacySettings = (0, react_1.useCallback)(function (publicProfile) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    return [4 /*yield*/, updateProfile({
                            privacyPublicProfile: publicProfile,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [user, updateProfile]);
    var _e = (0, react_1.useState)(0), lastRefreshAttempt = _e[0], setLastRefreshAttempt = _e[1];
    var refreshCurrentUser = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var now, userData, updatedUser, error_4, status_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    now = Date.now();
                    // Prevent refresh attempts more than once every 5 seconds
                    if (now - lastRefreshAttempt < 5000) {
                        return [2 /*return*/, null];
                    }
                    setLastRefreshAttempt(now);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, apiService_1.authApi.getCurrentUser()];
                case 2:
                    userData = _b.sent();
                    if (isApiUser(userData)) {
                        updatedUser = mapBackendUser(userData);
                        setUser(updatedUser);
                        void loadAccessibleUsers();
                        return [2 /*return*/, updatedUser];
                    }
                    return [2 /*return*/, null];
                case 3:
                    error_4 = _b.sent();
                    status_1 = typeof error_4 === 'object' && error_4 && 'response' in error_4
                        ? (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.status
                        : undefined;
                    if (status_1 === 401 || status_1 === 403) {
                        // Clear auth state on authentication failure
                        setUser(null);
                        setUsers([]);
                        (0, apiClient_1.clearTokens)();
                    }
                    else {
                        console.error('Failed to refresh current user:', error_4);
                    }
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [loadAccessibleUsers]);
    var deleteAccount = (0, react_1.useCallback)(function (password) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    return [4 /*yield*/, apiService_1.authApi.deleteAccount(password)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [user]);
    var resendEmailVerification = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        throw new Error('No user logged in');
                    if (user.role === 'admin' || user.emailVerified)
                        return [2 /*return*/];
                    return [4 /*yield*/, apiService_1.authApi.resendVerificationEmail()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [user]);
    var clearCache = (0, react_1.useCallback)(function () {
        (0, storageKeys_1.clearAleraStorage)();
        (0, apiClient_1.clearTokens)();
        setUser(null);
        setUsers([]);
    }, []);
    // Mock functions for backward compatibility - to be replaced by API calls
    var addUser = (0, react_1.useCallback)(function (name, email, password, role) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            throw new Error('Use signup instead');
        });
    }); }, []);
    var getUsers = (0, react_1.useCallback)(function () { return users; }, [users]);
    (0, react_1.useEffect)(function () {
        if (!user) {
            setUsers([]);
            return;
        }
        void loadAccessibleUsers();
    }, [loadAccessibleUsers, user]);
    (0, react_1.useEffect)(function () {
        var lastVisibilityCheck = Date.now();
        var syncUser = function () {
            // Only refresh if we have a user and it's been at least 30 seconds since last check
            if (user && Date.now() - lastVisibilityCheck > 30000) {
                lastVisibilityCheck = Date.now();
                void refreshCurrentUser();
            }
        };
        var handleVisibilityChange = function () {
            if (document.visibilityState === 'visible') {
                syncUser();
            }
        };
        // Only listen for visibility changes, not focus (too frequent)
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return function () {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refreshCurrentUser, user]);
    if (isLoading) {
        // Don't mock auth methods during initialization; we still need signup/login to work
        // (especially right after page load).
        return (<auth_context_1.AuthContext.Provider value={{
                user: user,
                // During initialization `user` may still be null, but we want to avoid
                // redirecting protected routes before auth initialization completes.
                isAuthenticated: true,
                isLoading: isLoading,
                login: login,
                signup: signup,
                logout: logout,
                addUser: addUser,
                getUsers: getUsers,
                updateProfile: updateProfile,
                updateBasicInfo: updateBasicInfo,
                changePassword: changePassword,
                updateNotificationPreferences: updateNotificationPreferences,
                updatePrivacySettings: updatePrivacySettings,
                deleteAccount: deleteAccount,
                resendEmailVerification: resendEmailVerification,
                clearCache: clearCache
            }}>
        {children}
      </auth_context_1.AuthContext.Provider>);
    }
    return (<auth_context_1.AuthContext.Provider value={{
            user: user,
            isAuthenticated: !!user,
            isLoading: isLoading,
            login: login,
            signup: signup,
            logout: logout,
            addUser: addUser,
            getUsers: getUsers,
            updateProfile: updateProfile,
            updateBasicInfo: updateBasicInfo,
            changePassword: changePassword,
            updateNotificationPreferences: updateNotificationPreferences,
            updatePrivacySettings: updatePrivacySettings,
            deleteAccount: deleteAccount,
            resendEmailVerification: resendEmailVerification,
            clearCache: clearCache
        }}>
      {children}
    </auth_context_1.AuthContext.Provider>);
};
exports.AuthProvider = AuthProvider;

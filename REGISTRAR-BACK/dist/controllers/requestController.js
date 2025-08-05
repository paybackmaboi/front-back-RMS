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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRequest = exports.getRequestById = exports.getRequestDocument = exports.updateRequestStatus = exports.getAllRequests = exports.getStudentRequests = exports.createRequest = void 0;
const database_1 = require("../database");
const path_1 = __importDefault(require("path"));
const createRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const documentType = req.body.documentType;
        const purpose = req.body.purpose;
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!studentId) {
            res.status(401).json({ message: 'Unauthorized: Student ID not found.' });
            return;
        }
        if (!documentType || !purpose) {
            res.status(400).json({ message: 'Document type and purpose are required.' });
            return;
        }
        const files = req.files;
        const filePaths = files ? files.map(file => file.filename) : undefined;
        const newRequest = yield database_1.Request.create({
            studentId,
            documentType,
            purpose,
            status: 'pending',
            filePath: filePaths,
        });
        yield database_1.Notification.create({
            userId: studentId,
            requestId: newRequest.id,
            message: `You have submitted your request for ${documentType}.`,
            isRead: false,
        });
        res.status(201).json(newRequest);
    }
    catch (error) {
        next(error);
    }
});
exports.createRequest = createRequest;
const getStudentRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!studentId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const requests = yield database_1.Request.findAll({ where: { studentId }, order: [['createdAt', 'DESC']] });
        res.json(requests);
    }
    catch (error) {
        next(error);
    }
});
exports.getStudentRequests = getStudentRequests;
const getAllRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield database_1.Request.findAll({
            include: [{
                    model: database_1.User,
                    as: 'student',
                    attributes: ['idNumber', 'firstName', 'lastName', 'middleName']
                }],
            order: [['createdAt', 'DESC']],
        });
        res.json(requests);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllRequests = getAllRequests;
const updateRequestStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        if (!status || !['pending', 'approved', 'rejected', 'ready for pick-up'].includes(status)) {
            res.status(400).json({ message: 'Invalid status provided.' });
            return;
        }
        const request = yield database_1.Request.findByPk(id);
        if (!request) {
            res.status(404).json({ message: 'Request not found.' });
            return;
        }
        request.status = status;
        if (notes !== undefined) {
            request.notes = notes;
        }
        yield request.save();
        yield database_1.Notification.create({
            userId: request.studentId,
            requestId: request.id,
            message: `Your request for ${request.documentType} has been ${status.replace(/-/g, ' ')}.`,
            isRead: false,
        });
        res.json(request);
    }
    catch (error) {
        next(error);
    }
});
exports.updateRequestStatus = updateRequestStatus;
const getRequestDocument = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, docIndex } = req.params;
        const request = yield database_1.Request.findByPk(id);
        if (!request || !request.filePath) {
            res.status(404).json({ message: 'Document not found.' });
            return;
        }
        const filePaths = Array.isArray(request.filePath) ? request.filePath : [request.filePath];
        const docIndexNum = parseInt(docIndex, 10);
        if (docIndexNum < 0 || docIndexNum >= filePaths.length) {
            res.status(404).json({ message: 'Document index out of range.' });
            return;
        }
        const fileName = filePaths[docIndexNum];
        const filePath = path_1.default.join(process.cwd(), 'uploads', fileName);
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found on server.' });
            return;
        }
        // Set appropriate headers for file download/viewing
        const ext = path_1.default.extname(fileName).toLowerCase();
        if (ext === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        }
        else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            res.setHeader('Content-Type', `image/${ext.slice(1)}`);
        }
        else {
            res.setHeader('Content-Type', 'application/octet-stream');
        }
        res.sendFile(filePath);
    }
    catch (error) {
        console.error('Error serving document:', error);
        res.status(500).json({ message: 'Error serving document.' });
    }
});
exports.getRequestDocument = getRequestDocument;
const getRequestById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        const request = yield database_1.Request.findByPk(id, {
            include: [{
                    model: database_1.User,
                    as: 'student',
                    attributes: ['idNumber', 'firstName', 'lastName', 'middleName']
                }]
        });
        if (!request) {
            res.status(404).json({ message: 'Request not found.' });
            return;
        }
        // Students can only view their own requests
        if (userRole === 'student' && request.studentId !== userId) {
            res.status(403).json({ message: 'Access denied.' });
            return;
        }
        res.json(request);
    }
    catch (error) {
        next(error);
    }
});
exports.getRequestById = getRequestById;
const deleteRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const request = yield database_1.Request.findByPk(id);
        if (!request) {
            res.status(404).json({ message: 'Request not found.' });
            return;
        }
        yield request.destroy();
        res.json({ message: 'Request deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteRequest = deleteRequest;

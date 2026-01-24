// backend/src/routes/index.js

const express = require('express');

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const memberRoutes = require('./memberRoutes');
const employeeRoutes = require('./employeeRoutes');
const documentRoutes = require('./documentRoutes');
const memberDocumentRoutes = require('./memberDocumentRoutes');
const reportRoutes = require('./reportRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const transactionRoutes = require('./transactionRoutes');
const financeRoutes = require('./financeRoutes');
const clientRoutes = require('./clientRoutes');
const agendaRoutes = require('./agendaRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/members', memberRoutes);
router.use('/employees', employeeRoutes);
router.use('/documents', documentRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/transactions', transactionRoutes);
router.use('/finance', financeRoutes);
router.use('/clients', clientRoutes);
router.use('/agendas', agendaRoutes);

// Rota interna apenas admin
router.use('/admin', adminRoutes);

// Rotas aninhadas
router.use('/members/:memberId/documents', memberDocumentRoutes);

module.exports = router;

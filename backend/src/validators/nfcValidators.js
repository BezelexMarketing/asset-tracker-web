const Joi = require('joi');

/**
 * Validation schema for NFC lookup requests
 */
const validateNFCLookup = (data) => {
  const schema = Joi.object({
    tagUid: Joi.string().required().min(1).max(50)
  });
  
  return schema.validate(data);
};

/**
 * Validation schema for assignment requests
 */
const validateAssignment = (data) => {
  const schema = Joi.object({
    operatorId: Joi.string().required().uuid(),
    assignedBy: Joi.string().required().uuid(),
    notes: Joi.string().optional().max(500),
    dueDate: Joi.date().optional().iso()
  });
  
  return schema.validate(data);
};

/**
 * Validation schema for check-in/check-out requests
 */
const validateCheckInOut = (data) => {
  const schema = Joi.object({
    operatorId: Joi.string().required().uuid(),
    location: Joi.string().optional().max(100),
    notes: Joi.string().optional().max(500),
    condition: Joi.string().valid('excellent', 'good', 'fair', 'poor', 'damaged').optional()
  });
  
  return schema.validate(data);
};

/**
 * Validation schema for maintenance requests
 */
const validateMaintenance = (data) => {
  const schema = Joi.object({
    maintenanceType: Joi.string().required().valid('routine', 'repair', 'inspection', 'calibration'),
    performedBy: Joi.string().required().uuid(),
    description: Joi.string().required().max(1000),
    cost: Joi.number().optional().min(0),
    nextMaintenanceDate: Joi.date().optional().iso(),
    notes: Joi.string().optional().max(500)
  });
  
  return schema.validate(data);
};

module.exports = {
  validateNFCLookup,
  validateAssignment,
  validateCheckInOut,
  validateMaintenance
};
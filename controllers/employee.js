const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Employee = require('../models/Employee');

//@desc Get All Employee
//@route GET /api/v1/employee
//@access public

exports.getEmployees = asyncHandler(async (req, res, next) => {
  let query;
  //copy req.query
  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit']

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);


  let queryStr = JSON.stringify(reqQuery)
  queryStr = queryStr.replace( /\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
  query = Employee.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
   const total = await Employee.countDocuments();


  const employee  = await query;

  //Pagination results
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  
  next();
   
  res.status(200).json({ success: true, pagination, data: employee});
});

//@desc Get single employee
//@route GET /api/v1/employee/:id
//@access public

exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).populate({
    path: 'user',
    select: 'name role',
  });

  if (!employee) {
    return next(new ErrorResponse(`No employee with id ${req.params.id}`), 404);
  }

  res.status(200).json({ success: true, data: employee });
});

//@desc create employee
//@route POST  /api/v1/employee
//@access Private

exports.createEmployee = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;
  //Check for patient
  const publishedEmployee = await Employee.findOne({ user: req.user.id });
  //if user is not an admin , they can add one patient
  if (publishedEmployee && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already create Employee`,
        400
      )
    );
  }
  const employee = await Employee.create(req.body);
  res.status(200).json({ success: true, data: employee });
});

//desc  update Employee
//@route GET /api/v1/employee/:id
//@access Private

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  let employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is Employee owner
  if (employee.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update employee`,
        401
      )
    );
  }

  employee = await Employee.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: employee });
});


//desc  delete employee
//@route GET /api/v1/employee/:id
//@access Private

exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(
      new ErrorResponse(`employee not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is employee owner
  if (employee.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this employee`,
        401
      )
    );
  }
  employee.remove();
  res.status(200).json({ success: true, data: {} });
});
const User = require('../models/User');
const Service = require('../models/Service');
// const decrypt = require('../lib/encription').decrypt;

/**
 * GET admin home
 */
exports.index = (req, res) => {
  res.render('admin/dashboard');
};

/**
 * GET users list
 */
exports.getUsers = (req, res) => {
  const query = {};
  // User.find(query)
  User.paginate(query, {
    page: req.query.hasOwnProperty('page') ? +req.query.page : 1,
    limit: req.query.hasOwnProperty('limit') ? +req.query.limit : 20,
    select: '_id email services', // we're not populating services, only a list of ids
    sort: 'email'
  })
    .then(({ docs, ...rest }) => {
      res.render('admin/users', { users: docs, ...rest });
    })
    .catch((error) => {
      console.log(error);
    });
};

/**
 * GET user details
 */
exports.getUser = (req, res) => {
  // res.redirect('/admin/users');
  User.findById(req.params.user).populate('services').exec((error, user) => {
    if (error) {
      console.log(error);
      return res.redirect('/admin/users');
    }

    res.render('admin/user', { user });
  });
};

/**
 * POST user profile
 */
exports.postUserProfile = (req, res, next) => {
  User.findById(req.params.user, (findError, user) => {
    if (findError) { return next(findError); }

    user.email = req.body.email;
    user.profile.name = req.body.name;
    user.save((saveError) => {
      if (saveError) { return next(saveError); }

      res.redirect(`/admin/users/${req.params.user}`);
    });
  });
};

/**
 * POST user password
 */
exports.postUserPassword = (req, res, next) => {
  User.findById(req.params.user, (findError, user) => {
    if (findError) { return next(findError); }

    user.password = req.body.password;
    user.save((saveError) => {
      if (saveError) { return next(saveError); }

      res.redirect(`/admin/users/${req.params.user}`);
    });
  });
};

/**
 * POST user admin
 */
exports.postUserAdmin = (req, res, next) => {
  User.findById(req.params.user, (findError, user) => {
    if (findError) { return next(findError); }

    user.admin = req.body.admin === 'true';
    user.save((saveError) => {
      if (saveError) { return next(saveError); }

      res.redirect(`/admin/users/${req.params.user}`);
    });
  });
};

/**
 * GET user service
 */
exports.getUserService = (req, res, next) => {
  Service.findById(req.params.service)
    // .populate('invoices')
    .exec((error, service) => {
      if (error) { return res.redirect(`/admin/users/${req.params.user}`); }

      User.findById(req.params.user, (findError, user) => {
        res.render('admin/service', { service, user });
      });
    });
};

/**
 * POST user service
 */
exports.postUserService = (req, res, next) => {
  Service.findById(req.params.service, (findError, service) => {
    if (findError) { return next(findError); }

    service.user = req.body.user;
    service.password = req.body.password;
    service.save((saveError) => {
      if (saveError) { return next(saveError); }

      res.redirect(`/admin/users/${req.params.user}/services/${req.params.service}`);
    })
  });
}

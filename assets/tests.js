'use strict';

define('pixeditor/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('adapters/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/application.js should pass ESLint\n\n');
  });

  QUnit.test('adapters/area.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/area.js should pass ESLint\n\n');
  });

  QUnit.test('adapters/author.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/author.js should pass ESLint\n\n');
  });

  QUnit.test('adapters/challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/challenge.js should pass ESLint\n\n');
  });

  QUnit.test('adapters/competence.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/competence.js should pass ESLint\n\n');
  });

  QUnit.test('adapters/workbench-challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/workbench-challenge.js should pass ESLint\n\n');
  });

  QUnit.test('adapters/workbench-skill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/workbench-skill.js should pass ESLint\n\n');
  });

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('components/challenge-form.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/challenge-form.js should pass ESLint\n\n');
  });

  QUnit.test('components/competence-grid.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/competence-grid.js should pass ESLint\n\n');
  });

  QUnit.test('components/competence-list.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/competence-list.js should pass ESLint\n\n');
  });

  QUnit.test('components/config-form.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/config-form.js should pass ESLint\n\n');
  });

  QUnit.test('components/form-files.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/form-files.js should pass ESLint\n\n');
  });

  QUnit.test('components/form-illustration.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/form-illustration.js should pass ESLint\n\n');
  });

  QUnit.test('components/form-input.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/form-input.js should pass ESLint\n\n');
  });

  QUnit.test('components/form-mde.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/form-mde.js should pass ESLint\n\n');
  });

  QUnit.test('components/form-select.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/form-select.js should pass ESLint\n\n');
  });

  QUnit.test('components/form-textarea.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/form-textarea.js should pass ESLint\n\n');
  });

  QUnit.test('components/main-sidebar.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/main-sidebar.js should pass ESLint\n\n');
  });

  QUnit.test('components/skill-form.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/skill-form.js should pass ESLint\n\n');
  });

  QUnit.test('config-private.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'config-private.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/application.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/competence.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/competence.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/competence/challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/competence/challenge.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/competence/new-template.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/competence/new-template.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/competence/skill.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/competence/skill.js should pass ESLint\n\n63:9 - Unexpected console statement. (no-console)');
  });

  QUnit.test('models/area.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/area.js should pass ESLint\n\n');
  });

  QUnit.test('models/author.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/author.js should pass ESLint\n\n');
  });

  QUnit.test('models/challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/challenge.js should pass ESLint\n\n');
  });

  QUnit.test('models/competence.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/competence.js should pass ESLint\n\n');
  });

  QUnit.test('models/skill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/skill.js should pass ESLint\n\n');
  });

  QUnit.test('models/tutorial.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/tutorial.js should pass ESLint\n\n');
  });

  QUnit.test('models/workbench-challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/workbench-challenge.js should pass ESLint\n\n');
  });

  QUnit.test('models/workbench-skill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/workbench-skill.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/application.js should pass ESLint\n\n');
  });

  QUnit.test('routes/competence.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/competence.js should pass ESLint\n\n');
  });

  QUnit.test('routes/competence/challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/competence/challenge.js should pass ESLint\n\n');
  });

  QUnit.test('routes/competence/new-template.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/competence/new-template.js should pass ESLint\n\n');
  });

  QUnit.test('routes/competence/skill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/competence/skill.js should pass ESLint\n\n');
  });

  QUnit.test('routes/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/index.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/application.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/area.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/area.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/author.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/author.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/challenge.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/competence.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/competence.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/skill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/skill.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/tutorial.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/tutorial.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/workbench-challenge.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/workbench-challenge.js should pass ESLint\n\n');
  });

  QUnit.test('serializers/workbench-skill.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'serializers/workbench-skill.js should pass ESLint\n\n');
  });

  QUnit.test('services/config.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/config.js should pass ESLint\n\n58:7 - Unexpected console statement. (no-console)\n73:7 - Unexpected console statement. (no-console)');
  });

  QUnit.test('services/paginated-query.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/paginated-query.js should pass ESLint\n\n');
  });

  QUnit.test('services/pix-connector.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/pix-connector.js should pass ESLint\n\n');
  });

  QUnit.test('services/storage.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/storage.js should pass ESLint\n\n');
  });
});
define('pixeditor/tests/helpers/upload', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (selector, file, filename) {
    var input = findWithAssert(selector)[0];

    file.name = filename;

    // This hack is here since we can't mock out the
    // FileList API easily; we're taking advantage
    // that we can mutate the FileList DOM API at
    // runtime to allow us to push files into the <input>
    var files = [file];
    input.files.item = function (idx) {
      return files[idx];
    };
    input.files.size = files.length;

    return triggerEvent(selector, 'change');
  };
});

define('pixeditor/tests/integration/components/challenge-form-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | challenge-form', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "mwxZvaAf",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"challenge-form\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "Tnw4ZbFA",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"challenge-form\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/competence-grid-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | competence-grid', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "yTSKfmmn",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"competence-grid\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "tKBY92OK",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"competence-grid\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/competence-list-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | competence-list3', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "LYL1LAqB",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"competence-list3\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "fXY2wInB",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"competence-list3\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/config-form-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | config-form', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "aC2e4fpQ",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"config-form\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "/7xEG6hj",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"config-form\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/form-files-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | form-files', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "tReqYL8e",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"form-files\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "zsix65sh",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"form-files\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/form-illustration-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | form-illustration', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "GE9XtxFS",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"form-illustration\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "4TOaL71z",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"form-illustration\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/form-input-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | form-input', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "fl1E4N4Q",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"form-input\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "mW1t4LjU",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"form-input\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/form-mde-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | form-mde.hbs', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "2SPfI4nN",
                  "block": "{\"symbols\":[],\"statements\":[[1,[20,[\"form-mde\",\"hbs\"]],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "T8d0p5nt",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"component\",[[20,[\"form-mde\",\"hbs\"]]],null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/form-select-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | form-select', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "HYo6nzR3",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"form-select\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "NtfDASto",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"form-select\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/form-textarea-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | form-textarea', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "uEiRe1vg",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"form-textarea\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "A+7F4FAL",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"form-textarea\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/main-sidebar-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | main-sidebar', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "FvdfWeYk",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"main-sidebar\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "hwab8I83",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"main-sidebar\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/integration/components/skill-form-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _qunit.module)('Integration | Component | skill-form', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(assert) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "thpF3YtE",
                  "block": "{\"symbols\":[],\"statements\":[[1,[18,\"skill-form\"],false]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 2:

                assert.equal(this.element.textContent.trim(), '');

                // Template block usage:
                _context.next = 5;
                return (0, _testHelpers.render)(Ember.HTMLBars.template({
                  "id": "YDre48QE",
                  "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"skill-form\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
                  "meta": {}
                }));

              case 5:

                assert.equal(this.element.textContent.trim(), 'template block text');

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }());
  });
});

define('pixeditor/tests/test-helper', ['pixeditor/app', 'pixeditor/config/environment', '@ember/test-helpers', 'ember-qunit'], function (_app, _environment, _testHelpers, _emberQunit) {
  'use strict';

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));

  (0, _emberQunit.start)();
});

define('pixeditor/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('integration/components/challenge-form-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/challenge-form-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/competence-grid-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/competence-grid-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/competence-list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/competence-list-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/config-form-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/config-form-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/form-files-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/form-files-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/form-illustration-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/form-illustration-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/form-input-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/form-input-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/form-mde-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/form-mde-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/form-select-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/form-select-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/form-textarea-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/form-textarea-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/main-sidebar-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/main-sidebar-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/skill-form-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/skill-form-test.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/area-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/area-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/author-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/author-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/competence-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/competence-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/workbench-challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/workbench-challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/workbench-skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/workbench-skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/competence-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/competence-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/competence/challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/competence/challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/competence/new-template-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/competence/new-template-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/competence/skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/competence/skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/area-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/area-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/author-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/author-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/competence-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/competence-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/tutorial-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/tutorial-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/workbench-challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/workbench-challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/workbench-skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/workbench-skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/competence-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/competence-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/competence/challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/competence/challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/competence/new-template-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/competence/new-template-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/competence/skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/competence/skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/index-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/area-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/area-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/author-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/author-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/competence-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/competence-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/tutorial-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/tutorial-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/workbench-challenge-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/workbench-challenge-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/workbench-skill-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/workbench-skill-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/config-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/config-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/paginated-query-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/paginated-query-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/pix-connector-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/pix-connector-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/storage-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/storage-test.js should pass ESLint\n\n');
  });
});
define('pixeditor/tests/unit/adapters/application-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:application');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/adapters/area-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | area', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:area');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/adapters/author-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | author', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:author');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/adapters/challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:challenge');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/adapters/competence-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | competence', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:competence');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/adapters/workbench-challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | workbench challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:workbench-challenge');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/adapters/workbench-skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Adapter | workbench skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var adapter = this.owner.lookup('adapter:workbench-skill');
      assert.ok(adapter);
    });
  });
});

define('pixeditor/tests/unit/controllers/application-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var controller = this.owner.lookup('controller:application');
      assert.ok(controller);
    });
  });
});

define('pixeditor/tests/unit/controllers/competence-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | competence', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var controller = this.owner.lookup('controller:competence');
      assert.ok(controller);
    });
  });
});

define('pixeditor/tests/unit/controllers/competence/challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | competence/challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var controller = this.owner.lookup('controller:competence/challenge');
      assert.ok(controller);
    });
  });
});

define('pixeditor/tests/unit/controllers/competence/new-template-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | competence/new-template', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var controller = this.owner.lookup('controller:competence/new-template');
      assert.ok(controller);
    });
  });
});

define('pixeditor/tests/unit/controllers/competence/skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | competence/skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var controller = this.owner.lookup('controller:competence/skill');
      assert.ok(controller);
    });
  });
});

define('pixeditor/tests/unit/models/area-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | area', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('area', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/author-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | author', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('author', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('challenge', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/competence-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | competence', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('competence', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('skill', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/tutorial-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | tutorial', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('tutorial', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/workbench-challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | workbench challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('workbench-challenge', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/models/workbench-skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | workbench skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var model = Ember.run(function () {
        return store.createRecord('workbench-skill', {});
      });
      assert.ok(model);
    });
  });
});

define('pixeditor/tests/unit/routes/application-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      var route = this.owner.lookup('route:application');
      assert.ok(route);
    });
  });
});

define('pixeditor/tests/unit/routes/competence-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | competence', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      var route = this.owner.lookup('route:competence');
      assert.ok(route);
    });
  });
});

define('pixeditor/tests/unit/routes/competence/challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | competence/challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      var route = this.owner.lookup('route:competence/challenge');
      assert.ok(route);
    });
  });
});

define('pixeditor/tests/unit/routes/competence/new-template-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | competence/newTemplate', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      var route = this.owner.lookup('route:competence/new-template');
      assert.ok(route);
    });
  });
});

define('pixeditor/tests/unit/routes/competence/skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | competence/skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      var route = this.owner.lookup('route:competence/skill');
      assert.ok(route);
    });
  });
});

define('pixeditor/tests/unit/routes/index-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      var route = this.owner.lookup('route:index');
      assert.ok(route);
    });
  });
});

define('pixeditor/tests/unit/serializers/application-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('application');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('application', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/area-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | area', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('area');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('area', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/author-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | author', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('author');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('author', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('challenge');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('challenge', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/competence-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | competence', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('competence');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('competence', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('skill');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('skill', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/tutorial-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | tutorial', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('tutorial');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('tutorial', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/workbench-challenge-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | workbench challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('workbench-challenge');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('workbench-challenge', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/serializers/workbench-skill-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Serializer | workbench skill', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var store = this.owner.lookup('service:store');
      var serializer = store.serializerFor('workbench-skill');

      assert.ok(serializer);
    });

    (0, _qunit.test)('it serializes records', function (assert) {
      var store = this.owner.lookup('service:store');
      var record = Ember.run(function () {
        return store.createRecord('workbench-skill', {});
      });

      var serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  });
});

define('pixeditor/tests/unit/services/config-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Service | config', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var service = this.owner.lookup('service:config');
      assert.ok(service);
    });
  });
});

define('pixeditor/tests/unit/services/paginated-query-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Service | paginatedQuery', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var service = this.owner.lookup('service:paginated-query');
      assert.ok(service);
    });
  });
});

define('pixeditor/tests/unit/services/pix-connector-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Service | pixConnector', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var service = this.owner.lookup('service:pix-connector');
      assert.ok(service);
    });
  });
});

define('pixeditor/tests/unit/services/storage-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Service | storage', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      var service = this.owner.lookup('service:storage');
      assert.ok(service);
    });
  });
});

define('pixeditor/config/environment', [], function() {
  var prefix = 'pixeditor';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('pixeditor/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map

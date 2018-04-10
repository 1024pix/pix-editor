"use strict";

define("pixeditor/adapters/application", ["exports", "ember-airtable/adapter"], function (exports, _adapter) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _adapter.default.extend({
    config: Ember.inject.service(),
    headers: Ember.computed("config.airtableKey", function () {
      return {
        Accept: 'application/json',
        // API Token
        Authorization: 'Bearer ' + this.get("config").get("airtableKey")
      };
    }),
    namespace: Ember.computed("config.airtableBase", function () {
      // API Version + Base ID
      return "v0/" + this.get("config").get("airtableBase");
    }),
    pathForType: function pathForType(type) {
      switch (type) {
        case "area":
          return "Domaines";
        case "competence":
          return "Competences";
        case "skill":
          return "Acquis";
        case "tutorial":
          return "Tutoriels";
        default:
          return this._super(type);
      }
    },


    // from RESTAdpater, overriden to use PATCH instead of PUT
    updateRecord: function updateRecord(store, type, snapshot) {
      var data = {};
      var serializer = store.serializerFor(type.modelName);

      serializer.serializeIntoHash(data, type, snapshot);

      var id = snapshot.id;
      var url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

      return this.ajax(url, "PATCH", { data: data });
    }
  });
});

define("pixeditor/adapters/area", ["exports", "pixeditor/adapters/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    findAll: function findAll(store, type, sinceToken) {
      return this.query(store, type, { since: sinceToken, sort: [{ field: "Nom", direction: "asc" }] });
    },
    pathForType: function pathForType() {
      return "Domaines";
    }
  });
});

define('pixeditor/adapters/author', ['exports', 'pixeditor/adapters/application'], function (exports, _application) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    config: Ember.inject.service(),
    namespace: Ember.computed("config.airtableEditorBase", function () {
      return "v0/" + this.get("config").get("airtableEditorBase");
    }),
    pathForType: function pathForType() {
      return "Auteurs";
    }
  });
});

define("pixeditor/adapters/challenge", ["exports", "pixeditor/adapters/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    pathForType: function pathForType() {
      return "Epreuves";
    }
  });
});

define("pixeditor/adapters/competence", ["exports", "pixeditor/adapters/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    findAll: function findAll(store, type, sinceToken) {
      return this.query(store, type, { since: sinceToken, sort: [{ field: "Sous-domaine", direction: "asc" }] });
    },
    pathForType: function pathForType() {
      return "Competences";
    }
  });
});

define('pixeditor/adapters/workbench-challenge', ['exports', 'pixeditor/adapters/application'], function (exports, _application) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    config: Ember.inject.service(),
    namespace: Ember.computed("config.airtableWorkbenchBase", function () {
      // API Version + Base ID
      return "v0/" + this.get("config").get("airtableWorkbenchBase");
    }),
    pathForType: function pathForType() {
      return "Epreuves";
    }
  });
});

define('pixeditor/adapters/workbench-skill', ['exports', 'pixeditor/adapters/application'], function (exports, _application) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    config: Ember.inject.service(),
    namespace: Ember.computed("config.airtableWorkbenchBase", function () {
      // API Version + Base ID
      return "v0/" + this.get("config").get("airtableWorkbenchBase");
    }),
    pathForType: function pathForType() {
      return "Acquis";
    }
  });
});

define('pixeditor/app', ['exports', 'pixeditor/resolver', 'ember-load-initializers', 'pixeditor/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});

define("pixeditor/components/challenge-form", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    config: Ember.inject.service(),
    init: function init() {
      this._super.apply(this, arguments);
      this.options = {
        'types': ["QCU", "QCM", "QROC", "QROCM-ind", "QROCM-dep", "QRU"],
        'pedagogy': ["e-preuve", "q-savoir", "q-situation"],
        'status': ["proposé", "pré-validé", "validé sans test", "validé", "archive"],
        'declinable': ["", "facilement", "difficilement", "permutation", "non"]
      };
    },

    authors: Ember.computed("config.authorNames", function () {
      return this.get("config.authorNames");
    })
  });
});

define("pixeditor/components/competence-grid", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ["competence-grid"],
    classNameBindings: ["hidden"]
  });
});

define("pixeditor/components/competence-list", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ["competence-list"],
    classNameBindings: ["hidden"],
    init: function init() {
      this._super.apply(this, arguments);
      this.columns = [100];
    },

    sortManager: Ember.observer("list", function () {
      Ember.$(".competence-list-header .list-item").removeClass("sorting");
    }),
    actions: {
      sortBy: function sortBy(field) {
        var sort1 = void 0,
            sort2 = void 0;
        var sortElement = Ember.$(".competence-list-header .list-item." + field);
        if (sortElement.hasClass("ascending")) {
          sortElement.removeClass("ascending");
          sortElement.addClass("descending");
          sort1 = -1;
          sort2 = 1;
        } else {
          sortElement.removeClass("descending");
          sortElement.addClass("ascending");
          sort1 = 1;
          sort2 = -1;
        }
        var list = this.get("list");
        var elements = list.toArray();
        if (field === "skillNames") {
          elements.sort(function (a, b) {
            var val1 = a.get(field);
            var val2 = b.get(field);
            if (val1 && val1.length > 0) {
              val1 = val1[0];
            } else {
              val1 = "";
            }
            if (val2 && val2.length > 0) {
              val2 = val2[0];
            } else {
              val2 = "";
            }
            if (val1 > val2) return sort1;
            if (val1 < val2) return sort2;
            return 0;
          });
        } else {
          elements.sort(function (a, b) {
            var val1 = a.get(field),
                val2 = b.get(field);
            if (val1 > val2) return sort1;
            if (val1 < val2) return sort2;
            return 0;
          });
        }
        list.clear();
        list.pushObjects(elements);
        this.set("list", list);
        Ember.$(".competence-list-header .list-item").removeClass("sorting");
        sortElement.addClass("sorting");
      }
    }
  });
});

define('pixeditor/components/config-form', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    config: Ember.inject.service(),
    airtableKey: "",
    configKey: "",
    author: "",
    pixUser: "",
    pixPassword: "",
    saved: false,
    displayManager: Ember.observer("display", function () {
      if (this.get("display")) {
        Ember.$(".config-form").modal('show');
        var config = this.get("config");
        config.load();
        this.set("airtableKey", config.get("airtableKey"));
        this.set("configKey", config.get("configKey"));
        this.set("author", config.get("author"));
        this.set("pixUser", config.get("pixUser"));
        this.set("pixPassword", config.get("pixPassword"));
        this.set("saved", false);
      }
    }),
    authors: Ember.computed("config.authors", function () {
      return this.get("config.authors");
    }),
    actions: {
      saveConfig: function saveConfig() {
        var config = this.get("config");
        config.set("airtableKey", this.get("airtableKey"));
        config.set("configKey", this.get("configKey"));
        var author = this.get("author");
        var lite = true;
        config.set("author", author);
        var authorRecord = this.get("authors").find(function (value) {
          return value.get("name") === author;
        });
        if (authorRecord) {
          lite = authorRecord.get("lite");
        }
        config.set("lite", lite);
        config.set("pixUser", this.get("pixUser"));
        config.set("pixPassword", this.get("pixPassword"));
        config.save();
        this.set("saved", true);
      },
      closed: function closed() {
        this.set("display", false);
        if (this.get("saved")) {
          this.get("update")();
        }
      }
    }
  });
});

define('pixeditor/components/ember-collection', ['exports', 'ember-collection/components/ember-collection'], function (exports, _emberCollection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberCollection.default;
    }
  });
});

define('pixeditor/components/ember-native-scrollable', ['exports', 'ember-collection/components/ember-native-scrollable'], function (exports, _emberNativeScrollable) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberNativeScrollable.default;
    }
  });
});

define('pixeditor/components/file-dropzone', ['exports', 'ember-file-upload/components/file-dropzone/component'], function (exports, _component) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _component.default;
    }
  });
});

define('pixeditor/components/file-upload', ['exports', 'ember-file-upload/components/file-upload/component'], function (exports, _component) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _component.default;
    }
  });
});

define('pixeditor/components/form-files', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['field'],
    actions: {
      remove: function remove(index) {
        // clone instead of removeAt, so that rollbackAttributes
        // may work
        var list = this.get("value").slice();
        list.splice(index, 1);
        this.set("value", list);
      },
      add: function add(file) {
        var list = this.get("value").slice();
        list.push({ file: file, url: "", filename: file.get("name") });
        this.set("value", list);
      }
    }
  });
});

define('pixeditor/components/form-illustration', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['field'],
    actions: {
      remove: function remove() {
        this.set("value", []);
      },
      add: function add(file) {
        this.set("value", [{ file: file }]);
      }
    }
  });
});

define('pixeditor/components/form-input', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({});
});

define('pixeditor/components/form-mde', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['field'],
    init: function init() {
      this._super.apply(this, arguments);
      this.simpleMDEOptions = {
        status: false,
        spellChecker: false,
        hideIcons: ["heading", "image", "guide", "side-by-side"]
      };
    }
  });
});

define('pixeditor/components/form-select', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['field']
  });
});

define('pixeditor/components/form-textarea', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['field', 'textArea'],
    classNameBindings: ['maximized'],
    maximized: false,
    actions: {
      toggleMaximized: function toggleMaximized() {
        this.set("maximized", !this.get("maximized"));
      }
    }

  });
});

define("pixeditor/components/main-sidebar", ["exports", "pixeditor/config/environment"], function (exports, _environment) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    tagName: "",
    version: _environment.default.APP.version,
    config: Ember.inject.service(),
    author: Ember.computed("config.author", function () {
      return this.get("config").get("author");
    })
  });
});

define('pixeditor/components/simple-mde', ['exports', 'ember-simplemde/components/simple-mde'], function (exports, _simpleMde) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _simpleMde.default;
    }
  });
});

define('pixeditor/components/skill-form', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    init: function init() {
      this._super.apply(this, arguments);
      this.options = {
        'status': ["Proposé", "Validé"]
      };
    }
  });
});

define('pixeditor/components/ui-accordion', ['exports', 'semantic-ui-ember/components/ui-accordion'], function (exports, _uiAccordion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiAccordion.default;
    }
  });
});

define('pixeditor/components/ui-checkbox', ['exports', 'semantic-ui-ember/components/ui-checkbox'], function (exports, _uiCheckbox) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiCheckbox.default;
    }
  });
});

define('pixeditor/components/ui-dimmer', ['exports', 'semantic-ui-ember/components/ui-dimmer'], function (exports, _uiDimmer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiDimmer.default;
    }
  });
});

define('pixeditor/components/ui-dropdown', ['exports', 'semantic-ui-ember/components/ui-dropdown'], function (exports, _uiDropdown) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiDropdown.default;
    }
  });
});

define('pixeditor/components/ui-embed', ['exports', 'semantic-ui-ember/components/ui-embed'], function (exports, _uiEmbed) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiEmbed.default;
    }
  });
});

define('pixeditor/components/ui-modal', ['exports', 'semantic-ui-ember/components/ui-modal'], function (exports, _uiModal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiModal.default;
    }
  });
});

define('pixeditor/components/ui-nag', ['exports', 'semantic-ui-ember/components/ui-nag'], function (exports, _uiNag) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiNag.default;
    }
  });
});

define('pixeditor/components/ui-popup', ['exports', 'semantic-ui-ember/components/ui-popup'], function (exports, _uiPopup) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiPopup.default;
    }
  });
});

define('pixeditor/components/ui-progress', ['exports', 'semantic-ui-ember/components/ui-progress'], function (exports, _uiProgress) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiProgress.default;
    }
  });
});

define('pixeditor/components/ui-radio', ['exports', 'semantic-ui-ember/components/ui-radio'], function (exports, _uiRadio) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiRadio.default;
    }
  });
});

define('pixeditor/components/ui-rating', ['exports', 'semantic-ui-ember/components/ui-rating'], function (exports, _uiRating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiRating.default;
    }
  });
});

define('pixeditor/components/ui-search', ['exports', 'semantic-ui-ember/components/ui-search'], function (exports, _uiSearch) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiSearch.default;
    }
  });
});

define('pixeditor/components/ui-shape', ['exports', 'semantic-ui-ember/components/ui-shape'], function (exports, _uiShape) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiShape.default;
    }
  });
});

define('pixeditor/components/ui-sidebar', ['exports', 'semantic-ui-ember/components/ui-sidebar'], function (exports, _uiSidebar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiSidebar.default;
    }
  });
});

define('pixeditor/components/ui-sticky', ['exports', 'semantic-ui-ember/components/ui-sticky'], function (exports, _uiSticky) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uiSticky.default;
    }
  });
});

define('pixeditor/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});

define("pixeditor/config-private", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var configPrivate = exports.configPrivate = { "encrypted": "U2FsdGVkX1+SiELixXz94rSBqxQOYQdfc686oYsczJ4flylrGi8nA9FCNWRUnbBAmzJY9U97qv44EIEtQg6l3qAvHAGrVxvPkKFA7mKGqX5voD/egFtScFavVsskuFfHkf3OuEjQZ7rbO4OascDotsoD6vbFzChKkIWCKg0FMN1J7Kmeg1RD5bvv9eSi0EWJ3X94GvhkiunfA7Cr2RfoycZu049Xy8gXdDYe4p2PG1T39DkiUkqeJgdj1Inb8dUiNe88lvgXRpqZKWU0nWB5C2rhEANVFvlN8PhpfJ6OVFJZpMAvF94QBhPUuUQ3YkSh08xfGIFyPVQWm7rqHjyUNEhVX2IKnMs5YwFaVTG36MMfR7fGr3yBEzx8OEhYLegFBmUAMlKXkkXjapj9uRG8RZxOgfyAtV7PmuDBGrT+DzxkMmBM6bj+t6XfTpRav63h7ktiKY/SGlRxGmT9kvwsIKqjfrdJ3GB/rw4qFhVzbUv7fVOWmsBSL6uwqW/oaTdQFI9/DMY/3HGlPYFE+qdPLD5qh+ZEfuKHFRUSAYdM8WzzcoXeQCy5Ex+vdD9RbEegRwoZxTusrQiNiLS9sZ3kny7sGmes7kLMh7ght7D+AbQXRjHa391autTjQvPmi0GzO5yRDlcXO5ReRcu4bp4HfRuUoMDsf+6FxFX1M03nXnwkd9Px5KqLxzuXbOHc/wXMMwmnCoWzo2gr/s9fAhIxC2VQYNOJZ8NhgHMve/4vRWMy7mNnpxhuKDG5fva+NDCVmKTYsZ7kEfof0CLYPakaf3+ztdOvtdwBcxWK5YO+dNm7etUPaL0EaL6Qo9DLVRZRCCHEN5GgV0tRb3mkV515eTymEMjMnn+OqYrvaVaxrXqxgiFHPwVcIy962VIqR2ius9Bpq6mijldAPmX4Nhw67wbiHuxqpHDs8hP/6+O/7jkbLHZSsT8sn4EMgfGmwt3jo/cIw/3YbSf3tIiFYjMr9g==" };
});

define('pixeditor/controllers/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    loading: false,
    loadingMessage: "",
    displayConfig: false,
    init: function init() {
      this._super.apply(this, arguments);
      this.messages = [];
    },

    actions: {
      loadCompetence: function loadCompetence(id) {
        this.transitionToRoute("competence", id);
      },
      toggleSidebar: function toggleSidebar() {
        Ember.$('#main-sidebar').sidebar('toggle');
      },
      showMessage: function showMessage(content, positive) {
        var messages = this.get("messages");
        var id = "message_" + Date.now();
        messages.pushObject({ text: content, positive: positive ? true : false, id: id });
        var that = this;
        window.setTimeout(function () {
          Ember.$("#" + id).transition({ animation: "fade", onComplete: function onComplete() {
              var messages = that.get("messages");
              messages.removeAt(0);
            }
          });
        }, 3000);
      },
      isLoading: function isLoading(message) {
        this.set("loading", true);
        this.set("loadingMessage", message);
      },
      finishedLoading: function finishedLoading() {
        this.set("loading", false);
        this.set("loadingMessage", "");
      },
      openConfiguration: function openConfiguration() {
        this.set("displayConfig", true);
      },
      configUpdated: function configUpdated() {
        this.send("refresh");
      }
    }
  });
});

define("pixeditor/controllers/competence", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    challengeCount: 0,
    childComponentMaximized: false,
    skillMode: false,
    listView: false,
    router: Ember.inject.service(),
    application: Ember.inject.controller(),
    currentChallenge: null,
    currentSkill: null,
    competence: Ember.computed.alias("model.competence"),
    challenges: Ember.computed.alias("model.challenges"),
    init: function init() {
      this._super.apply(this, arguments);
      this.listColumns = [{
        title: "Acquis",
        propertyName: "skills"
      }, {
        title: "Consigne",
        propertyName: "instructions"
      }, {
        title: "Type",
        propertyName: "type"
      }, {
        title: "Statut",
        propertyName: "status"
      }];
    },

    competenceHidden: Ember.computed("childComponentMaximized", function () {
      return this.get("childComponentMaximized") ? "hidden" : "";
    }),
    childComponentAdapter: Ember.observer("skillMode", function () {
      var skillMode = this.get("skillMode");
      var currentRoute = this.get("router.currentRouteName");
      if (skillMode) {
        this.set("listView", false);
      }
      if (skillMode && currentRoute === "competence.challenge") {
        /*let challenge = this.get("currentChallenge");
        let skillNames = challenge.get("skillNames")
        if (skills.length>0) {
          let skill = skills.get("firstObject");
          console.debug(skill);
          this.transitionToRoute("competence.skill", this.get("competence").get("id"), skill.get("id"));
        }*/
        //TODO: link to correct skill
        this.transitionToRoute("competence.index", this.get("competence").get("id"));
      } else if (!skillMode && currentRoute === "competence.skill") {
        /*let skill = this.get("currentSkill");
        let template = skill.get("template");
        if (template) {
          console.log("id");
          console.debug(template.get("id"));
          this.transitionToRoute("competence.challenge", this.get("competence").get("id"), template.get("id"));
        } else {
          this.transitionToRoute("competence.index",  this.get("competence").get("id"));
        }*/
        //TODO: link to correct challenge
        this.transitionToRoute("competence.index", this.get("competence").get("id"));
      }
    }),
    actions: {
      maximizeChildComponent: function maximizeChildComponent() {
        this.set("childComponentMaximized", true);
      },
      minimizeChildComponent: function minimizeChildComponent() {
        this.set("childComponentMaximized", false);
      },
      closeChildComponent: function closeChildComponent(refresh) {
        this.set("childComponentMaximized", false);
        this.transitionToRoute("competence", this.get("model.competence").get("id"));
        if (refresh) {
          this.send("refreshModel");
        }
      },
      refresh: function refresh() {
        this.send("closeChildComponent", true);
      },
      setListView: function setListView() {
        this.set("listView", true);
      },
      setGridView: function setGridView() {
        this.set("listView", false);
      },
      newTemplate: function newTemplate() {
        this.transitionToRoute("competence.new-template", this.get("model.competence").get("id"));
      },
      soon: function soon() {
        this.get("application").send("showMessage", "Disponible bientôt...", true);
      },
      addChallenge: function addChallenge(challenge) {
        this.get("challenges").addObject(challenge);
        this.set("challengeCount", this.get("challengeCount") + 1);
      }
    },
    size: Ember.computed("router.currentRouteName", function () {
      if (this.get("router.currentRouteName") == 'competence.index') {
        return "full";
      } else {
        return "half";
      }
    })
  });
});

define('pixeditor/controllers/competence/challenge', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    config: Ember.inject.service(),
    maximized: false,
    copyOperation: false,
    edition: false,
    creation: false,
    wasMaximized: false,
    updateCache: true,
    challenge: Ember.computed.alias("model"),
    competence: Ember.inject.controller(),
    application: Ember.inject.controller(),
    storage: Ember.inject.service(),
    pixConnector: Ember.inject.service(),
    mayUpdateCache: Ember.computed.alias("pixConnector.connected"),
    actions: {
      showIllustration: function showIllustration(className) {
        Ember.$(".ui." + className + ".small.modal").modal({ dimmerSettings: { closable: true } }).modal('show');
      },
      maximize: function maximize() {
        this.set("maximized", true);
        this.get("competence").send("maximizeChildComponent");
      },
      minimize: function minimize() {
        this.set("maximized", false);
        this.get("competence").send("minimizeChildComponent");
      },
      close: function close() {
        this.set("maximized", false);
        this.get("competence").send("closeChildComponent");
      },
      preview: function preview() {
        var challenge = this.get("challenge");
        window.open(challenge.get("preview"), challenge.get("id"));
      },
      openAirtable: function openAirtable() {
        var challenge = this.get("challenge");
        var config = this.get("config");
        window.open(config.get("airtableUrl") + config.get("tableChallenges") + "/" + challenge.get("id"), "airtable");
      },
      copyLink: function copyLink() {
        this.set("copyOperation", true);
        Ember.run.scheduleOnce('afterRender', this, function () {
          var element = document.getElementById("copyZone");
          element.select();
          try {
            var successful = document.execCommand("copy");
            if (!successful) {
              this.get("application").send("showMessage", "Erreur lors de la copie", false);
            } else {
              this.get("application").send("showMessage", "lien copié", true);
            }
          } catch (err) {
            this.get("application").send("showMessage", "Erreur lors de la copie", false);
          }
          this.set("copyOperation", false);
        });
      },
      edit: function edit() {
        var state = this.get("maximized");
        this.set("wasMaximized", state);
        this.send("maximize");
        this.set("edition", true);
        Ember.$(".challenge-data").scrollTop(0);
      },
      cancelEdit: function cancelEdit() {
        this.set("edition", false);
        var challenge = this.get("challenge");
        challenge.rollbackAttributes();
        var previousState = this.get("wasMaximized");
        if (!previousState) {
          this.send("minimize");
        }
        this.get("application").send("showMessage", "Modification annulée", true);
      },
      save: function save() {
        var _this = this;

        this.get("application").send("isLoading");
        return this._saveChallenge().then(function () {
          _this.get("application").send("finishedLoading");
          _this.get("application").send("showMessage", "Épreuve mise à jour", true);
        }).catch(function () {
          _this.get("application").send("finishedLoading");
          _this.get("application").send("showMessage", "Erreur lors de la mise à jour", false);
        });
      },
      duplicate: function duplicate() {
        this.get("application").send("showMessage", "Disponible bientôt...", true);
      }
    },
    _saveChallenge: function _saveChallenge() {
      var _this2 = this;

      var challenge = this.get("challenge");
      // check for illustration upload
      var illustration = challenge.get("illustration");
      var uploadIllustration = void 0;
      if (illustration && illustration.length > 0 && illustration.get('firstObject').file) {
        var file = illustration.get('firstObject').file;
        this.get("application").send("isLoading", "Envoi de l'illustration...");
        uploadIllustration = this.get("storage").uploadFile(file);
      } else {
        uploadIllustration = Promise.resolve(false);
      }

      // check for attachments upload
      var attachments = challenge.get("attachments");
      var uploadAttachments = void 0;
      var uploadAttachmentRequired = false;
      if (attachments) {
        var storage = this.get("storage");
        uploadAttachments = attachments.reduce(function (current, value) {
          if (value.file) {
            current.push(storage.uploadFile(value.file));
            uploadAttachmentRequired = true;
          } else {
            current.push(Promise.resolve(value));
          }
          return current;
        }, []);
      }

      return uploadIllustration.then(function (newIllustration) {
        if (newIllustration) {
          challenge.set("illustration", [{ url: newIllustration.url, filename: newIllustration.filename }]);
        }
        if (uploadAttachmentRequired) {
          _this2.get("application").send("isLoading", "Envoi des pièces jointes...");
          return Promise.all(uploadAttachments);
        } else {
          return Promise.resolve(false);
        }
      }).then(function (newAttachments) {
        _this2.get("application").send("isLoading", "Enregistrement...");
        if (newAttachments) {
          challenge.set("attachments", newAttachments);
        }
        return challenge.save();
      }).then(function () {
        _this2.set("edition", false);
        var previousState = _this2.get("wasMaximized");
        if (!previousState) {
          _this2.send("minimize");
        }
        if (_this2.get("mayUpdateCache") && _this2.get("updateCache")) {
          _this2.get("application").send("isLoading", "Mise à jour du cache...");
          return _this2.get("pixConnector").updateCache(challenge).catch(function () {
            _this2.get("application").send("showMessage", "Impossible de mettre à jour le cache", false);
            return Promise.resolve(true);
          });
        } else {
          return Promise.resolve(true);
        }
      });
    }
  });
});

define("pixeditor/controllers/competence/new-template", ["exports", "pixeditor/controllers/competence/challenge"], function (exports, _challenge) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _challenge.default.extend({
    creation: true,
    mayUpdateCache: false,
    actions: {
      cancelEdit: function cancelEdit() {
        this.set("edition", false);
        this.get("application").send("showMessage", "Création annulée", true);
        this.get("competence").send("closeChildComponent");
      },
      save: function save() {
        var _this = this;

        this.get("application").send("isLoading");
        return this._saveChallenge().then(function () {
          _this.get("application").send("finishedLoading");
          _this.get("application").send("showMessage", "Prototype enregistré", true);
          var challenge = _this.get("challenge");
          _this.get("competence").send("addChallenge", challenge);
          _this.transitionToRoute("competence.challenge", challenge.get("competence")[0], challenge.get("id"));
        }).catch(function () {
          _this.get("application").send("finishedLoading");
          _this.get("application").send("showMessage", "Erreur lors de la création", false);
        });
      }
    }
  });
});

define('pixeditor/controllers/competence/skill', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    maximized: false,
    competence: Ember.inject.controller(),
    application: Ember.inject.controller(),
    config: Ember.inject.service(),
    skill: Ember.computed.alias("model"),
    wasMaximized: false,
    edition: false,
    actions: {
      maximize: function maximize() {
        this.set("maximized", true);
        this.get("competence").send("maximizeChildComponent");
      },
      minimize: function minimize() {
        this.set("maximized", false);
        this.get("competence").send("minimizeChildComponent");
      },
      close: function close() {
        this.set("maximized", false);
        this.get("competence").send("closeChildComponent");
      },
      preview: function preview() {
        var challenge = this.get("skill").get("template");
        window.open(challenge.get("preview"), challenge.get("id"));
      },
      openAirtable: function openAirtable() {
        var skill = this.get("skill");
        var config = this.get("config");
        window.open(config.get("airtableUrl") + config.get("tableSkills") + "/" + skill.get("id"), "airtable");
      },
      edit: function edit() {
        var state = this.get("maximized");
        this.set("wasMaximized", state);
        this.send("maximize");
        this.set("edition", true);
        Ember.$(".skill-data").scrollTop(0);
      },
      cancelEdit: function cancelEdit() {
        this.set("edition", false);
        var skill = this.get("skill");
        skill.rollbackAttributes();
        var previousState = this.get("wasMaximized");
        if (!previousState) {
          this.send("minimize");
        }
        this.get("application").send("showMessage", "Modification annulée", true);
      },
      save: function save() {
        var _this = this;

        this.get("application").send("isLoading");
        var skill = this.get("skill");
        skill.save().then(function () {
          _this.get("application").send("finishedLoading");
          _this.get("application").send("showMessage", "Acquis mis à jour", true);
        }).catch(function (error) {
          console.error(error);
          _this.get("application").send("finishedLoading");
          _this.get("application").send("showMessage", "Erreur lors de la mise à jour de l'acquis", true);
        });
      }
    }
  });
});

define("pixeditor/ember-airtable/tests/addon.lint-test", [], function () {
  "use strict";
});

define('pixeditor/helpers/and', ['exports', 'ember-truth-helpers/helpers/and'], function (exports, _and) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(exports, 'and', {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});

define('pixeditor/helpers/app-version', ['exports', 'pixeditor/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});

define('pixeditor/helpers/eq', ['exports', 'ember-truth-helpers/helpers/equal'], function (exports, _equal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(exports, 'equal', {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});

define('pixeditor/helpers/file-queue', ['exports', 'ember-file-upload/helpers/file-queue'], function (exports, _fileQueue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _fileQueue.default;
    }
  });
});

define('pixeditor/helpers/fixed-grid-layout', ['exports', 'ember-collection/layouts/grid'], function (exports, _grid) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Helper.helper(function (params) {
    return new _grid.default(params[0], params[1]);
  });
});

define('pixeditor/helpers/gt', ['exports', 'ember-truth-helpers/helpers/gt'], function (exports, _gt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(exports, 'gt', {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});

define('pixeditor/helpers/gte', ['exports', 'ember-truth-helpers/helpers/gte'], function (exports, _gte) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(exports, 'gte', {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});

define('pixeditor/helpers/is-array', ['exports', 'ember-truth-helpers/helpers/is-array'], function (exports, _isArray) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(exports, 'isArray', {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});

define('pixeditor/helpers/is-equal', ['exports', 'ember-truth-helpers/helpers/is-equal'], function (exports, _isEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(exports, 'isEqual', {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});

define('pixeditor/helpers/lt', ['exports', 'ember-truth-helpers/helpers/lt'], function (exports, _lt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(exports, 'lt', {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});

define('pixeditor/helpers/lte', ['exports', 'ember-truth-helpers/helpers/lte'], function (exports, _lte) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(exports, 'lte', {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});

define('pixeditor/helpers/map-value', ['exports', 'semantic-ui-ember/helpers/map-value'], function (exports, _mapValue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _mapValue.default;
    }
  });
  Object.defineProperty(exports, 'mapValue', {
    enumerable: true,
    get: function () {
      return _mapValue.mapValue;
    }
  });
});

define('pixeditor/helpers/mixed-grid-layout', ['exports', 'ember-collection/layouts/mixed-grid'], function (exports, _mixedGrid) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Helper.helper(function (params) {
    return new _mixedGrid.default(params[0]);
  });
});

define('pixeditor/helpers/not-eq', ['exports', 'ember-truth-helpers/helpers/not-equal'], function (exports, _notEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(exports, 'notEq', {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});

define('pixeditor/helpers/not', ['exports', 'ember-truth-helpers/helpers/not'], function (exports, _not) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(exports, 'not', {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});

define('pixeditor/helpers/or', ['exports', 'ember-truth-helpers/helpers/or'], function (exports, _or) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(exports, 'or', {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});

define('pixeditor/helpers/percentage-columns-layout', ['exports', 'ember-collection/layouts/percentage-columns'], function (exports, _percentageColumns) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Helper.helper(function (params) {
    return new _percentageColumns.default(params[0], params[1], params[2]);
  });
});

define('pixeditor/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});

define('pixeditor/helpers/simple-mde-preview', ['exports', 'ember-simplemde/helpers/simple-mde-preview'], function (exports, _simpleMdePreview) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _simpleMdePreview.default;
    }
  });
  Object.defineProperty(exports, 'simpleMdePreview', {
    enumerable: true,
    get: function () {
      return _simpleMdePreview.simpleMdePreview;
    }
  });
});

define('pixeditor/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});

define('pixeditor/helpers/xor', ['exports', 'ember-truth-helpers/helpers/xor'], function (exports, _xor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(exports, 'xor', {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});

define('pixeditor/initializers/allow-link-action', ['exports', 'ember-link-action/initializers/allow-link-action'], function (exports, _allowLinkAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _allowLinkAction.default;
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function () {
      return _allowLinkAction.initialize;
    }
  });
});

define('pixeditor/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'pixeditor/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var name = void 0,
      version = void 0;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});

define('pixeditor/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});

define('pixeditor/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});

define('pixeditor/initializers/export-application-global', ['exports', 'pixeditor/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});

define("pixeditor/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});

define('pixeditor/mixins/base', ['exports', 'semantic-ui-ember/mixins/base'], function (exports, _base) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _base.default;
    }
  });
});

define('pixeditor/mixins/link-action', ['exports', 'ember-link-action/mixins/link-action'], function (exports, _linkAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _linkAction.default;
    }
  });
});

define('pixeditor/models/area', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    name: _emberData.default.attr(),
    competenceIds: _emberData.default.attr(),
    competences: _emberData.default.hasMany('competence')
  });
});

define("pixeditor/models/author", ["exports", "ember-data"], function (exports, _emberData) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    name: _emberData.default.attr(),
    liteValue: _emberData.default.attr(),
    lite: Ember.computed("liteValue", function () {
      var liteValue = this.get("liteValue");
      if (liteValue === "Non") {
        return false;
      }
      return true;
    })
  });
});

define('pixeditor/models/challenge', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    competence: _emberData.default.attr(),
    instructions: _emberData.default.attr(),
    type: _emberData.default.attr(),
    suggestion: _emberData.default.attr(),
    answers: _emberData.default.attr(),
    t1: _emberData.default.attr(),
    t2: _emberData.default.attr(),
    t3: _emberData.default.attr(),
    illustration: _emberData.default.attr(),
    attachments: _emberData.default.attr(),
    pedagogy: _emberData.default.attr(),
    author: _emberData.default.attr(),
    declinable: _emberData.default.attr(),
    version: _emberData.default.attr(),
    alternatives: _emberData.default.hasMany('challenge', { readOnly: true }),
    genealogy: _emberData.default.attr(),
    skillNames: _emberData.default.attr({ readOnly: true }),
    workbench: false,
    status: _emberData.default.attr(),
    preview: _emberData.default.attr(),
    template: Ember.computed('genealogy', function () {
      return this.get('genealogy') == 'Prototype 1';
    }),
    validated: Ember.computed('status', function () {
      var status = this.get('status');
      return ["validated", "validé sans test", "pré-validé"].includes(status);
    }),
    notDeclinable: Ember.computed('declinable', function () {
      var declinable = this.get("declinable");
      return declinable && declinable === "non";
    }),
    alternativeCount: 0,
    statusCSS: Ember.computed('status', function () {
      var status = this.get('status');
      switch (status) {
        case "validé":
          return "validated";
        case "validé sans test":
          return "validated_no_test";
        case "proposé":
          return "suggested";
        case "pré-validé":
          return "prevalidated";
        case "archivé":
          return "archived";
      }
    })
  });
});

define('pixeditor/models/competence', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var findTubeName = /^@([^\d]+)(\d)$/;

  exports.default = _emberData.default.Model.extend({
    area: _emberData.default.belongsTo('area'),
    name: _emberData.default.attr('string', { readOnly: true }),
    code: _emberData.default.attr(),
    skills: _emberData.default.hasMany('skill'),
    tubes: Ember.computed('skills', function () {
      var skills = this.get('skills');
      var set = skills.reduce(function (current, skill) {
        var result = findTubeName.exec(skill.get("name"));
        if (result && result[1] && result[2]) {
          var tubeName = result[1];
          var index = parseInt(result[2]);
          if (!current[tubeName]) {
            current[tubeName] = [false, false, false, false, false, false, false];
          }
          current[tubeName][index - 1] = skill;
        }
        return current;
      }, {});
      return Object.keys(set).reduce(function (current, key) {
        current.push({ name: key, skills: set[key] });
        return current;
      }, []);
    })
  });
});

define('pixeditor/models/skill', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    name: _emberData.default.attr(),
    competence: _emberData.default.belongsTo('competence', { readOnly: true }),
    challengeIds: _emberData.default.attr(),
    clue: _emberData.default.attr(),
    status: _emberData.default.attr(),
    description: _emberData.default.attr(),
    challenges: _emberData.default.hasMany('challenge', { readOnly: true }),
    workbenchChallenges: _emberData.default.hasMany('workbenchChallenge', { readOnly: true }),
    tutoSolutionIds: _emberData.default.attr(),
    tutoSolutions: _emberData.default.hasMany('tutorial', { readOnly: true }),
    tutoMoreIds: _emberData.default.attr(),
    tutoMore: _emberData.default.hasMany('tutorial', { readOnly: true }),
    template: _emberData.default.belongsTo('challenge', { inverse: null, readOnly: true }),
    workbenchCount: Ember.computed('workbenchChallenges', function () {
      return this.get("workbenchChallenges").get('length');
    }),
    descriptionCSS: Ember.computed("description", function () {
      var clue = this.get("description");
      if (clue && clue.length > 0) {
        return "described";
      } else {
        return "undescribed";
      }
    }),
    clueCSS: Ember.computed("status", function () {
      var status = this.get("status");
      if (status === "Validé") {
        return "validated";
      } else {
        return "suggested";
      }
    })
  });
});

define('pixeditor/models/tutorial', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    title: _emberData.default.attr(),
    duration: _emberData.default.attr(),
    source: _emberData.default.attr(),
    format: _emberData.default.attr(),
    link: _emberData.default.attr(),
    license: _emberData.default.attr()
  });
});

define('pixeditor/models/workbench-challenge', ['exports', 'pixeditor/models/challenge'], function (exports, _challenge) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _challenge.default.extend({
    workbench: true
  });
});

define('pixeditor/models/workbench-skill', ['exports', 'ember-data'], function (exports, _emberData) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberData.default.Model.extend({
    skillId: _emberData.default.attr(),
    challenges: _emberData.default.hasMany('workbenchChallenge'),
    challengeIds: _emberData.default.attr()
  });
});

define('pixeditor/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});

define('pixeditor/router', ['exports', 'pixeditor/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {
    this.route('competence', { path: '/competence/:competence_id' }, function () {
      this.route('new-template', { path: '/challenge' });
      this.route('challenge', { path: '/challenge/:challenge_id' });
      this.route('skill', { path: '/skill/:skill_id' });
    });
  });

  exports.default = Router;
});

define('pixeditor/routes/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    configured: false,
    config: Ember.inject.service(),
    pixConnector: Ember.inject.service(),
    beforeModel: function beforeModel() {
      if (this.get("config").check()) {
        this.set("configured", true);
      } else {
        this.set("configured", false);
        Ember.run.scheduleOnce('afterRender', this, function () {
          this.controller.send("openConfiguration");
        });
      }
    },
    model: function model() {
      if (this.get("configured")) {
        var areas = void 0;
        var store = this.get('store');
        return store.findAll('area').then(function (data) {
          areas = data;
          return store.findAll('competence');
        }).then(function (competences) {
          areas.forEach(function (area) {
            var ids = area.get('competenceIds');
            area.set('competences', competences.filter(function (competence) {
              return ids.includes(competence.id);
            }));
          });
          return areas;
        });
      }
    },
    afterModel: function afterModel() {
      if (this.get("configured")) {
        this.get("pixConnector").connect();
      }
    },

    actions: {
      loading: function loading(transition) {
        var controller = this.controller;
        if (controller) {
          controller.set('loading', true);
          transition.promise.finally(function () {
            controller.set('loading', false);
          });
          return false;
        } else {
          return true;
        }
      },
      refresh: function refresh() {
        this.refresh();
      }
    }
  });
});

define('pixeditor/routes/competence', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    paginatedQuery: Ember.inject.service(),
    model: function model(params) {
      var _this = this;

      var competence = void 0,
          skills = void 0,
          workbenchChallengeIdsBySkill = void 0;
      var store = this.get("store");
      return store.findRecord("competence", params.competence_id).then(function (data) {
        competence = data;
        // get skills
        return store.query("skill", { filterByFormula: "FIND('" + competence.get("code") + "', {Compétence})", sort: [{ field: "Nom", direction: "asc" }] });
      }).then(function (data) {
        skills = data;
        competence.set("skills", skills);
        var skillIds = skills.reduce(function (current, skill) {
          current.push(skill.get("id"));
          return current;
        }, []);
        var idsFormula = "OR({Acquis prod} = '" + skillIds.join("',{Acquis prod} ='") + "')";
        // get workbench skills
        return store.query("workbenchSkill", { filterByFormula: idsFormula });
      }).then(function (data) {
        // get challenges linked to skills
        var challengeIds = skills.reduce(function (current, skill) {
          return current.concat(skill.get("challengeIds"));
        }, []);
        var recordsText = "OR(RECORD_ID() = '" + challengeIds.join("',RECORD_ID() ='") + "')";
        var bySkillFilter = "AND(" + recordsText + ", Statut != 'archive')";

        // get challenges linked to workbench skills
        workbenchChallengeIdsBySkill = data.reduce(function (current, workbenchSkill) {
          var challengeIds = workbenchSkill.get("challengeIds");
          if (challengeIds) {
            current[workbenchSkill.get("skillId")] = challengeIds;
          }
          return current;
        }, {});

        var workbenchChallengeIds = Object.values(workbenchChallengeIdsBySkill).reduce(function (current, ids) {
          return current.concat(ids);
        }, []);

        var workbenchRecordsText = "OR(RECORD_ID() = '" + workbenchChallengeIds.join("',RECORD_ID() ='") + "')";
        //TODO: replace Décliné 1 by generic "alternate" status
        var byWorkbenchSkillFilter = "AND(" + workbenchRecordsText + ", Statut != 'archive', {Généalogie} = 'Décliné 1')";

        // get challenges linked to competence
        var byCompetenceFilter = "AND(FIND('" + competence.get("code") + "', competences) , Statut != 'archive', Acquix = BLANK(), {Généalogie} = 'Prototype 1')";

        var pq = _this.get("paginatedQuery");
        return Ember.RSVP.hash({
          bySkillProd: pq.query("challenge", { filterByFormula: bySkillFilter }),
          byCompetenceProd: pq.query("challenge", { filterByFormula: byCompetenceFilter }),
          bySkillWorkbench: pq.query("workbenchChallenge", { filterByFormula: byWorkbenchSkillFilter })
        });
      }).then(function (data) {
        var skillChallenges = data.bySkillProd;
        var workbenchChallenges = data.bySkillWorkbench;
        var orderedChallenges = skillChallenges.reduce(function (current, challenge) {
          current[challenge.get("id")] = challenge;
          return current;
        }, {});
        var orderedWorkbenchChallenges = workbenchChallenges.reduce(function (current, challenge) {
          current[challenge.get("id")] = challenge;
          return current;
        }, {});
        skills.forEach(function (skill) {
          var template = null;
          var alternativeCount = 0;
          var ids = skill.get("challengeIds");
          if (ids) {
            var set = ids.reduce(function (current, id) {
              if (orderedChallenges[id]) {
                current.push(orderedChallenges[id]);
                if (orderedChallenges[id].get("template") && (!template || orderedChallenges[id].get("validated"))) {
                  template = orderedChallenges[id];
                } else {
                  alternativeCount++;
                }
              }
              return current;
            }, []);
            skill.set("challenges", set);
            if (template) {
              skill.set("template", template);
            }
            skill.set('alternativeCount', alternativeCount);
            if (workbenchChallengeIdsBySkill[skill.get("id")]) {
              var _set = workbenchChallengeIdsBySkill[skill.get("id")].reduce(function (current, id) {
                if (orderedWorkbenchChallenges[id]) {
                  current.push(orderedWorkbenchChallenges[id]);
                }
                return current;
              }, []);
              skill.set("workbenchChallenges", _set);
            }
          }
        });
        var challenges = data.byCompetenceProd.reduce(function (current, value) {
          current.push(value);
          return current;
        }, Object.values(orderedChallenges).filter(function (value) {
          return value.get("template");
        }));
        return {
          competence: competence,
          challenges: challenges,
          workbenchChallenges: workbenchChallenges
        };
      });
    },
    setupController: function setupController(controller, model) {
      this._super(controller, model);
      controller.set("challengeMaximized", false);
      controller.set("challengeCount", model.challenges.length);
    },

    actions: {
      refreshModel: function refreshModel() {
        this.refresh();
      }
    }
  });
});

define("pixeditor/routes/competence/challenge", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    model: function model(params) {
      return this.get("store").findRecord("challenge", params.challenge_id);
    },
    setupController: function setupController(controller, model) {
      this._super(controller, model);
      controller.set("maximized", false);
      controller.set("edition", false);
      if (!model.get("skillNames")) {
        this.controllerFor("competence").set("listView", true);
      }
      this.controllerFor("competence").set("currentChallenge", model);
    },

    actions: {
      willTransition: function willTransition(transition) {
        if (this.controller.get("edition") && !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
          transition.abort();
        } else {
          return true;
        }
      }
    }
  });
});

define("pixeditor/routes/competence/new-template", ["exports", "pixeditor/routes/competence/challenge"], function (exports, _challenge) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _challenge.default.extend({
    templateName: "competence/challenge",
    model: function model() {
      return this.get("store").createRecord("challenge", { competence: [this.modelFor("competence").competence.id], status: "proposé", t1: true, t2: true, t3: true, genealogy: "Prototype 1" });
    },
    setupController: function setupController(controller, model) {
      controller.send("edit");
      // required because 'alias' does not seem to work with extended controller
      controller.set("challenge", model);
    }
  });
});

define("pixeditor/routes/competence/skill", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    model: function model(params) {
      return this.get("store").findRecord("skill", params.skill_id);
    },
    setupController: function setupController(controller, model) {
      this._super(controller, model);
      controller.set("maximized", false);
      controller.set("edition", false);
      this.controllerFor("competence").set("skillMode", true);
      this.controllerFor("competence").set("currentSkill", model);
    },

    actions: {
      willTransition: function willTransition(transition) {
        if (this.controller.get("edition") && !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
          transition.abort();
        } else {
          return true;
        }
      }
    }
  });
});

define('pixeditor/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    classNames: ['index']
  });
});

define('pixeditor/serializers/application', ['exports', 'ember-airtable/serializer'], function (exports, _serializer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _serializer.default.extend({
    payloadKeyFromModelName: function payloadKeyFromModelName(modelName) {
      if (modelName === 'area') {
        return 'Domaines';
      }
      return this._super(modelName);
    },
    serializeHasMany: function serializeHasMany(snapshot, json, relationship) {
      if (relationship.options && relationship.options.readOnly) {
        return;
      }
      return this._super(snapshot, json, relationship);
    },
    serializeBelongsTo: function serializeBelongsTo(snapshot, json, relationship) {
      if (relationship.options && relationship.options.readOnly) {
        return;
      }
      return this._super(snapshot, json, relationship);
    }
  });
});

define("pixeditor/serializers/area", ["exports", "pixeditor/serializers/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({

    attrs: {
      name: "Nom",
      competenceIds: "Competences (identifiants)"
    },

    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return 'Domaines';
    }

  });
});

define("pixeditor/serializers/author", ["exports", "pixeditor/serializers/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({

    attrs: {
      name: "Nom",
      liteValue: "Lite"
    },

    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return 'Auteurs';
    }
  });
});

define('pixeditor/serializers/challenge', ['exports', 'pixeditor/serializers/application'], function (exports, _application) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    //TODO: remove this when field id has been removed
    primaryKey: 'Record ID',

    attrs: {
      instructions: "Consigne",
      genealogy: "Généalogie",
      skillNames: "acquis",
      type: "Type d'épreuve",
      suggestion: "Propositions",
      answers: "Bonnes réponses",
      t1: "T1 - Espaces, casse & accents",
      t2: "T2 - Ponctuation",
      t3: "T3 - Distance d'édition",
      illustration: "Illustration de la consigne",
      attachments: "Pièce jointe",
      pedagogy: "Type péda",
      author: "Auteur",
      declinable: "Déclinable",
      status: "Statut",
      preview: "Preview",
      competence: "competences"
    },

    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return 'Epreuves';
    },

    extractAttributes: function extractAttributes() {
      var attributes = this._super.apply(this, arguments);
      ["t1", "t2", "t3"].forEach(function (key) {
        if (attributes[key]) {
          if (attributes[key] === "Activé") {
            attributes[key] = true;
          } else {
            attributes[key] = false;
          }
        }
      });
      return attributes;
    },
    serializeAttribute: function serializeAttribute(snapshot, json, key) {
      if (["t1", "t2", "t3"].includes(key)) {
        var payloadKey = this._getMappedKey(key, snapshot.type);
        var value = snapshot.attr(key);
        if (value) {
          json[payloadKey] = "Activé";
        } else {
          json[payloadKey] = "Désactivé";
        }
      } else {
        return this._super.apply(this, arguments);
      }
    }
  });
});

define("pixeditor/serializers/competence", ["exports", "pixeditor/serializers/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({

    attrs: {
      name: "Référence",
      code: "Sous-domaine"
    },
    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return 'Competences';
    }
  });
});

define("pixeditor/serializers/skill", ["exports", "pixeditor/serializers/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    attrs: {
      name: "Nom",
      clue: "Indice",
      status: "Statut de l'indice",
      challengeIds: "Epreuves",
      description: "Description",
      tutoSolutionIds: "Comprendre",
      tutoMoreIds: "En savoir plus"
    },
    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return "Acquis";
    }
  });
});

define("pixeditor/serializers/tutorial", ["exports", "pixeditor/serializers/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    attrs: {
      title: "Titre",
      duration: "Durée",
      source: "Source",
      format: "Format",
      link: "Lien",
      license: "License"
    },

    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return 'Tutoriels';
    }

  });
});

define('pixeditor/serializers/workbench-challenge', ['exports', 'pixeditor/serializers/challenge'], function (exports, _challenge) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _challenge.default.extend({
    //TODO: remove this when field id has been removed from Production challenges table
    primaryKey: 'Record ID'

  });
});

define("pixeditor/serializers/workbench-skill", ["exports", "pixeditor/serializers/application"], function (exports, _application) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _application.default.extend({
    attrs: {
      skillId: "Acquis prod",
      challengeIds: "Epreuves"
    },
    payloadKeyFromModelName: function payloadKeyFromModelName() {
      return "Acquis";
    }
  });
});

define('pixeditor/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});

define("pixeditor/services/config", ["exports", "pixeditor/config-private", "cryptojs"], function (exports, _configPrivate, _cryptojs) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    store: Ember.inject.service(),
    init: function init() {
      this.localConfigKeys = ["airtableKey", "configKey", "author", "lite"];
      this.localConfigKeysOptional = ["pixUser", "pixPassword"];
    },
    check: function check() {
      var localConfigCorrectlyLoaded = this.load();
      var privateConfigDecrypted = this.decrypt();
      return localConfigCorrectlyLoaded && privateConfigDecrypted;
    },

    authors: Ember.computed("airtableKey", "configKey", "airtableEditorBase", function () {
      try {
        return this.get("store").query("author", { sort: [{ field: "Nom", direction: "asc" }] });
      } catch (error) {
        return [];
      }
    }),
    authorNames: Ember.computed("authors", function () {
      return this.get("authors").reduce(function (current, value) {
        current.push(value.get("name"));
        return current;
      }, []);
    }),
    load: function load() {
      var _this = this;

      try {
        var localConfig = localStorage.getItem("pix-config");
        if (localConfig) {
          var incomplete = false;
          localConfig = JSON.parse(localConfig);
          this.localConfigKeys.forEach(function (key) {
            if (typeof localConfig[key] == "undefined") {
              incomplete = true;
            } else {
              _this.set(key, localConfig[key]);
            }
          });
          this.localConfigKeysOptional.forEach(function (key) {
            if (typeof localConfig[key] !== "undefined") {
              _this.set(key, localConfig[key]);
            }
          });
          if (incomplete) {
            throw "local config incomplete";
          }
        } else {
          throw "no local config";
        }
      } catch (error) {
        console.error(error);
        return false;
      }
      return true;
    },
    decrypt: function decrypt() {
      var _this2 = this;

      try {
        var key = this.get("configKey");
        var value = _cryptojs.default.AES.decrypt(_configPrivate.configPrivate.encrypted, key);
        var encryptedConfig = JSON.parse(value.toString(_cryptojs.default.enc.Utf8));
        Object.keys(encryptedConfig).forEach(function (key) {
          _this2.set(key, encryptedConfig[key]);
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    save: function save() {
      var _this3 = this;

      var localConfig = this.localConfigKeys.reduce(function (current, key) {
        current[key] = _this3.get(key);
        return current;
      }, {});
      localConfig = this.localConfigKeysOptional.reduce(function (current, key) {
        var value = _this3.get(key);
        if (value && typeof value !== "undefined" && (typeof value.length === "undefined" || value.length > 0)) {
          current[key] = value;
        }
        return current;
      }, localConfig);
      localStorage.setItem("pix-config", JSON.stringify(localConfig));
    }
  });
});

define('pixeditor/services/file-queue', ['exports', 'ember-file-upload/services/file-queue'], function (exports, _fileQueue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _fileQueue.default;
    }
  });
});

define('pixeditor/services/paginated-query', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    store: Ember.inject.service(),
    query: function query(model, parameters) {
      var store = this.get("store");
      function queryPage(model, parameters, current) {
        if (!current) {
          current = Ember.A();
        }
        return store.query(model, parameters).then(function (result) {
          current.pushObjects(result.toArray());
          if (result.meta && result.meta.offset) {
            parameters.offset = result.meta.offset;
            return queryPage(model, parameters, current);
          } else {
            return current;
          }
        });
      }
      return queryPage(model, parameters);
    }
  });
});

define('pixeditor/services/pix-connector', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    config: Ember.inject.service(),
    ajax: Ember.inject.service(),
    tokens: false,
    connected: false,
    connect: function connect() {
      var _this = this;

      var config = this.get("config");
      var user = config.get("pixUser");
      var password = config.get("pixPassword");
      if (user && user.length > 0 && password && password.length > 0) {
        var data = {
          data: {
            data: {
              attributes: {
                email: config.get("pixUser"),
                password: config.get("pixPassword")
              }
            }
          },
          headers: {
            "Content-type": "application/json"
          }
        };
        var requests = [this.get("ajax").post(config.get("pixStaging") + "/api/authentications", data), this.get("ajax").post(config.get("pixWorkbench") + "/api/authentications", data)];
        Promise.all(requests).then(function (responses) {
          _this.set("tokens", {
            staging: responses[0].data.attributes.token,
            preview: responses[1].data.attributes.token
          });
          _this.set("connected", true);
        }).catch(function () {
          _this.set("connected", false);
        });
      } else {
        this.set("connected", false);
      }
    },
    updateCache: function updateCache(challenge) {
      var _this2 = this;

      if (this.get("connected")) {
        var workbench = challenge.get("workbench");
        var url = void 0,
            token = void 0;
        if (workbench) {
          url = this.get("config").get("pixWorkbench") + "/api/challenges/" + challenge.get("id");
          token = this.get("tokens").workbench;
        } else {
          url = this.get("config").get("pixStaging") + "/api/challenges/" + challenge.get("id");
          token = this.get("tokens").staging;
        }
        var data = {
          headers: {
            Authorization: "Bearer " + token
          }
        };
        return this.get("ajax").post(url, data).then(function () {
          return _this2.get("ajax").post(url + "/solution", data);
        }).catch(function (error) {
          return Promise.reject(error);
        });
      } else {
        return Promise.reject();
      }
    }
  });
});

define('pixeditor/services/storage', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    config: Ember.inject.service(),
    ajax: Ember.inject.service(),
    getExtension: function getExtension(filename) {
      return filename.split(".").pop();
    },
    uploadFile: function uploadFile(file) {
      var url = this.get("config").get("storagePost") + Date.now() + "." + this.getExtension(file.get("name"));
      var that = this;
      return this.getStorageToken().then(function (token) {
        return file.uploadBinary(url, { method: "put", headers: { "X-Auth-Token": token } }).catch(function (error) {
          if (error.response && error.response.status === 401) {
            // token expired: get a new one
            return that.getStorageToken(true).then(function (token) {
              return file.uploadBinary(url, { method: "PUT", headers: { "X-Auth-Token": token } });
            });
          } else {
            return Promise.reject(error);
          }
        });
      }).then(function () {
        return { url: url, filename: file.get("name") };
      });
    },
    uploadFiles: function uploadFiles(files) {
      var requests = [];
      for (var i = 0; i < files.length; i++) {
        requests.push(this.uploadFile(files[i]));
      }
      return Promise.all(requests);
    },
    getStorageToken: function getStorageToken(renew) {
      var config = this.get("config");
      if (!renew && typeof config.get("storageToken") !== "undefined") {
        return Promise.resolve(config.get("storageToken"));
      } else {
        var data = {
          "auth": {
            "tenantName": config.get("storageTenant"),
            "passwordCredentials": {
              "username": config.get("storageUser"),
              "password": config.get("storagePassword")
            }
          }
        };
        return this.get("ajax").post(config.get("storageAuth"), { data: data, headers: { "Content-type": "application/json" } }).then(function (response) {
          config.set("storageToken", response.token);
          return config.get("storageToken");
        });
      }
    }
  });
});

define("pixeditor/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ZtbUkW4X", "block": "{\"symbols\":[\"message\"],\"statements\":[[6,\"div\"],[9,\"class\",\"ui container fluid application pushable\"],[7],[0,\"\\n  \"],[6,\"div\"],[10,\"class\",[25,\"concat\",[\"ui page dimmer inverted\",[25,\"if\",[[20,[\"loading\"]],\" active\",\"\"],null]],null],null],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"ui text loader\"],[7],[1,[18,\"loadingMessage\"],false],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[1,[25,\"main-sidebar\",null,[[\"areas\",\"loadCompetence\",\"class\",\"openConfiguration\"],[[20,[\"model\"]],[25,\"action\",[[19,0,[]],\"loadCompetence\"],null],[25,\"concat\",[\"inverted menu left vertical main-sidebar wide \",[25,\"if\",[[25,\"eq\",[[20,[\"currentRouteName\"]],\"index\"],null],\"visible\",\"\"],null]],null],[25,\"action\",[[19,0,[]],\"openConfiguration\"],null]]]],false],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"pusher\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ui vertical inverted icon menu main-menu\"],[7],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"toggleSidebar\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"bars icon\"],[7],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"main\"],[7],[0,\"\\n      \"],[1,[18,\"outlet\"],false],[0,\"\\n\"],[4,\"if\",[[20,[\"messages\",\"length\"]]],null,{\"statements\":[[0,\"        \"],[6,\"div\"],[9,\"class\",\"messages\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"messages\"]]],null,{\"statements\":[[0,\"            \"],[6,\"div\"],[10,\"class\",[25,\"concat\",[\"ui floating message \",[25,\"if\",[[19,1,[\"positive\"]],\"positive\",\"warning\"],null]],null],null],[10,\"id\",[26,[[19,1,[\"id\"]]]]],[7],[0,\"\\n              \"],[6,\"p\"],[7],[0,\"\\n\"],[4,\"if\",[[19,1,[\"positive\"]]],null,{\"statements\":[[0,\"                \"],[6,\"i\"],[9,\"class\",\"check icon\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                \"],[6,\"i\"],[9,\"class\",\"exclamation icon\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"                \"],[1,[19,1,[\"text\"]],false],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"        \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[1,[25,\"config-form\",null,[[\"update\",\"display\"],[[25,\"action\",[[19,0,[]],\"configUpdated\"],null],[20,[\"displayConfig\"]]]]],false],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/application.hbs" } });
});

define("pixeditor/templates/competence", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "813LAxF6", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"competence-name\"],[7],[0,\"\\n  \"],[6,\"h1\"],[7],[1,[20,[\"competence\",\"name\"]],false],[0,\" \"],[6,\"div\"],[10,\"class\",[25,\"concat\",[\"skill-mode\",[25,\"if\",[[20,[\"skillMode\"]],\" active\",\"\"],null]],null],null],[7],[0,\"Gestion des acquis\"],[1,[25,\"ui-checkbox\",null,[[\"checked\",\"class\",\"onChange\"],[[20,[\"skillMode\"]],\"toggle skill-mode\",[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"skillMode\"]]],null]],null]]]],false],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"ui top attached borderless labelled icon menu \",[18,\"competenceHidden\"]]]],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"skillMode\"]]],null,{\"statements\":[[0,\"    \"],[6,\"a\"],[9,\"class\",\"left item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"soon\"],null],null],[7],[0,\"\\n      \"],[6,\"i\"],[9,\"class\",\"plus square outline icon\"],[7],[8],[0,\" Nouvel acquis\\n    \"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[6,\"a\"],[9,\"class\",\"left item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"newTemplate\"],null],null],[7],[0,\"\\n      \"],[6,\"i\"],[9,\"class\",\"plus square outline icon\"],[7],[8],[0,\" Nouveau prototype\\n    \"],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[6,\"a\"],[9,\"class\",\"right item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"refresh\"],null],null],[7],[0,\"\\n    \"],[6,\"i\"],[9,\"class\",\"refresh icon\"],[7],[8],[0,\" Actualiser\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"ui attached segment competence \",[18,\"size\"],\" \",[18,\"competenceHidden\"]]]],[7],[0,\"\\n  \"],[1,[25,\"competence-list\",null,[[\"list\",\"itemCount\",\"competenceId\",\"hidden\"],[[20,[\"challenges\"]],[20,[\"challengeCount\"]],[20,[\"competence\",\"id\"]],[25,\"not\",[[20,[\"listView\"]]],null]]]],false],[0,\"\\n  \"],[1,[25,\"competence-grid\",null,[[\"tubes\",\"competenceId\",\"hidden\",\"skillMode\"],[[20,[\"competence\",\"tubes\"]],[20,[\"competence\",\"id\"]],[20,[\"listView\"]],[20,[\"skillMode\"]]]]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[10,\"class\",[26,[\"ui borderless bottom attached labelled icon menu \",[18,\"competenceHidden\"]]]],[7],[0,\"\\n\"],[4,\"if\",[[25,\"not\",[[20,[\"skillMode\"]]],null]],null,{\"statements\":[[0,\"  \"],[6,\"a\"],[10,\"class\",[25,\"concat\",[\"item\",[25,\"if\",[[25,\"not\",[[20,[\"listView\"]]],null],\" active\",\"\"],null]],null],null],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"setGridView\"],null],null],[7],[0,\"\\n    \"],[6,\"i\"],[9,\"class\",\"grid layout icon\"],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"a\"],[10,\"class\",[25,\"concat\",[\"item\",[25,\"if\",[[20,[\"listView\"]],\" active\",\"\"],null]],null],null],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"setListView\"],null],null],[7],[0,\"\\n    \"],[6,\"i\"],[9,\"class\",\"align justify icon\"],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[8],[0,\"\\n\\n\"],[1,[18,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/competence.hbs" } });
});

define("pixeditor/templates/competence/challenge", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "s2+qQHcO", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[10,\"class\",[26,[\"skill-name \",[20,[\"challenge\",\"statusCSS\"]]]]],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"ui menu\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"item header\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"creation\"]]],null,{\"statements\":[[0,\"      \"],[6,\"span\"],[9,\"class\",\"creation\"],[7],[0,\"Nouveau prototype\"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[1,[20,[\"challenge\",\"skillNames\"]],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ui right menu\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"maximized\"]]],null,{\"statements\":[[0,\"        \"],[6,\"a\"],[9,\"class\",\"ui icon item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"minimize\"],null],null],[7],[6,\"i\"],[9,\"class\",\"icon window minimize\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[6,\"a\"],[9,\"class\",\"ui icon item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"maximize\"],null],null],[7],[6,\"i\"],[9,\"class\",\"icon window maximize\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"      \"],[6,\"a\"],[9,\"class\",\"ui icon item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"close\"],null],null],[7],[6,\"i\"],[9,\"class\",\"icon window close\"],[7],[8],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"challenge\",\"illustration\"]]],null,{\"statements\":[[4,\"ui-modal\",null,[[\"class\",\"context\",\"closable\"],[\"template small\",\".main\",true]],{\"statements\":[[0,\"      \"],[6,\"i\"],[9,\"class\",\"close icon\"],[7],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"image content\"],[7],[0,\"\\n        \"],[6,\"img\"],[9,\"class\",\"image\"],[10,\"src\",[26,[[20,[\"challenge\",\"illustration\",\"0\",\"url\"]]]]],[7],[8],[0,\"\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[6,\"div\"],[9,\"class\",\"challenge\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"challenge-data\"],[7],[0,\"\\n    \"],[1,[25,\"challenge-form\",null,[[\"challenge\",\"showIllustration\",\"edition\"],[[20,[\"challenge\"]],[25,\"action\",[[19,0,[]],\"showIllustration\"],null],[20,[\"edition\"]]]]],false],[0,\"\\n\"],[4,\"if\",[[20,[\"copyOperation\"]]],null,{\"statements\":[[0,\"      \"],[1,[25,\"textarea\",null,[[\"value\",\"id\"],[[20,[\"challenge\",\"preview\"]],\"copyZone\"]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"ui vertical compact labeled icon menu challenge-menu\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[0,\"      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"save\"],null],null],[9,\"class\",\"important-action\"],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"save icon\"],[7],[8],[0,\"\\n        Enregistrer\\n      \"],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"mayUpdateCache\"]]],null,{\"statements\":[[0,\"        \"],[6,\"div\"],[9,\"class\",\"item\"],[7],[0,\"\\n          \"],[1,[25,\"ui-checkbox\",null,[[\"label\",\"checked\",\"onChange\"],[\"mise à jour cache\",[20,[\"updateCache\"]],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"updateCache\"]]],null]],null]]]],false],[0,\"\\n        \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"cancelEdit\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"ban icon\"],[7],[8],[0,\"\\n        Annuler\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"preview\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"eye icon\"],[7],[8],[0,\"\\n        Prévisualiser\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"edit\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"edit icon\"],[7],[8],[0,\"\\n        Modifier\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"duplicate\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"copy icon\"],[7],[8],[0,\"\\n        Dupliquer\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"openAirtable\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"table icon\"],[7],[8],[0,\"\\n        Airtable\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"copyLink\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"linkify icon\"],[7],[8],[0,\"\\n        Copier lien\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/competence/challenge.hbs" } });
});

define("pixeditor/templates/competence/new-template", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "XU/mbq3b", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/competence/new-template.hbs" } });
});

define("pixeditor/templates/competence/skill", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Cq8BeBAV", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[10,\"class\",[26,[\"skill-name \",[20,[\"skill\",\"descriptionCSS\"]]]]],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"ui menu\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"item header\"],[7],[1,[20,[\"skill\",\"name\"]],false],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ui right menu\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"maximized\"]]],null,{\"statements\":[[0,\"        \"],[6,\"a\"],[9,\"class\",\"ui icon item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"minimize\"],null],null],[7],[6,\"i\"],[9,\"class\",\"icon window minimize\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[6,\"a\"],[9,\"class\",\"ui icon item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"maximize\"],null],null],[7],[6,\"i\"],[9,\"class\",\"icon window maximize\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"      \"],[6,\"a\"],[9,\"class\",\"ui icon item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"close\"],null],null],[7],[6,\"i\"],[9,\"class\",\"icon window close\"],[7],[8],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"skill-details\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"skill-data\"],[7],[0,\"\\n    \"],[1,[25,\"skill-form\",null,[[\"skill\",\"edition\"],[[20,[\"skill\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"ui vertical compact labeled icon menu skill-menu\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[0,\"      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"save\"],null],null],[9,\"class\",\"important-action\"],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"save icon\"],[7],[8],[0,\"\\n        Enregistrer\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"cancelEdit\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"ban icon\"],[7],[8],[0,\"\\n        Annuler\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[20,[\"skill\",\"template\"]]],null,{\"statements\":[[0,\"        \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"preview\"],null],null],[7],[0,\"\\n          \"],[6,\"i\"],[9,\"class\",\"eye icon\"],[7],[8],[0,\"\\n          Prévisualiser\\n        \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"edit\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"edit icon\"],[7],[8],[0,\"\\n        Modifier\\n      \"],[8],[0,\"\\n      \"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"openAirtable\"],null],null],[7],[0,\"\\n        \"],[6,\"i\"],[9,\"class\",\"table icon\"],[7],[8],[0,\"\\n        Airtable\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/competence/skill.hbs" } });
});

define("pixeditor/templates/components/challenge-form", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "FEhzN3Pm", "block": "{\"symbols\":[],\"statements\":[[6,\"form\"],[9,\"action\",\"\"],[9,\"class\",\"ui form\"],[7],[0,\"\\n  \"],[1,[25,\"form-mde\",null,[[\"title\",\"value\",\"edition\"],[\"Consigne\",[20,[\"challenge\",\"instructions\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-select\",null,[[\"title\",\"value\",\"options\",\"edition\"],[\"Type\",[20,[\"challenge\",\"type\"]],[20,[\"options\",\"types\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-textarea\",null,[[\"title\",\"value\",\"edition\"],[\"Propositions\",[20,[\"challenge\",\"suggestion\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-textarea\",null,[[\"title\",\"value\",\"edition\"],[\"Réponses\",[20,[\"challenge\",\"answers\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[6,\"div\"],[10,\"class\",[25,\"concat\",[\"field\",[25,\"if\",[[20,[\"edition\"]],\"\",\" disabled\"],null]],null],null],[7],[0,\"\\n    \"],[6,\"label\"],[7],[0,\"Tolérance\"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"three fields\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n        \"],[1,[25,\"ui-checkbox\",null,[[\"label\",\"checked\",\"readonly\",\"onChange\"],[\"T1 (espaces/casse/accents)\",[20,[\"challenge\",\"t1\"]],[25,\"not\",[[20,[\"edition\"]]],null],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"challenge\",\"t1\"]]],null]],null]]]],false],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n        \"],[1,[25,\"ui-checkbox\",null,[[\"label\",\"checked\",\"readonly\",\"onChange\"],[\"T2 (ponctuation)\",[20,[\"challenge\",\"t2\"]],[25,\"not\",[[20,[\"edition\"]]],null],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"challenge\",\"t2\"]]],null]],null]]]],false],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n        \"],[1,[25,\"ui-checkbox\",null,[[\"label\",\"checked\",\"readonly\",\"onChange\"],[\"T3 (distance d'édition)\",[20,[\"challenge\",\"t3\"]],[25,\"not\",[[20,[\"edition\"]]],null],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"challenge\",\"t3\"]]],null]],null]]]],false],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[1,[25,\"form-illustration\",null,[[\"title\",\"value\",\"edition\",\"display\"],[\"Illustration\",[20,[\"challenge\",\"illustration\"]],[20,[\"edition\"]],[25,\"action\",[[19,0,[]],[20,[\"showIllustration\"]]],null]]]],false],[0,\"\\n  \"],[1,[25,\"form-files\",null,[[\"title\",\"value\",\"edition\",\"display\"],[\"Pièces jointes\",[20,[\"challenge\",\"attachments\"]],[20,[\"edition\"]],[25,\"action\",[[19,0,[]],[20,[\"showIllustration\"]]],null]]]],false],[0,\"\\n  \"],[1,[25,\"form-select\",null,[[\"title\",\"value\",\"options\",\"edition\"],[\"Type pédagogie\",[20,[\"challenge\",\"pedagogy\"]],[20,[\"options\",\"pedagogy\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-select\",null,[[\"title\",\"value\",\"options\",\"edition\",\"multiple\"],[\"Auteur\",[20,[\"challenge\",\"author\"]],[20,[\"authors\"]],[20,[\"edition\"]],true]]],false],[0,\"\\n  \"],[1,[25,\"form-select\",null,[[\"title\",\"value\",\"options\",\"edition\"],[\"Statut\",[20,[\"challenge\",\"status\"]],[20,[\"options\",\"status\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-select\",null,[[\"title\",\"value\",\"options\",\"edition\"],[\"Déclinable\",[20,[\"challenge\",\"declinable\"]],[20,[\"options\",\"declinable\"]],[20,[\"edition\"]]]]],false],[0,\"\\n\"],[4,\"if\",[[25,\"not\",[[20,[\"edition\"]]],null]],null,{\"statements\":[[0,\"  \"],[1,[25,\"form-input\",null,[[\"value\",\"title\",\"edition\"],[[20,[\"challenge\",\"id\"]],\"Record id\",[20,[\"edition\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},null],[8]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/challenge-form.hbs" } });
});

define("pixeditor/templates/components/competence-grid", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "E9IAWDSy", "block": "{\"symbols\":[\"tube\",\"skill\"],\"statements\":[[6,\"table\"],[9,\"class\",\"ui celled table definition tubes\"],[7],[0,\"\\n  \"],[6,\"tbody\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"tubes\"]]],null,{\"statements\":[[0,\"  \"],[6,\"tr\"],[7],[0,\"\\n    \"],[6,\"td\"],[7],[1,[19,1,[\"name\"]],false],[8],[0,\"\\n\"],[4,\"each\",[[19,1,[\"skills\"]]],null,{\"statements\":[[4,\"if\",[[20,[\"skillMode\"]]],null,{\"statements\":[[4,\"link-to\",[\"competence.skill\",[20,[\"competenceId\"]],[19,2,[\"id\"]]],[[\"tagName\",\"class\"],[\"td\",[25,\"concat\",[\"skill link \",[19,2,[\"descriptionCSS\"]]],null]]],{\"statements\":[[0,\"        \"],[1,[19,2,[\"name\"]],false],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"help\"],[7],[0,\"\\n\"],[4,\"if\",[[19,2,[\"clue\"]]],null,{\"statements\":[[0,\"          \"],[6,\"i\"],[10,\"class\",[25,\"concat\",[\"idea icon \",[19,2,[\"clueCSS\"]]],null],null],[7],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"          \"],[6,\"i\"],[9,\"class\",\"icon\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"        \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[19,2,[\"template\"]]],null,{\"statements\":[[0,\"        \"],[4,\"link-to\",[\"competence.challenge\",[20,[\"competenceId\"]],[19,2,[\"template\",\"id\"]]],[[\"tagName\",\"class\"],[\"td\",[25,\"concat\",[\"skill link \",[19,2,[\"template\",\"statusCSS\"]]],null]]],{\"statements\":[[1,[19,2,[\"name\"]],false],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"alternative\"],[7],[0,\"\\n          \"],[6,\"span\"],[9,\"class\",\"production\"],[7],[1,[19,2,[\"alternativeCount\"]],false],[8],[0,\" - \"],[6,\"span\"],[9,\"class\",\"workbench\"],[7],[1,[19,2,[\"workbenchCount\"]],false],[8],[0,\"\\n\"],[4,\"if\",[[19,2,[\"template\",\"notDeclinable\"]]],null,{\"statements\":[[0,\"            \"],[6,\"span\"],[9,\"class\",\"not-declinable\"],[7],[0,\"NR\"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"        \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[19,2,[]]],null,{\"statements\":[[0,\"        \"],[6,\"td\"],[9,\"class\",\"skill\"],[7],[0,\"\\n          \"],[1,[19,2,[\"name\"]],false],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"alternative\"],[7],[0,\" \"],[8],[0,\"\\n        \"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[6,\"td\"],[7],[8],[0,\"\\n        \"]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[]}]],\"parameters\":[2]},null],[0,\"  \"],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/competence-grid.hbs" } });
});

define("pixeditor/templates/components/competence-list", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "WrVhao7z", "block": "{\"symbols\":[\"item\",\"index\"],\"statements\":[[6,\"div\"],[9,\"class\",\"competence-list-header\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"list-row\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item skillNames\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"sortBy\",\"skillNames\"],null],null],[7],[0,\"Acquis\"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item instructions\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"sortBy\",\"instructions\"],null],null],[7],[0,\"Consigne\"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item type\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"sortBy\",\"type\"],null],null],[7],[0,\"Type\"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item status\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"sortBy\",\"status\"],null],null],[7],[0,\"Statut\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"competence-list-body\"],[7],[0,\"\\n\"],[4,\"ember-collection\",null,[[\"items\",\"cell-layout\"],[[20,[\"list\"]],[25,\"percentage-columns-layout\",[[20,[\"itemCount\"]],[20,[\"columns\"]],40],null]]],{\"statements\":[[4,\"link-to\",[\"competence.challenge\",[20,[\"competenceId\"]],[19,1,[\"id\"]]],[[\"tagName\",\"class\"],[\"div\",\"list-row\"]],{\"statements\":[[0,\"    \"],[6,\"div\"],[9,\"class\",\"list-item\"],[7],[1,[19,1,[\"skillNames\"]],false],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item\"],[7],[1,[19,1,[\"instructions\"]],false],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item\"],[7],[1,[19,1,[\"type\"]],false],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"list-item\"],[7],[1,[19,1,[\"status\"]],false],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[1,2]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/competence-list.hbs" } });
});

define("pixeditor/templates/components/config-form", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "R2/Rmvng", "block": "{\"symbols\":[\"execute\",\"mapper\",\"option\"],\"statements\":[[4,\"ui-modal\",null,[[\"name\",\"class\",\"context\",\"onApprove\",\"onHidden\"],[\"profile\",\"config-form\",\".application\",[25,\"action\",[[19,0,[]],\"saveConfig\"],null],[25,\"action\",[[19,0,[]],\"closed\"],null]]],{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"header\"],[7],[0,\"\\n    Configuration\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"content\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"description\"],[7],[0,\"\\n      \"],[6,\"form\"],[9,\"class\",\"ui form\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n          \"],[6,\"label\"],[7],[0,\"Clé airtable\"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"ui input\"],[7],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"value\"],[[20,[\"airtableKey\"]]]]],false],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n          \"],[6,\"label\"],[7],[0,\"Clé config\"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"ui input\"],[7],[0,\"\\n            \"],[1,[25,\"input\",null,[[\"value\"],[[20,[\"configKey\"]]]]],false],[0,\"\\n          \"],[8],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n          \"],[6,\"label\"],[7],[0,\"Auteur\"],[8],[0,\"\\n\"],[4,\"ui-dropdown\",null,[[\"class\",\"selected\",\"onChange\"],[\"selection\",[20,[\"author\"]],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"author\"]]],null]],null]]],{\"statements\":[[0,\"              \"],[6,\"div\"],[9,\"class\",\"default text\"],[7],[0,\"Sélectionnez votre trigramme\"],[8],[0,\"\\n              \"],[6,\"i\"],[9,\"class\",\"dropdown icon\"],[7],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"menu\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"authors\"]]],null,{\"statements\":[[0,\"                  \"],[6,\"div\"],[10,\"data-value\",[26,[[25,\"map-value\",[[19,2,[]],[19,3,[\"name\"]]],null]]]],[9,\"class\",\"item\"],[7],[0,\"\\n                    \"],[1,[19,3,[\"name\"]],false],[0,\"\\n                  \"],[8],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"              \"],[8],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"        \"],[8],[0,\"\\n        \"],[6,\"h4\"],[9,\"class\",\"ui dividing header\"],[7],[0,\"Paramètres optionnels\"],[8],[0,\"\\n\"],[4,\"ui-accordion\",null,[[\"class\"],[\"field\"]],{\"statements\":[[0,\"          \"],[6,\"div\"],[9,\"class\",\"title\"],[7],[0,\"\\n            \"],[6,\"i\"],[9,\"class\",\"icon dropdown\"],[7],[8],[0,\"\\n            Compte Pix (mise à jour du cache)\\n          \"],[8],[0,\"\\n          \"],[6,\"div\"],[9,\"class\",\"content\"],[7],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n              \"],[6,\"label\"],[7],[0,\"Adresse e-mail\"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"ui input\"],[7],[0,\"\\n                \"],[1,[25,\"input\",null,[[\"value\"],[[20,[\"pixUser\"]]]]],false],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n            \"],[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n              \"],[6,\"label\"],[7],[0,\"Mot de passe\"],[8],[0,\"\\n              \"],[6,\"div\"],[9,\"class\",\"ui input\"],[7],[0,\"\\n                \"],[1,[25,\"input\",null,[[\"value\",\"type\"],[[20,[\"pixPassword\"]],\"password\"]]],false],[0,\"\\n              \"],[8],[0,\"\\n            \"],[8],[0,\"\\n          \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"actions\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ui deny button\"],[7],[0,\"\\n      Annuler\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ui positive right button\"],[7],[0,\"\\n      Enregistrer\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/config-form.hbs" } });
});

define("pixeditor/templates/components/form-files", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "nL17gAqf", "block": "{\"symbols\":[\"file\",\"key\"],\"statements\":[[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n\"],[4,\"if\",[[25,\"or\",[[20,[\"value\",\"length\"]],[20,[\"edition\"]]],null]],null,{\"statements\":[[0,\"  \"],[6,\"label\"],[7],[1,[18,\"title\"],false],[8],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[20,[\"value\",\"length\"]]],null,{\"statements\":[[4,\"each\",[[20,[\"value\"]]],null,{\"statements\":[[0,\"    \"],[6,\"a\"],[10,\"href\",[26,[[19,1,[\"url\"]]]]],[10,\"download\",[26,[[19,1,[\"filename\"]]]]],[9,\"target\",\"_blank\"],[7],[6,\"i\"],[9,\"class\",\"file icon\"],[7],[8],[0,\" \"],[1,[19,1,[\"filename\"]],false],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[0,\"      \"],[6,\"a\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"remove\",[19,2,[]]],null],null],[9,\"class\",\"file-remove\"],[7],[6,\"i\"],[9,\"class\",\"remove icon\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[1,2]},null]],\"parameters\":[]},null],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[4,\"file-upload\",null,[[\"name\",\"onfileadd\"],[\"files\",[25,\"action\",[[19,0,[]],\"add\"],null]]],{\"statements\":[[0,\"    \"],[6,\"a\"],[9,\"class\",\"ui button\"],[7],[0,\"\\n      Ajouter un fichier...\\n    \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/form-files.hbs" } });
});

define("pixeditor/templates/components/form-illustration", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "+pyHJe0Q", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n\"],[4,\"if\",[[25,\"or\",[[20,[\"value\",\"length\"]],[20,[\"edition\"]]],null]],null,{\"statements\":[[0,\"    \"],[6,\"label\"],[7],[1,[18,\"title\"],false],[8],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[20,[\"value\",\"length\"]]],null,{\"statements\":[[4,\"if\",[[20,[\"value\",\"0\",\"url\"]]],null,{\"statements\":[[0,\"      \"],[6,\"img\"],[10,\"src\",[26,[[20,[\"value\",\"0\",\"url\"]]]]],[9,\"alt\",\"\"],[9,\"class\",\"clickable\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],[20,[\"display\"]],\"template\"],null],null],[7],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[1,[20,[\"value\",\"0\",\"file\",\"name\"]],false],[0,\" (\"],[1,[20,[\"value\",\"0\",\"file\",\"size\"]],false],[0,\" octets)\\n\"]],\"parameters\":[]}],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[0,\"      \"],[6,\"a\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],\"remove\"],null],null],[9,\"class\",\"file-remove\"],[7],[6,\"i\"],[9,\"class\",\"remove icon\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[4,\"file-upload\",null,[[\"name\",\"accept\",\"onfileadd\"],[\"illustration\",\"image/*\",[25,\"action\",[[19,0,[]],\"add\"],null]]],{\"statements\":[[0,\"      \"],[6,\"a\"],[9,\"class\",\"ui button\"],[7],[0,\"\\n        Choisir une image...\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null],[8]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/form-illustration.hbs" } });
});

define("pixeditor/templates/components/form-input", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Qi1OAk8g", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[10,\"class\",[25,\"concat\",[\"field\",[25,\"if\",[[20,[\"edition\"]],\"\",\" disabled\"],null]],null],null],[7],[0,\"\\n  \"],[6,\"label\"],[7],[1,[18,\"title\"],false],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"ui input\"],[7],[0,\"\\n    \"],[1,[25,\"input\",null,[[\"value\"],[[20,[\"value\"]]]]],false],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/form-input.hbs" } });
});

define("pixeditor/templates/components/form-mde", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "qktbVqhM", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"field\"],[7],[0,\"\\n    \"],[6,\"label\"],[7],[1,[18,\"title\"],false],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[0,\"        \"],[1,[25,\"simple-mde\",null,[[\"value\",\"change\",\"options\"],[[20,[\"value\"]],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"value\"]]],null]],null],[20,[\"simpleMDEOptions\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[6,\"div\"],[9,\"class\",\"mde-preview\"],[7],[0,\"\\n            \"],[1,[25,\"simple-mde-preview\",[[20,[\"value\"]]],null],false],[0,\"\\n        \"],[8],[0,\"\\n\"]],\"parameters\":[]}],[8]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/form-mde.hbs" } });
});

define("pixeditor/templates/components/form-select", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ziW37dHG", "block": "{\"symbols\":[\"execute\",\"mapper\",\"option\"],\"statements\":[[6,\"div\"],[10,\"class\",[25,\"concat\",[\"field\",[25,\"if\",[[20,[\"edition\"]],\"\",\" disabled\"],null]],null],null],[7],[0,\"\\n  \"],[6,\"label\"],[7],[1,[18,\"title\"],false],[8],[0,\"\\n\"],[4,\"ui-dropdown\",null,[[\"class\",\"selected\",\"onChange\"],[[25,\"concat\",[\"selection\",[25,\"if\",[[20,[\"edition\"]],\"\",\" disabled\"],null],[25,\"if\",[[20,[\"multiple\"]],\" multiple\"],null]],null],[20,[\"value\"]],[25,\"action\",[[19,0,[]],[25,\"mut\",[[20,[\"value\"]]],null]],null]]],{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"default text\"],[7],[8],[0,\"\\n  \"],[6,\"i\"],[9,\"class\",\"dropdown icon\"],[7],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"menu\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"options\"]]],null,{\"statements\":[[0,\"      \"],[6,\"div\"],[10,\"data-value\",[26,[[25,\"map-value\",[[19,2,[]],[19,3,[]]],null]]]],[9,\"class\",\"item\"],[7],[0,\"\\n        \"],[1,[19,3,[]],false],[0,\"\\n      \"],[8],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"  \"],[8],[0,\"\\n\"]],\"parameters\":[1,2]},null],[8]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/form-select.hbs" } });
});

define("pixeditor/templates/components/form-textarea", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "cY/J+XXK", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[10,\"class\",[25,\"concat\",[\"field\",[25,\"if\",[[20,[\"edition\"]],\"\",\" disabled\"],null]],null],null],[7],[0,\"\\n    \"],[6,\"label\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"edition\"]]],null,{\"statements\":[[0,\"            \"],[6,\"a\"],[10,\"onClick\",[25,\"action\",[[19,0,[]],\"toggleMaximized\"],null],null],[10,\"class\",[25,\"concat\",[\"ui compact icon right floated button\",[25,\"if\",[[20,[\"maximized\"]],\" primary\",\" basic\"],null]],null],null],[7],[6,\"i\"],[9,\"class\",\"maximize icon\"],[7],[8],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"        \"],[1,[18,\"title\"],false],[0,\"\\n    \"],[8],[0,\"\\n    \"],[1,[25,\"textarea\",null,[[\"value\",\"rows\",\"readonly\",\"class\"],[[20,[\"value\"]],\"4\",[25,\"not\",[[20,[\"edition\"]]],null],\"attached\"]]],false],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/form-textarea.hbs" } });
});

define("pixeditor/templates/components/main-sidebar", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "OfEgB9MZ", "block": "{\"symbols\":[\"execute\",\"area\",\"competence\"],\"statements\":[[4,\"ui-sidebar\",null,[[\"class\",\"id\",\"dimPage\",\"closable\",\"context\"],[[20,[\"class\"]],\"main-sidebar\",true,true,\".application\"]],{\"statements\":[[6,\"div\"],[9,\"class\",\"header\"],[7],[0,\"Pix Editor\"],[8],[0,\"\\n\"],[4,\"ui-accordion\",null,[[\"class\"],[\"inverted\"]],{\"statements\":[[4,\"each\",[[20,[\"areas\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"title\"],[7],[0,\"\\n    \"],[6,\"i\"],[9,\"class\",\"dropdown icon\"],[7],[8],[0,\"\\n    \"],[1,[19,2,[\"name\"]],false],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"content\"],[7],[0,\"\\n\"],[4,\"each\",[[19,2,[\"competences\"]]],null,{\"statements\":[[0,\"      \"],[4,\"link-to\",[\"competence\",[19,3,[\"id\"]]],[[\"class\",\"invokeAction\"],[\"item\",[25,\"action\",[[19,0,[]],[19,1,[]],\"hide\"],null]]],{\"statements\":[[1,[19,3,[\"name\"]],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"  \"],[8],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[]},null],[6,\"div\"],[9,\"class\",\"ui labelled icon menu\"],[7],[0,\"\\n\"],[6,\"a\"],[9,\"class\",\"item\"],[10,\"onclick\",[25,\"action\",[[19,0,[]],[20,[\"openConfiguration\"]]],null],null],[7],[6,\"i\"],[9,\"class\",\"wrench icon\"],[7],[8],[0,\"Configuration\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"right item\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"author\"]]],null,{\"statements\":[[0,\"    \"],[1,[18,\"author\"],false],[0,\" -\\n\"]],\"parameters\":[]},null],[0,\"   Version \"],[1,[18,\"version\"],false],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/main-sidebar.hbs" } });
});

define("pixeditor/templates/components/skill-form", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "A3SyMPjj", "block": "{\"symbols\":[],\"statements\":[[6,\"form\"],[9,\"action\",\"\"],[9,\"class\",\"ui form\"],[7],[0,\"\\n  \"],[1,[25,\"form-textarea\",null,[[\"title\",\"value\",\"edition\"],[\"Description\",[20,[\"skill\",\"description\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-textarea\",null,[[\"title\",\"value\",\"edition\"],[\"Indice\",[20,[\"skill\",\"clue\"]],[20,[\"edition\"]]]]],false],[0,\"\\n  \"],[1,[25,\"form-select\",null,[[\"title\",\"value\",\"options\",\"edition\"],[\"Statut de l'indice\",[20,[\"skill\",\"status\"]],[20,[\"options\",\"status\"]],[20,[\"edition\"]]]]],false],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/skill-form.hbs" } });
});

define("pixeditor/templates/components/ui-accordion", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "/tp1SnNf", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-accordion.hbs" } });
});

define("pixeditor/templates/components/ui-checkbox", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "rHPD+tEK", "block": "{\"symbols\":[\"&default\"],\"statements\":[[6,\"input\"],[10,\"type\",[18,\"type\"],null],[10,\"name\",[18,\"name\"],null],[10,\"tabindex\",[18,\"tabindex\"],null],[10,\"checked\",[25,\"unbound\",[[20,[\"checked\"]]],null],null],[10,\"disabled\",[25,\"unbound\",[[20,[\"disabled\"]]],null],null],[7],[8],[0,\"\\n\"],[6,\"label\"],[7],[1,[18,\"label\"],false],[8],[0,\"\\n\"],[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-checkbox.hbs" } });
});

define("pixeditor/templates/components/ui-dimmer", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "7B4lOXNM", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-dimmer.hbs" } });
});

define("pixeditor/templates/components/ui-dropdown", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "zqkvwq8T", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null],[25,\"action\",[[19,0,[]],\"mapping\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-dropdown.hbs" } });
});

define("pixeditor/templates/components/ui-embed", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "VWBYdyov", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-embed.hbs" } });
});

define("pixeditor/templates/components/ui-modal", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kq7Z8QbF", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-modal.hbs" } });
});

define("pixeditor/templates/components/ui-nag", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "51GgRKd+", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-nag.hbs" } });
});

define("pixeditor/templates/components/ui-popup", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "cyxoGlPD", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-popup.hbs" } });
});

define("pixeditor/templates/components/ui-progress", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "0yM5wWwY", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-progress.hbs" } });
});

define("pixeditor/templates/components/ui-radio", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "G+MfaBEg", "block": "{\"symbols\":[\"&default\"],\"statements\":[[6,\"input\"],[10,\"type\",[18,\"type\"],null],[10,\"name\",[18,\"name\"],null],[10,\"tabindex\",[18,\"tabindex\"],null],[10,\"checked\",[25,\"unbound\",[[20,[\"checked\"]]],null],null],[10,\"disabled\",[25,\"unbound\",[[20,[\"disabled\"]]],null],null],[7],[8],[0,\"\\n\"],[6,\"label\"],[7],[1,[18,\"label\"],false],[8],[0,\"\\n\"],[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-radio.hbs" } });
});

define("pixeditor/templates/components/ui-rating", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "BXu6W0H2", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-rating.hbs" } });
});

define("pixeditor/templates/components/ui-search", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "g9vnLWzU", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-search.hbs" } });
});

define("pixeditor/templates/components/ui-shape", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "gXumUTY5", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-shape.hbs" } });
});

define("pixeditor/templates/components/ui-sidebar", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "xz3cqqKJ", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-sidebar.hbs" } });
});

define("pixeditor/templates/components/ui-sticky", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "k32Iog15", "block": "{\"symbols\":[\"&default\"],\"statements\":[[11,1,[[25,\"action\",[[19,0,[]],\"execute\"],null]]]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/components/ui-sticky.hbs" } });
});

define("pixeditor/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "dh6QboiQ", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/index.hbs" } });
});

define("pixeditor/templates/loading", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kQwlhBwK", "block": "{\"symbols\":[],\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"ui page dimmer inverted active\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"ui loader\"],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "pixeditor/templates/loading.hbs" } });
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

if (!runningTests) {
  require("pixeditor/app")["default"].create({"version":"1.9.0","name":"pixeditor"});
}
//# sourceMappingURL=pixeditor.map

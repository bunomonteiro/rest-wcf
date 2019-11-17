/*global jQuery, Handlebars, Router */
jQuery(function ($) {
    'use strict';

    Handlebars.registerHelper('eq', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    var ENTER_KEY = 13;
    var ESCAPE_KEY = 27;

    var url = {
        create: "http://localhost:7476/services/rest.svc/api/create",
        list: "http://localhost:7476/services/rest.svc/api/list",
        update: "http://localhost:7476/services/rest.svc/api/update",
        updateBatch: "http://localhost:7476/services/rest.svc/api/updatebatch",
        delete: "http://localhost:7476/services/rest.svc/api/delete"
    }

    var util = {
        uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }

            return uuid;
        },
        pluralize: function (count, word) {
            return count === 1 ? word : word + 's';
        },
    };

    var App = {
        init: function () {
            var _this = this;
            function _init(data) {
                _this.todos = data;
                _this.todoTemplate = Handlebars.compile($('#todo-template').html());
                _this.footerTemplate = Handlebars.compile($('#footer-template').html());
                _this.bindEvents();
                new Router({
                    '/:filter': function (filter) {
                        _this.filter = filter;
                        _this.render();
                    }.bind(_this)
                }).init('/all');
            }

            $.get(url.list)
                .done(function (data) {
                    _init(data);
                }).fail(function () {
                    _init([]);
                });
        },
        bindEvents: function () {
            $('.new-todo').on('keyup', this.create.bind(this));
            $('.toggle-all').on('change', this.toggleAll.bind(this));
            $('.footer').on('click', '.clear-completed', this.destroyCompleted.bind(this));
            $('.todo-list')
                .on('change', '.toggle', this.toggle.bind(this))
                .on('dblclick', 'label', this.editingMode.bind(this))
                .on('keyup', '.edit', this.editKeyup.bind(this))
                .on('focusout', '.edit', this.update.bind(this))
                .on('click', '.destroy', this.destroy.bind(this));
        },
        render: function () {
            var todos = this.getFilteredTodos();
            $('.todo-list').html(this.todoTemplate(todos));
            $('.main').toggle(todos.length > 0);
            $('.toggle-all').prop('checked', this.getActiveTodos().length === 0);
            this.renderFooter();
            $('.new-todo').focus();
        },
        renderFooter: function () {
            var todoCount = this.todos.length;
            var activeTodoCount = this.getActiveTodos().length;
            var template = this.footerTemplate({
                activeTodoCount: activeTodoCount,
                activeTodoWord: util.pluralize(activeTodoCount, 'item'),
                completedTodos: todoCount - activeTodoCount,
                filter: this.filter
            });

            $('.footer').toggle(todoCount > 0).html(template);
        },
        toggleAll: function (e) {
            var _this = this;
            var isChecked = $(e.target).prop('checked');
            var tempTodos = [];
            this.todos.forEach(function (todo) {
                tempTodos.push({
                    Id: todo.Id,
                    Completed: isChecked,
                    Title: todo.Title
                });
            });

            $.ajax({
                type: 'PUT',
                url: url.updateBatch,
                data: JSON.stringify({ todoList: tempTodos }),
                contentType: 'application/json',
                processData: true
            }).done(function () {
                _this.todos.forEach(function (todo) {
                    todo.Completed = isChecked;
                });
                _this.render();
            }).fail(function () { });
        },
        getActiveTodos: function () {
            return this.todos.filter(function (todo) {
                return !todo.Completed;
            });
        },
        getCompletedTodos: function () {
            return this.todos.filter(function (todo) {
                return todo.Completed;
            });
        },
        getFilteredTodos: function () {
            if (this.filter === 'active') {
                return this.getActiveTodos();
            }

            if (this.filter === 'completed') {
                return this.getCompletedTodos();
            }

            return this.todos;
        },
        destroyCompleted: function () {
            var _this = this;
            var ids = _this.getCompletedTodos().map(i => i.Id);

            $.ajax({
                type: 'DELETE',
                url: url.delete,
                data: JSON.stringify({ ids: ids }),
                contentType: 'application/json',
                processData: true
            }).done(function (data, textStatus, jqXHR) {
                _this.todos = _this.getActiveTodos();
                _this.render();
            }).fail(function (jqXHR, textStatus, errorThrown) { });
        },
        // accepts an element from inside the `.item` div and
        // returns the corresponding index in the `todos` array
        getIndexFromEl: function (el) {
            var id = $(el).closest('li').data('id');
            var todos = this.todos;
            var i = todos.length;

            while (i--) {
                if (todos[i].Id === id) {
                    return i;
                }
            }
        },
        create: function (e) {
            var _this = this;
            var $input = $(e.target);
            var val = $input.val().trim();

            if (e.which !== ENTER_KEY || !val) {
                return;
            }

            $.ajax({
                type: 'POST',
                url: url.create,
                data: JSON.stringify({ todo: { Title: val, Completed: false } }),
                contentType: 'application/json',
                dataType: "JSON",
                processData: true
            }).done(function (todo) {
                _this.todos.push(todo);
                $input.val('');
                _this.render();
            }).fail(function () { });
        },
        toggle: function (e) {
            var _this = this;
            var i = this.getIndexFromEl(e.target);
            var todo = _this.todos[i];

            $.ajax({
                type: 'PUT',
                url: url.update,
                data: JSON.stringify({ todo: { Id: todo.Id, Title: todo.Title, Completed: !todo.Completed } }),
                contentType: 'application/json',
                processData: true
            }).done(function () {
                _this.todos[i].Completed = !todo.Completed;
                _this.render();
            }).fail(function () { });
        },
        editingMode: function (e) {
            var $input = $(e.target).closest('li').addClass('editing').find('.edit');
            // puts caret at end of input
            var tmpStr = $input.val();
            $input.val('');
            $input.val(tmpStr);
            $input.focus();
        },
        editKeyup: function (e) {
            if (e.which === ENTER_KEY) {
                e.target.blur();
            }

            if (e.which === ESCAPE_KEY) {
                $(e.target).data('abort', true).blur();
            }
        },
        update: function (e) {
            var _this = this;
            var el = e.target;
            var $el = $(el);
            var val = $el.val().trim();

            if ($el.data('abort')) {
                $el.data('abort', false);
                _this.render();
            } else if (!val) {
                this.destroy(e);
                return;
            } else {
                var todo = this.todos[this.getIndexFromEl(el)];

                $.ajax({
                    type: 'PUT',
                    url: url.update,
                    data: JSON.stringify({ todo: { Id: todo.Id, Title: val, Completed: todo.Completed } }),
                    contentType: 'application/json',
                    processData: true
                }).done(function (data, textStatus, jqXHR) {
                    _this.todos[_this.getIndexFromEl(el)].Title = val;
                    _this.render();
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    _this.render();
                });
            }
        },
        destroy: function (e) {
            var _this = this;
            var todo = _this.todos[_this.getIndexFromEl(e.target)];

            $.ajax({
                type: 'DELETE',
                url: url.delete,
                data: JSON.stringify({ ids: [todo.Id] }),
                contentType: 'application/json',
                processData: true
            }).done(function (data, textStatus, jqXHR) {
                _this.todos.splice(_this.getIndexFromEl(e.target), 1);
                _this.render();
            }).fail(function (jqXHR, textStatus, errorThrown) { });
        }
    };

    App.init();
});
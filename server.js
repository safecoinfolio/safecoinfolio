/**
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var ip = container.env['OPENSHIFT_VERTX_IP'] || '127.0.0.1';
var port = parseInt(container.env['OPENSHIFT_VERTX_PORT'] || 8080);

var routeMatcher = new vertx.RouteMatcher();
//var Yoke = require('yoke/Yoke');
//var yoke = new Yoke();

routeMatcher.get('/', function(req) {
    req.response.sendFile('webroot/index.html');
});

routeMatcher.get('/static/:type/:filename', function(req) {
    var type = req.params().get('type');
    if (['css','js','images'].indexOf(type) > -1) {
        req.response.sendFile('webroot/static/' + type + '/' + req.params().get('filename'));
    }
});

routeMatcher.get('/:htmlfile', function(req) {
    req.response.sendFile('webroot/' + req.params().get('htmlfile'), 'webroot/static/html/404.html');
});

routeMatcher.noMatch(function(req) {
    req.response.sendFile('webroot/static/html/404.html');
});

vertx.createHttpServer().requestHandler(routeMatcher).listen(port, ip, function(err) {
    if (!err) {
      console.log('Successfully listening on ' + ip + ':' + port);
    } else {
      console.log('Could not bind to ' + ip + ':' + port + '. Error: ' + err);
    }
});

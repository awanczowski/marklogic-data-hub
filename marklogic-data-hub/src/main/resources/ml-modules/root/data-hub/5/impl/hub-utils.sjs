/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

function capitalize(str) {
  return (str) ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function deleteDocument(docUri, database) {
  xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-single-delete.sjs', {docUri}, {
    database: xdmp.database(database),
    commit: 'auto',
    update: 'true',
    ignoreAmps: true
  });
}

/**
 * @param event
 * @param message Expected to be a string; if you have JSON, call hubTraceJson
 */
function hubTrace(event, message) {
  xdmp.trace(event, `[Request:${xdmp.request()}] ${message}`);
}

/**
 * Convenience method for logging a JSON node.
 * @param event
 * @param json
 */
function hubTraceJson(event, json) {
  hubTrace(event, xdmp.toJsonString(json));
}

/**
 * @param message {string}
 */
function warn(message) {
  console.warn(`[Request:${xdmp.request()}] ${message}`);
}

/**
 * @param message {string}
 */
 function error(message, theError) {
  console.error(`[Request:${xdmp.request()}] ${message}`, theError);
}

function invokeFunction(queryFunction, database) {
  return xdmp.invokeFunction(queryFunction, {
    commit: 'auto',
    update: 'false',
    ignoreAmps: true,
    database: database ? xdmp.database(database) : xdmp.database()
  })
}

function normalizeToSequence(value) {
  if (value instanceof Sequence) {
    return value;
  } else if (value === null || value === undefined) {
    return Sequence.from([]);
  } else if (value.constructor === Array || (value instanceof Node && xdmp.nodeKind(value) === 'array')) {
    return Sequence.from(value);
  } else {
    return Sequence.from([value]);
  }
}

function normalizeToArray(value) {
  if (value instanceof Sequence) {
    return value.toArray();
  } else if (Array.isArray(value)) {
    return value;
  } else {
    return [value];
  }
}

function parsePermissions(permissionsString = "") {
  try {
    let permissionParts = permissionsString.split(",").filter((val) => val);
    let permissions = [];
    let permissionRoles = permissionParts.filter((val, index) => !(index % 2));
    let permissionCapabilities = permissionParts.filter((val, index) => index % 2);
    for (let i = 0; i < permissionRoles.length; i++) {
      permissions.push(xdmp.permission(permissionRoles[i], permissionCapabilities[i]));
    }
    return permissions;
  } catch (e) {
    throw Error("Unable to parse permissions: " + permissionsString + "; it must fit the pattern of role1,capability1,role2,capability2,etc; cause: " + e.stack);
  }
}

function queryToContentDescriptorArray(query, options = {}, database) {
  let contentArray = [];
  invokeFunction(function () {
    let results = cts.search(query, cts.indexOrder(cts.uriReference()));

    for (let doc of results) {
      contentArray.push({
        uri: xdmp.nodeUri(doc),
        value: doc,
        context: {
          metadata: xdmp.nodeMetadata(doc),
          permissions: options.permissions ? parsePermissions(options.permissions) : xdmp.nodePermissions(doc),
          // provide original collections, should a step like to read them
          originalCollections: xdmp.nodeCollections(doc)
        }
      });
    }
  }, database);
  return contentArray;
}

/**
 * This was originally addressed via DHFPROD-3193 - based on an update to ML 10.0-2, "lang" must now be used instead
 * of "language".
 *
 * @param artifact
 */
function replaceLanguageWithLang(artifact) {
  if (artifact.language) {
    artifact.lang = artifact.language;
    delete artifact.language;
  }
}

function writeDocument(docUri, content, permissions, collections, database) {
  return fn.head(xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-single-write.sjs', {
    content: content,
    docUri: docUri,
    permissions: permissions,
    collections: normalizeToArray(collections)
  }, {
    database: xdmp.database(database),
    commit: 'auto',
    update: 'true',
    ignoreAmps: false
  }));
}

/**
 * ML 9 does not support Object.values(). This function serves as its replacement so that datahub can be supported in ML 9
 * @param object
 * @returns  an array of a given object's property values
 */
function getObjectValues(object){
    let valuesArray = [];
    for (const property in object) {
      valuesArray.push(object[property]);
    }
    return valuesArray;
}

function evalInDatabase(script, database) {
  return xdmp.eval(script, null, {database: xdmp.database(database)})
}


function getErrorMessage(e) {
  let errorMessage = e.message;
  if (e.data != null && e.data.length > 0) {
    if(isNaN(Number(e.data[0]))){
      errorMessage += ": " + e.data[0];
    }
    else if(e.data.length > 1){
      errorMessage += ": " + e.data[1];
    }
  }
  return errorMessage;
}

module.exports = {
  capitalize,
  deleteDocument,
  error,
  evalInDatabase: module.amp(evalInDatabase),
  getErrorMessage,
  getObjectValues,
  hubTrace,
  hubTraceJson,
  invokeFunction,
  normalizeToArray,
  normalizeToSequence,
  parsePermissions,
  queryToContentDescriptorArray,
  replaceLanguageWithLang,
  warn,
  writeDocument
};

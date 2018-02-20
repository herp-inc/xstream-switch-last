"use strict";
exports.__esModule = true;
var xstream_1 = require("xstream");
function default_1(input) {
    var currentListening = null;
    // To be overwritten in `start`
    var childListener = {};
    var inputListener = {};
    var parentCompleted = true;
    var childCompleted = true;
    return xstream_1.Stream.create({
        start: function (parentListener) {
            inputListener = {
                next: function (newStream) {
                    if (currentListening !== null) {
                        currentListening.removeListener(childListener);
                    }
                    childListener = {
                        next: function (a) {
                            childCompleted = false;
                            // Emit child value as value in self
                            return parentListener.next(a);
                        },
                        error: parentListener.error.bind(parentListener),
                        complete: function () {
                            childCompleted = true;
                            if (currentListening !== null) {
                                currentListening.removeListener(childListener);
                            }
                            currentListening = null;
                            /* Complete only when both parent and child are completed */
                            if (parentCompleted) {
                                parentListener.complete();
                            }
                        }
                    };
                    newStream.addListener(childListener);
                    currentListening = newStream;
                },
                error: parentListener.error.bind(parentListener),
                complete: function () {
                    parentCompleted = true;
                    if (childCompleted) {
                        parentListener.complete();
                    }
                }
            };
            input.addListener(inputListener);
        },
        stop: function () {
            if (currentListening !== null) {
                currentListening.removeListener(childListener);
            }
            input.removeListener(inputListener);
        }
    });
}
exports["default"] = default_1;
;

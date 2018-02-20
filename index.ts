import { Stream } from 'xstream';

export default function<T>(input: Stream<Stream<T>>): Stream<T> {
    let currentListening: Stream<T> | null = null;

    // To be overwritten in `start`
    let childListener = {};
    let inputListener = {};
    let parentCompleted = true;
    let childCompleted = true;

    return Stream.create({
        start: function(parentListener) {
            inputListener = {
                next: (newStream: Stream<T>)=> {
                    if (currentListening !== null) {
                        currentListening.removeListener(childListener);
                    }
                    childListener = {
                        next: function(a: T){
                            childCompleted = false;
                            // Emit child value as value in self
                            return parentListener.next(a)
                        },
                        error: parentListener.error.bind(parentListener),
                        complete: ()=> {
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
                    }
                    newStream.addListener(childListener);
                    currentListening = newStream;
                },
                error: parentListener.error.bind(parentListener),
                complete: ()=> {
                    parentCompleted = true;
                    if (childCompleted) {
                        parentListener.complete();
                    }
                }
            };
            input.addListener(inputListener);
        },
        stop: function() {
            if (currentListening !== null) {
                currentListening.removeListener(childListener);
            }
            input.removeListener(inputListener);
        },
    });
};

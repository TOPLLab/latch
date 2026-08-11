export enum Outcome {
    uncommenced = 'not started',  // test hasn't started
    succeeded = 'success',        // test succeeded
    failed = 'failure: ',          // test failed
    timedout = 'timed out',        // test failed
    error = 'error: ',             // test was unable to complete
    skipped = 'skipped'            // test has failing dependencies
}

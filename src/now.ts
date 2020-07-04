import moment from "moment";

// helpful to have a helper on this so it can be mocked if i ever decide to
// add unit tests
export const nowMs = () => moment().valueOf();

import moment from "moment";

let hasRetrievedOffset = false;
let offset = 0;

// helpful to have a helper on this so it can be mocked if i ever decide to
// add unit tests
export const nowMs = () => {
  if (!hasRetrievedOffset) {
    hasRetrievedOffset = true;
    const startedAt = moment().valueOf();
    fetch("http://worldtimeapi.org/api/ip")
      .then((val) => val.json())
      .then((body) => {
        offset =
          (moment(body.datetime).valueOf() -
            2 * moment().valueOf() +
            startedAt) /
          2;
        console.warn(`my time offset is ${offset}`);
      });
  }
  return moment().valueOf() + offset;
};

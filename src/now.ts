import moment from "moment";

let lastRetrievedOffsetMs = 0;
const RETRIEVE_OFFSET_INTERVAL = 5 * 1000;
let offset = 0;

const getServerTime = async () => {
  const startedAt = moment().valueOf();
  return fetch("http://worldtimeapi.org/api/ip")
    .then((val) => val.json())
    .then((body) => {
      const now = moment().valueOf();
      const latency = now - startedAt;
      const serverTime = moment(body.datetime).valueOf();
      return serverTime + latency / 2;
    });
};

// helpful to have a helper on this so it can be mocked if i ever decide to
// add unit tests
export const nowMs = () => {
  const now = moment().valueOf();
  if (lastRetrievedOffsetMs + RETRIEVE_OFFSET_INTERVAL < now) {
    lastRetrievedOffsetMs = now;
    getServerTime().then((time) => {
      offset = time - moment().valueOf();
      console.warn(`my time offset is ${offset}`);
    });
  }
  return now + offset;
};

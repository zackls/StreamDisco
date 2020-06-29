import { nowMs } from "./now";
import React from "react";
import Player, { CATCHUP_WINDOW_INITIAL_MS } from "./Player";
import { render, configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import ReactPlayer from "react-player";

configure({ adapter: new Adapter() });

let mockNowMs = 1000000;
jest.useFakeTimers();
jest.mock("./now", () => ({
  nowMs: () => mockNowMs,
}));
const triggerOnBuffer = jest.fn();
const triggerOnReady = jest.fn();
const triggerOnProgress = jest.fn();
const triggerOnStart = jest.fn();
const reactPlayerPropCalls = jest.fn();
jest.mock("react-player", () => (props: any) => {
  const { onBuffer, onReady, onProgress, onStart } = props;
  reactPlayerPropCalls(props);
  triggerOnBuffer.mockImplementation(onBuffer);
  triggerOnReady.mockImplementation(onReady);
  triggerOnProgress.mockImplementation(onProgress);
  triggerOnStart.mockImplementation(onStart);
  return "ReactPlayerMock";
});

const seekToMock = jest.fn<
  void,
  [number, "seconds" | "fraction" | undefined]
>();

const setupTest = (
  testProps: Partial<
    Pick<Player["props"], "url" | "volume" | "startedAtMs">
  > = {}
) => {
  const { url = "test", volume = 1, startedAtMs = nowMs() } = testProps;
  const onBufferingMock = jest.fn();
  const onPlayingMock = jest.fn();
  const onWaitingMock = jest.fn();
  const onFinishedMock = jest.fn();
  const player = render(
    <Player
      url={url}
      volume={volume}
      startedAtMs={startedAtMs}
      onBuffering={onBufferingMock}
      onPlaying={onPlayingMock}
      onWaiting={onWaitingMock}
      onFinished={onFinishedMock}
      playerRef={{
        current: {
          seekTo: seekToMock as (
            amount: number,
            type?: "seconds" | "fraction" | undefined
          ) => void,
        } as ReactPlayer,
      }}
    />
  );
  triggerOnBuffer.mockClear();
  triggerOnReady.mockClear();
  triggerOnProgress.mockClear();
  triggerOnStart.mockClear();
  return {
    player: player,
    onBufferingMock,
    onPlayingMock,
    onWaitingMock,
    onFinishedMock,
  };
};

describe("startup", () => {
  test("handles load before start", () => {
    // if we started in the past, we should immediately begin playing at the
    // correct time in the future
    const { onWaitingMock } = setupTest({
      startedAtMs: nowMs() - 1000,
    });
    expect(seekToMock).toBeCalledTimes(1);
    expect(seekToMock).toBeCalledWith(1, "seconds");
    expect(onWaitingMock).toBeCalledTimes(1);
  });
  test("handles load after start", () => {
    // if we will start in the future, we should simply wait
    setupTest({
      startedAtMs: nowMs() + 1000,
    });
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).toBeCalledWith(expect.any(Function), 1000);
  });
});

describe("playing", () => {
  test("calls callbacks on events", () => {
    const { onBufferingMock, onPlayingMock } = setupTest();

    // on buffering event from react-player should immediately trigger a
    // buffering event
    expect(onBufferingMock).toBeCalledTimes(0);
    triggerOnBuffer();
    expect(onBufferingMock).toBeCalledTimes(1);

    // on ready event from react-player should immediately trigger a playing
    // event
    expect(onPlayingMock).toBeCalledTimes(0);
    triggerOnStart();
    expect(onPlayingMock).toBeCalledTimes(1);
  });

  // couldnt figure out how to get enzyme to handle a subcomponent's lifecycle,
  // decided to leave these tests unfinished for now
  test("handles perfect seek", () => {
    const { player } = setupTest();

    triggerOnBuffer();
    // expect(player.state("playing")).toBeFalsy();

    // this is kind of implementation-specific but is justified by the other
    // tests that test cases above and below this value
    mockNowMs += CATCHUP_WINDOW_INITIAL_MS;

    // this should start us playing since we readied at the ideal time
    triggerOnReady();

    // expect(player.state("playing")).toBeTruthy();
  });
  test("handles 'overseek'", () => {});
  test("retriggers seeks on underseek", () => {});
  test("eventually catches up to current time on seek", () => {});
});

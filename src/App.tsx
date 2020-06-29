import React from "react";
import data from "./data";
import Page from "./Page";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { streamTitleToHashLocation, mod } from "./util";
import { withCookies, Cookies } from "react-cookie";

// maybe eventually store in redux if i decide its worth it
interface State {
  volume: number;
  currentStreamIndex: number;
}
type PersistedState = Pick<State, "volume">;

interface OwnProps {}

type Props = OwnProps & RouteComponentProps & { cookies: Cookies };

// since this app is so small+shallow, this component's state serves as the main
// storage
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const persistedState: PersistedState = props.cookies.getAll();

    let startingStreamIndex = data.streams.findIndex(
      ({ title }) =>
        `#${streamTitleToHashLocation(title)}` === this.props.location.hash
    );
    if (startingStreamIndex === -1) {
      startingStreamIndex = 0;
      const defaultHash = streamTitleToHashLocation(data.streams[0].title);
      this.props.history.push(`#${defaultHash}`);
    }

    this.state = {
      volume: Number(persistedState.volume) || 1,
      currentStreamIndex: startingStreamIndex,
    };
  }

  render() {
    return (
      <Page
        volume={this.state.volume}
        stream={data.streams[this.state.currentStreamIndex]}
        onClickNext={() => {
          const nextStreamIndex = mod(
            this.state.currentStreamIndex + 1,
            data.streams.length
          );
          const nextStream = data.streams[nextStreamIndex];
          this.props.history.push(
            `#${streamTitleToHashLocation(nextStream.title)}`
          );
          this.setState({
            currentStreamIndex: nextStreamIndex,
          });
        }}
        onClickPrev={() => {
          const prevStreamIndex = mod(
            this.state.currentStreamIndex - 1,
            data.streams.length
          );
          const prevStream = data.streams[prevStreamIndex];
          this.props.history.push(
            `#${streamTitleToHashLocation(prevStream.title)}`
          );
          this.setState({
            currentStreamIndex: prevStreamIndex,
          });
        }}
      ></Page>
    );
  }
}

export default withRouter(withCookies(App));

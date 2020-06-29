import React from "react";

interface State {
  touched: boolean;
}

// small button wrapper
// from: https://stackoverflow.com/questions/50995410/create-touchableopacity-for-reactjs-without-using-react-native-web
export class Button extends React.Component<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  State
> {
  state = {
    touched: false,
  };
  toggleTouched = () => {
    this.setState((prevState) => ({
      touched: !prevState.touched,
    }));
  };

  handleMouseUp = () => {
    // Handle smooth animation when clicking without holding
    setTimeout(() => {
      this.setState({ touched: false });
    }, 150);
  };

  render() {
    return (
      <button
        className={this.state.touched ? "btn touched" : "btn"}
        onMouseDown={this.toggleTouched}
        onMouseUp={this.handleMouseUp}
        {...this.props}
      />
    );
  }
}
